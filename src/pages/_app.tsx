import "../../public/assets/bootstrap/css/bootstrap.min.css"
import "../../public/assets/font-awesome/css/font-awesome.min.css"
import "../styles/style.scss"
import { appWithTranslation } from "next-i18next"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { AppType } from "next/app"
import { Menu } from "@/components/Menu"
import Head from "next/head"
import { Footer } from "@/components/Footer"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/icon" href="/img/favicon.ico" />
      </Head>
      <Menu />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

export default appWithTranslation(MyApp, nextI18nConfig)
