import Link from "next/link"
import { Trans, useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Region as RegionType } from "../../data/regions"

export type RegionWithEvents = RegionType & {
  events: Meeting[]
}

export type Meeting = {
  eventUrl: string
  name: string
  time: number
}
type Props = {
  region: RegionWithEvents
}

type MeetingProps = { meetings?: Meeting[]; meetupUrl: string }

const Meetings = ({ meetings, meetupUrl }: MeetingProps) => {
  const { t } = useTranslation("common", { keyPrefix: "region" })
  const router = useRouter()

  if (!meetings || meetings.length === 0) {
    return (
      <p>
        <Trans
          i18nKey="proposeMeetup"
          t={t}
          components={{ meetupLink: <Link href={meetupUrl} /> }}
        />
      </p>
    )
  }

  return (
    <ul>
      {meetings.map((meeting) => {
        const date = new Date(meeting.time)
        const dateTimeFormatted = date.toLocaleString(router.locale, {
          weekday: "long",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          hour12: false,
          timeZone: "CET",
        })

        return (
          <li key={meeting.name}>
            <h3>
              <a href={meeting.eventUrl}>{meeting.name}</a>
            </h3>
            <p>{`${dateTimeFormatted}`}</p>
          </li>
        )
      })}
    </ul>
  )
}

export const Region = ({ region }: Props) => {
  const { t } = useTranslation("common", { keyPrefix: "region" })
  const meetupUrl = `https://meetup.com/${region.meetupName}`

  return (
    <>
      <div className="row">
        <div className="col-md-12 col-md-offset-2">
          <h3>{region.region}</h3>
          <div>
            <p>
              {t(region.region.toLowerCase() + ".description")} –{" "}
              <Link href={`https://meetup.com/${region.meetupName}`}>
                meetup.com/{region.meetupName}
              </Link>
              .
            </p>
            <h5>{t("nextMeetups")}</h5>
            <div>
              <Meetings meetings={region.events} meetupUrl={meetupUrl} />
            </div>
          </div>
        </div>
      </div>
      <br />
    </>
  )
}
