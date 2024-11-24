import { z } from "zod"
import { load } from "cheerio"
import { remark } from "remark"
import html from "remark-html"
import { Region } from "../data/regions"

const toFormattedDateTimeString = (time: string, locale: string) => {
  const date = new Date(time)
  return date.toLocaleString(locale, {
    weekday: "long",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    hour12: false,
    timeZone: "CET",
  })
}

const nextDataStructure = z.object({
  props: z.object({
    pageProps: z.object({
      __APOLLO_STATE__: z.record(z.string(), z.unknown()),
    }),
  }),
})

const eventStructure = z.object({
  title: z.string(),
  description: z.string(),
  eventUrl: z.string().url(),
  eventType: z
    .string()
    .pipe(z.enum(["PHYSICAL", "ONLINE", "UNKNOWN"]).catch("UNKNOWN")),
  status: z
    .string()
    .pipe(z.enum(["ACTIVE", "PAST", "UNKNOWN"]).catch("UNKNOWN")),
  dateTime: z.string().datetime({ offset: true }),
  venue: z
    .object({
      __ref: z.string(),
    })
    .nullable(),
  featuredEventPhoto: z
    .object({
      __ref: z.string(),
    })
    .nullable(),
  going: z.object({
    totalCount: z.number(),
  }),
  'rsvps({"first":5})': z.object({
    edges: z.array(
      z.object({
        node: z.object({
          __ref: z.string(),
        }),
      }),
    ),
  }),
})

const groupStructure = z.object({
  description: z.string(),
  stats: z.object({
    memberCounts: z.object({
      all: z.number(),
    }),
  }),
  organizer: z.object({
    __ref: z.string(),
  }),
  keyGroupPhoto: z.object({ __ref: z.string() }),
  lat: z.number(),
  lon: z.number(),
})
const rsvpsStructure = z.array(
  z.object({
    member: z.object({
      __ref: z.string(),
    }),
  }),
)
const memberStructure = z.object({
  name: z.string(),
  memberPhoto: z
    .object({
      __ref: z.string(),
    })
    .nullable(),
})
const membersStructure = z.array(memberStructure)
const venueStructure = z.object({
  name: z.string(),
})
const photoInfoStructure = z.object({
  highResUrl: z.string(),
})

function parseFirstFiveAttendees(
  event: z.infer<typeof eventStructure>,
  data: Record<string, unknown>,
) {
  const first5rsvps = event['rsvps({"first":5})']
  const rsvpRefs = first5rsvps.edges.map((edge) => edge.node.__ref)
  const rsvpUnknowns = rsvpRefs.map((ref) => data[ref])
  const parsedRsvps = rsvpsStructure.safeParse(rsvpUnknowns)
  if (!parsedRsvps.success) {
    console.error(
      `Failed to parse rsvps for ${event.eventUrl}:`,
      parsedRsvps.error.format(),
      rsvpUnknowns,
    )
    return []
  }
  const membersUnknown = parsedRsvps.data.map((ref) => data[ref.member.__ref])
  const parsedMembers = membersStructure.safeParse(membersUnknown)
  if (!parsedMembers.success) {
    console.error(
      `Failed to parse members for ${event.eventUrl}:`,
      parsedMembers.error.format(),
      membersUnknown,
    )
    return []
  }
  return parsedMembers.data.flatMap((member) => {
    const ref = member.memberPhoto?.__ref ?? null
    const parsedPhotoInfo = photoInfoStructure.safeParse(ref && data[ref])
    // If a member doesn't have a photo, just filter them out.
    if (!parsedPhotoInfo.success) {
      return []
    }
    return {
      name: member.name,
      photoUrl: parsedPhotoInfo.data.highResUrl,
    }
  })
}

function parseVenue(
  event: z.infer<typeof eventStructure>,
  data: Record<string, unknown>,
) {
  const venueRef = event.venue
  if (!venueRef) {
    return null
  }
  const venueUnknown = data[venueRef.__ref]
  const parsedVenue = venueStructure.safeParse(venueUnknown)
  if (!parsedVenue.success) {
    console.error(
      `Failed to parse venue for ${event.eventUrl}:`,
      parsedVenue.error.format(),
      venueUnknown,
    )
    return null
  }
  return parsedVenue.data.name
}

function parseEventPhoto(
  event: z.infer<typeof eventStructure>,
  data: Record<string, unknown>,
) {
  const featuredEventPhotoRef = event.featuredEventPhoto
  if (!featuredEventPhotoRef) {
    return null
  }
  const eventPhotoUnknown = data[featuredEventPhotoRef.__ref]
  const parsedEventPhoto = photoInfoStructure.safeParse(eventPhotoUnknown)
  if (!parsedEventPhoto.success) {
    console.error(
      `Failed to parse event photo for ${event.eventUrl}:`,
      parsedEventPhoto.error.format(),
      eventPhotoUnknown,
    )
    return null
  }
  return parsedEventPhoto.data.highResUrl
}

function parseGroupPhoto(
  group: z.infer<typeof groupStructure>,
  data: Record<string, unknown>,
) {
  const keyGroupPhotoRef = group.keyGroupPhoto
  if (!keyGroupPhotoRef) {
    return null
  }
  const groupPhotoUnknown = data[keyGroupPhotoRef.__ref]
  const parsedEventPhoto = photoInfoStructure.safeParse(groupPhotoUnknown)
  if (!parsedEventPhoto.success) {
    console.error(
      `Failed to parse event photo:`,
      parsedEventPhoto.error.format(),
      groupPhotoUnknown,
    )
    return null
  }
  return parsedEventPhoto.data.highResUrl
}

