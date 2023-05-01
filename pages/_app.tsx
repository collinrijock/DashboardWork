import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Header from "../components/common/header";
import Signin from '@/components/common/signin';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import useDarkMode from "../hooks/useDarkMode";

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useDarkMode();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (!user) {
    return <Signin />;
  }

  return (
    <div>
      <Header />
      <Component {...pageProps} />
    </div>)
}
