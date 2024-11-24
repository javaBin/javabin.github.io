import { useTranslation } from "next-i18next"
import { Region as RegionType } from "../data/regions"
import { InferGetStaticPropsType } from "next/types"
import { getStaticProps } from "../pages/publish-kode24"
import Image from "next/image"

export type RegionWithEvents = RegionType & {
  events: Event[]
}

export type Event = InferGetStaticPropsType<
  typeof getStaticProps
>["regions"][number]["events"][number]
type Props = {
  region: RegionWithEvents
}

type EventProps = {
  region: string
  events?: Event[]
}

const kode24CalendarGoogleForm =
  "https://docs.google.com/forms/d/e/1FAIpQLSeIpFCZRLdecwbZjLKZ_CSIqs7deA5vU4zHJJTPEa1wUbHo7A/viewform"

const Events = ({ region, events }: EventProps) => {
  const { t } = useTranslation("common", { keyPrefix: "region" })

  if (!events || events.length === 0) {
    return <></>
  }

  return (
    <ul className="flex flex-col space-y-5">
      {events.map((event) => {
        return (
          <li key={event.eventUrl}>
            <div className="rounded-lg bg-white shadow-sm hover:bg-gray-50">
              <a
                href={`${kode24CalendarGoogleForm}?${new URLSearchParams({
                  "entry.1533124644": event.name, //title
                  "entry.27335772": event.description, //description
                  "entry.1917728189": `javaBin ${region}`, //"Hvem arrangerer?" - JavaBin Region
                  "entry.193927584": event.eventUrl, //"Har du en lenke til mer info? (og som vi kan peke oppføringen, som til påmelding osv)" - meetup.com link
                  // Sørlandet and Tromsø has has to have "ø" replaced with "o" in the email address.
                  "entry.16515341": `${region
                    .toLowerCase()
                    .replace("ø", "o")}@java.no`, //"Kontaktinfo til deg eller arrangør hvis vi skulle ha noen spørsmål"
                  "entry.1934196422": event.time, //"Når på dagen er det?" - kan skrives som f.eks. "17:00"
                  "entry.127580365": event.date ?? "", //"Hvilken dato er det?" - kan skrives i iso8601 format f.eks. "2023-09-13"
                  "entry.1197176374":
                    event.eventType === "PHYSICAL" ? "Fysisk" : "Online", //"Er det online eller fysisk?" - Sett "Fysisk" eller "Online"
                }).toString()}`}
                target="_blank"
                className="flex h-full flex-col justify-between space-y-5 p-8 outline-offset-8 hover:no-underline"
              >
                <div className="flex flex-col space-y-5">
                  <div className="flex items-center justify-between ">
                    <div className="flex w-full flex-col space-y-3">
                      <time
                        className="font-bold text-red-800"
                        dateTime={`${event.time}`}
                      >
                        {event.dateTimeFormatted}
                      </time>
                      <h4 className="block break-words leading-7">
                        {event.name}
                      </h4>
                      <div className="text-muted flex items-start">
                        {event.venue}
                      </div>
                      <div
                        className="relative flex items-center"
                        style={{ height: "34px" }}
                      >
                        <ul>
                          {event.memberImages.map((attendee, index) => (
                            <li
                              key={attendee.photoUrl}
                              className="absolute top-0"
                              style={{
                                zIndex: 5 - index,
                                margin: `0 ${index * 25}px`,
                              }}
                            >
                              <Image
                                alt={t("attendeePhoto", {
                                  name: attendee.name,
                                })}
                                src={attendee.photoUrl}
                                width={34}
                                height={34}
                                className="rounded-full border border-solid border-red-400 object-cover"
                              />
                            </li>
                          ))}
                        </ul>
                        <span
                          style={{
                            marginLeft: `${
                              event.memberImages.length * 25 + 15
                            }px`,
                          }}
                        >
                          {t("attendees", {
                            count: event.numberOfAttendees,
                          })}
                        </span>
                      </div>
                    </div>
                    {event.eventPhoto && (
                      <Image
                        alt="event photo"
                        className="tw-hidden aspect-video rounded-lg object-cover shadow-lg sm:block"
                        height={101}
                        width={180}
                        src={event.eventPhoto}
                      />
                    )}
                  </div>
                </div>
              </a>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export const PublishEvents = ({ region }: Props) => {
  return (
    <>
      <div className="row">
        <div className="col-md-11 col-md-offset-3 max-w-screen-md">
          <h3>{region.name}</h3>
          <div>
            <div>
              <Events region={region.name} events={region.events} />
            </div>
          </div>
        </div>
      </div>
      <br />
    </>
  )
}