export async function getRegionWithEvents(region: Region, locale: string) {
  const regionMeetupUrl = `https://www.meetup.com/${region.meetupName}`
  const data = await getPageData(regionMeetupUrl)

  // The data is a map of keys to objects, where the keys are the GraphQL objects with their IDs.
  // Since we only want events, we're filtering where the key starts with 'Event:'.
  const [, groupData] = Object.entries(data).find(([key]) =>
    key.startsWith("Group:"),
  )!

  // Uae flatMap to noop the error case, by returning an array.
  const parsedGroup = groupStructure.safeParse(groupData)
  if (!parsedGroup.success) {
    console.error(
      `Failed to parse event for ${region.name}:`,
      parsedGroup.error.format(),
      groupData,
    )
    return null
  }
  
  // Check if the region is Sogn and set the correct lat/lng
  const location = region.name === "Sogn" ? { lat: 61.5, lng: 7.5 } : { lat: parsedGroup.data.lat, lng: parsedGroup.data.lon };

  const organizerRef = parsedGroup.data.organizer.__ref
  const organizerData = data[organizerRef]
  const parsedOrganizer = memberStructure.safeParse(organizerData)
  const organizer = parsedOrganizer.success
    ? {
        id: organizerRef,
        name: parsedOrganizer.data.name,
        photoUrl: (() => {
          const photoRef = parsedOrganizer.data?.memberPhoto?.__ref
          const parsedPhotoInfo = photoInfoStructure.safeParse(
            photoRef && data[photoRef],
          )
          return parsedPhotoInfo.success
            ? parsedPhotoInfo.data.highResUrl
            : "/default-avatar.png"
        })(),
        profileUrl: `https://www.meetup.com/members/${organizerRef.split(":")[1]}/`,
      }
    : null

  // Use remark to convert markdown into HTML string
  const processedContent = (
    await remark().use(html).process(parsedGroup.data.description)
  ).toString()

  const photo = parseGroupPhoto(parsedGroup.data, data)

  // The data is a map of keys to objects, where the keys are the GraphQL objects with their IDs.
  // Since we only want events, we're filtering where the key starts with 'Event:'.
  const events = Object.entries(data)
    .filter(([key]) => key.startsWith("Event:"))
    // Uae flatMap to noop the error case, by returning an array.
    .flatMap(([, eventData]) => {
      const parsedEvent = eventStructure.safeParse(eventData)
      if (!parsedEvent.success) {
        console.error(
          `Failed to parse event for ${region.name}:`,
          parsedEvent.error.format(),
          eventData,
        )
        return []
      }
      return mapToEvent(parsedEvent.data, data, locale)
    })

  return {
    name: region.name,
    meetupName: region.meetupName,
    image: photo,
    memberCount: parsedGroup.data.stats.memberCounts.all,
    description: processedContent,
    meetupLink: regionMeetupUrl,
    location, // Use the updated location
    events,
    organizer: organizer,
  }
}

function mapToEvent(
  event: z.infer<typeof eventStructure>,
  data: Record<string, unknown>,
  locale: string,
) {
  const venue = parseVenue(event, data)
  const eventPhoto = parseEventPhoto(event, data)
  const first5Attendees = parseFirstFiveAttendees(event, data)
  const timestamp = Date.parse(event.dateTime)
  const datetimeAsDate = new Date(Date.parse(event.dateTime))

  return {
    name: event.title,
    description: event.description,
    eventUrl: event.eventUrl,
    eventType: event.eventType,
    status: event.status,
    timestamp: timestamp,
    time: datetimeAsDate.toLocaleString("no", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "CET",
    }),
    date: event.dateTime.split("T")[0] ?? "",
    dateTimeFormatted: toFormattedDateTimeString(event.dateTime, locale),
    numberOfAttendees: event.going.totalCount,
    venue: venue,
    memberImages: first5Attendees,
    eventPhoto: eventPhoto,
  }
}

export async function getUpcomingEvents(region: Region, locale: string) {
  // Instead of fetching data twice, let's use getRegionWithEvents
  const regionData = await getRegionWithEvents(region, locale)
  if (!regionData) {
    return []
  }

  return regionData.events.filter((event) => event.status === "ACTIVE")
}

async function getPageData(page: string) {
  const meetupGroupPage = await fetch(
    page + "?t=" + Math.trunc(Date.now() / 1000000),
    {
      next: { revalidate: 10 },
    },
  )
    .then((res) => res.text())
    // If the call fails for some reason, return an empty string, so the whole thing becomes a noop.
    .catch((err) => {
      console.error(err)
      return ""
    })

  const $ = load(meetupGroupPage)

  // Scraping the HTML was becoming troublesome, but I found out they are now using Next.js
  // and Next.js drops all static data into a script tag with id __NEXT_DATA__,
  // so we just grab all the data from there.
  const nextData = JSON.parse($("#__NEXT_DATA__").text())
  const nextDataParsed = nextDataStructure.safeParse(nextData)

  if (!nextDataParsed.success) {
    console.error(
      `Failed to parse __NEXT_DATA__ for ${page}:`,
      JSON.stringify(nextDataParsed.error.format()),
      nextData,
    )
    return { events: [] }
  }

  // The data is in the __APOLLO_STATE__ field, since they are grabbing from GraphQL
  return nextDataParsed.data.props.pageProps.__APOLLO_STATE__
}

export type RegionWithEvents = NonNullable<Awaited<ReturnType<typeof getRegionWithEvents>>>
