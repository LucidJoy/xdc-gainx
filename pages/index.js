import Head from "next/head";
import Image from "next/image";
import { Inter, Poppins } from "next/font/google";
import { useEffect } from "react";
import useDarkMode from "use-dark-mode";
import Layout from "../components/Layout";
import PageGameplay from "../components/PageGameplay";

import CookieConsent from "react-cookie-consent";

const inter = Inter({ subsets: ["latin"] });
// const poppins = Poppins({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>GainX</title>
        <meta name='description' content='GainX' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />

        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
        <link
          href='https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap'
          rel='stylesheet'
        ></link>
      </Head>

      <Layout>
        <PageGameplay />
      </Layout>

      <CookieConsent
        location='bottom'
        buttonText='Accept'
        cookieName='gainxCookie'
        style={{
          background: "#35373d",
          fontSize: "15px",
          border: "1px solid red",
        }}
        buttonStyle={{
          color: "#35373d",
          fontSize: "14px",
          background: "#E45F35",
          padding: "7px 15px",
          fontWeight: "600",
          borderRadius: "6px",
        }}
        expires={150}
      >
        ⚠️ GainX Liquidity pool currently have 1 GLMR Test token due to faucet
        limits. Therefore, it is very likely that large transactions might fail
        at this moment. Perform lending functionality on demo listings (0.01,
        0.02 GLMR) only.
      </CookieConsent>
    </>
  );
}
