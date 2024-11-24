import Head from "next/head"
import Image from "next/image"
import mariusDuke from "../../public/img/marius_duke.svg"
import javaZoneLogo from "../../public/img/logos/javazone-logo.jpg"
import octocat from "../../public/img/logos/github-logo.png"
import { Region } from "../components/Region"
import regions from "../data/regions"
import members from "../data/boardmembers"
import BoardMembers from "../components/BoardMembers"
import Link from "next/link"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { Trans, useTranslation } from "next-i18next"
import { InferGetStaticPropsType } from "next/types"
import { getRegionWithEvents } from "../lib/meetup-scraper"
import dynamic from "next/dynamic"

const RegionsMap = dynamic(() => import("../components/RegionsMap"), {
  ssr: false,
})

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
            <div className="col-md-12 text-center">
              <h2 className="section-heading">{t("branches")}</h2>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-12">
              <RegionsMap regions={props.regions} />
            </div>
          </div>
          {props.regions.map((region) => (
            <Region key={region.name} region={region} />
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

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const regionsWithData = await Promise.all(
    regions.map(async (region) => {
      const regionData = await getRegionWithEvents(region, locale)
      if (!regionData) {
        return {
          ...region,
          events: [],
          memberCount: 0,
          description: "",
          meetupLink: "",
          location: { lat: 0, lng: 0 },
          image: null,
          organizer: null,
        }
      }

      return {
        ...regionData,
        events: regionData.events.filter((event) => event.status === "ACTIVE"),
      }
    }),
  )

  return {
    props: {
      regions: regionsWithData,
      boardMembers: members,
      ...(await serverSideTranslations(
        locale ?? "no",
        ["common"],
        nextI18nConfig,
        ["no", "en"],
      )),
    },
    // Recreates the page server-side at most once per hour
    revalidate: 3600,
  }
}

export default Home
