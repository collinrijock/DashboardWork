import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Header from "../components/common/header";
import Signin from '@/components/common/signin';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function App({ Component, pageProps }: AppProps) {
  const { user } = useFirebaseAuth();

  if (!user) {
    return <Signin />;
  }

  return (
    <div>
      <Header />
      <Component {...pageProps} />
    </div>)
}
