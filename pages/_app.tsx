import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Header from "../components/common/header";
import useDarkMode from "../hooks/useDarkMode";
import { Auth0Provider } from '@auth0/auth0-react';
import Layout from "@/components/common/layout";

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useDarkMode();
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      useRefreshTokens
      cacheLocation="localstorage"
      cookieDomain={process.env.NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN!}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI!,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      }}>
        <Layout>
          <Header/>
          <Component {...pageProps} />
        </Layout>
    </Auth0Provider>
    )
}
