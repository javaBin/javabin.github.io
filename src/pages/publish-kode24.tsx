import Head from "next/head"
import regions from "../data/regions"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { InferGetStaticPropsType } from "next/types"
import { PublishEvents } from "../components/PublishEvents"
import { getUpcomingEvents } from "../lib/meetup-scraper"

const Home = ({ regions }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <>
      <Head>
        <title>Kode24 Publish links</title>
        <meta
          name="description"
          content="Links that help autofill the kode24 event form"
        />
      </Head>
      <section id="locations">
        <div className="container">
          {regions.map((region) => (
            <PublishEvents key={region.name} region={region} />
          ))}
        </div>
      </section>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  const regionsWithUpcomingMeetups = await Promise.all(
    regions.map(async (region) => {
      const events = await getUpcomingEvents(region, locale)
      return {
        ...region,
        events,
      }
    }),
  )

  return {
    props: {
      regions: regionsWithUpcomingMeetups,
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
