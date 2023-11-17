import Head from "next/head"
import Image from "next/image"
import mariusDuke from "../../public/img/marius_duke.svg"
import javaZoneLogo from "../../public/img/logos/javazone-logo.jpg"
import octocat from "../../public/img/logos/github-logo.png"
import { Region } from "../components/Region"
import regions from "../../data/regions"
import members from "../../data/boardmembers"
import BoardMembers from "../components/BoardMembers"
import Link from "next/link"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { Trans, useTranslation } from "next-i18next"
import { InferGetStaticPropsType } from "next/types"
import { load } from "cheerio"
import { z } from "zod"

const Home = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation("common", { keyPrefix: "main" })
  const yearsArrangingJavaZone = new Date().getFullYear() - 2002

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <meta name="description" content={t("title")!} />
      </Head>
      <header>
        <div className="container">
          <div className="intro-text">
            <Image priority src={mariusDuke} height={250} alt="Marius Duke" />
            <div className="intro-lead-in">{t("intro")}</div>
            <div className="intro-heading">javaBin</div>
            <Link href="/#about" className="page-scroll btn btn-xl">
              {t("aboutUs")}
            </Link>
          </div>
        </div>
      </header>

      <section id="about">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2 className="section-heading">{t("about")}</h2>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-8 col-md-offset-2">
              <p>{t("aboutJavaBin")}</p>
              <p>
                <Trans
                  i18nKey="aboutJavaZone"
                  t={t}
                  components={{
                    javaZoneLink: <Link href="http://javazone.no" />,
                  }}
                />
              </p>
              <p>{t("aboutMeetups")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contribute">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2 className="section-heading">{t("contribute")}</h2>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-md-12">
              <ul className="timeline">
                <li className="timeline-default">
                  <div className="timeline-image">
                    <Image
                      className="img-circle img-responsive"
                      height={170}
                      src={mariusDuke}
                      alt="Marius Duke"
                    />
                  </div>
                  <div className="timeline-panel">
                    <div className="timeline-heading">
                      <h4>{t("becomeActive")}</h4>
                    </div>
                    <div className="timeline-body">
                      <p>
                        <Trans
                          i18nKey="aboutBecomingActive"
                          t={t}
                          components={{
                            teknologiHustetLocationLink: (
                              <Link href="https://goo.gl/maps/wpaA5nxxHM5ao3Rr9" />
                            ),
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </li>

                <li className="timeline-inverted">
                  <div className="timeline-image">
                    <Image
                      className="img-circle img-responsive"
                      height={170}
                      src={javaZoneLogo}
                      alt="JavaZone logo"
                    />
                  </div>
                  <div className="timeline-panel">
                    <div className="timeline-heading">
                      <h4>{t("ideasJavaZone")}</h4>
                    </div>
                    <div className="timeline-body">
                      <p>
                        <Trans
                          i18nKey="aboutIdeasJavaZone"
                          t={t}
                          values={{
                            yearsArrangingJavaZone: yearsArrangingJavaZone,
                          }}
                          components={{
                            javaZoneLink: <Link href="http://javazone.no" />,
                            javaZoneEmail: (
                              <Link href="mailto:javazone@java.no" />
                            ),
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </li>

                <li className="timeline-default">
                  <div className="timeline-image">
                    <Image
                      className="img-circle img-responsive"
                      height={170}
                      src={octocat}
                      alt="Github Octocat"
                    />
                  </div>
                  <div className="timeline-panel">
                    <div className="timeline-heading">
                      <h4>{t("github")}</h4>
                    </div>
                    <div className="timeline-body">
                      <p>
                        <Trans
                          i18nKey="aboutGithub"
                          t={t}
                          components={{
                            githubLink: (
                              <Link href="http://github.com/javabin" />
                            ),
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="locations">
        <div className="container">
          <div className="row">
            <div className="col-md-12  text-center">
              <h2 className="section-heading">{t("branches")}</h2>
            </div>
          </div>
          {props.regions.map((region) => (
            <Region key={region.region} region={region} />
          ))}
        </div>
      </section>

      <section id="board">
        <BoardMembers boardMembers={props.boardMembers} />
      </section>

      {/*<Membership />*/}

      <section id="contact">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2 className="section-heading">{t("contact")}</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 center-justified">
              <div className="">{t("contactHelpText")}</div>
              <form
                action="https://formspree.io/styret@java.no"
                method="POST"
                className="col-xs-offset-1 col-xs-10 col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6"
              >
                <div className="form-group">
                  <label htmlFor="name">{t("name")}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("yourName")!}
                    name="name"
                    id="name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t("email")}</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder={t("yourEmail")!}
                    name="email"
                    id="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">{t("message")}</label>
                  <textarea
                    name="message"
                    className="form-control"
                    placeholder={t("yourMessage")!}
                    rows={5}
                    id="message"
                  ></textarea>
                </div>
                <div className="form-group">
                  <input
                    type="submit"
                    className="btn btn-primary"
                    value={t("send")!}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export const toFormattedDateTimeString = (time: string, locale: string) => {
  // Example input: "Thu, 16 Sep 2021 17:00:00 CEST", "Thu, Nov 16, 2023, 5:30 PM CET" Very brittle hack, but it works for now.
  // Example output: english "Thursday, November 23 at 18:00", norwegian "torsdag 23. november kl. 18:00"

  const tz = time.substring(time.length - 4)
  const dateWithoutTz = time.replace(tz, "")
  const date = new Date(dateWithoutTz)

  const dateTimeFormatted = date.toLocaleString(locale, {
    weekday: "long",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    hour12: false,
    timeZone: "CET",
  })
  return dateTimeFormatted
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const eventType = z.object({
    name: z.string(),
    eventUrl: z.string().url(),
    time: z.string(),
    dateTimeFormatted: z
      .string()
      .transform((val) => toFormattedDateTimeString(val, locale)),
  })

  const regionsWithUpcomingMeetups = await Promise.all(
    regions.map(async (region) => {
      const meetupEventsPageHtml = await fetch(
        `https://www.meetup.com/${region.meetupName}/events/`
      )
        .then((res) => res.text())
        // If the call fails for some reason, return an empty string, so the whole thing becomes a noop.
        .catch((err) => {
          console.error(err)
          return ""
        })

      const $ = load(meetupEventsPageHtml)

      const events = $("a[id^='event-card-']")
        .map((index, eventCard) => {
          const name = $("span", eventCard).eq(0).text()
          const eventUrl = $(eventCard).attr("href")
          const time = $("time", eventCard).text()
          const event = eventType.safeParse({
            name,
            eventUrl,
            time,
            dateTimeFormatted: time,
          })
          if (event.success) {
            return event.data.name ? event.data : null
          } else {
            console.error(`Failed to scrape event for ${region.region}:`, event.error.format())
            return null
          }
        })
        .toArray()

      return {
        events,
        ...region,
      }
    })
  )

  return {
    props: {
      regions: regionsWithUpcomingMeetups,
      boardMembers: members,
      ...(await serverSideTranslations(
        locale ?? "no",
        ["common"],
        nextI18nConfig,
        ["no", "en"]
      )),
    },
    // Recreates the page server-side at most once per hour
    revalidate: 3600,
  }
}

export default Home
