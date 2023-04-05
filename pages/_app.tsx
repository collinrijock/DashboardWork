import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import useDarkMode from "../hooks/useDarkMode";

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useDarkMode();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  return <Component {...pageProps} />;
}
