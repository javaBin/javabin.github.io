import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { GetStaticPaths, GetStaticPropsContext } from "next"
import regions from "../data/regions"
import { useTranslation } from "next-i18next"
import Head from "next/head"
import { InferGetStaticPropsType } from "next/types"
import { Meetings } from "../components/Region"
import Image from "next/image"
import { getRegionWithEvents } from "../lib/meetup-scraper"

export default function RegionPage({
  region,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation("common")

  return (
    <>
      <Head>
        <title>{t("region.title", { name: region.name })}</title>
        <meta
          name="description"
          content={region.description.replace(/<(?:.|\n)*?>/gm, "")}
        />
        {region.image && <meta property="og:image" content={region.image} />}
      </Head>
      <div className="bg-[#eee] p-4 sm:p-8 md:p-16 lg:p-32">
        <h1 className="mt-16 sm:mt-12 md:mt-2">{region.name}</h1>
        <h5>{region.memberCount} Dukes</h5>
        {region.image && (
          <Image
            alt="event photo"
            className="block aspect-video h-auto w-full max-w-[600px] rounded-lg object-cover shadow-lg"
            height={404}
            width={720}
            src={region.image}
          />
        )}
        <br />
        <div
          dangerouslySetInnerHTML={{
            __html: region.description.replaceAll("\n", "<br/>"),
          }}
        ></div>
        <div>
          <h5>{t("region.nextMeetups")}</h5>
          <div>
            <Meetings
              meetings={region.events.filter(
                (event) => event.status === "ACTIVE",
              )}
              meetupUrl={region.meetupLink}
            />
          </div>
        </div>
        <div>
          <h5>{t("region.pastMeetups")}</h5>
          <div>
            <Meetings
              meetings={region.events.filter(
                (event) => event.status === "PAST",
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async ({
  params,
  locale,
}: GetStaticPropsContext<{
  region: string
}>) => {
  if (!params || !locale) {
    return { notFound: true }
  }
  const currentRegion = regions.find(
    (regionObj) => regionObj.name.toLowerCase() === params.region,
  )
  if (!currentRegion) {
    return { notFound: true }
  }
  const regionWithEvents = await getRegionWithEvents(currentRegion, locale)
  if (!regionWithEvents) {
    return { notFound: true }
  }

  return {
    props: {
      region: regionWithEvents,
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

export const getStaticPaths = (() => {
  return {
    paths: regions.flatMap((region) => [
      {
        params: {
          region: region.name.toLowerCase(),
        },
        locale: "no",
      },
      {
        params: {
          region: region.name.toLowerCase(),
        },
        locale: "en",
      },
    ]),
    fallback: false, // false or "blocking"
  }
}) satisfies GetStaticPaths
