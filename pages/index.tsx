import Head from "next/head";
// import { Header } from "@lula-technologies-inc/lux"; // SEEMS NOT TO WORK AS IN STORYBOOK
import Header from "@/components/common/Header";

export default function Home() {
  return (
    <>
      <Head>
        <title>LULA Applications Dashboard</title>
        <meta
          name="description"
          content="Administrative dashboard for LULA applications."
        />
      </Head>
      <main>
        <Header/>
        <div className="flex justify-center h-screen w-full text-6xl p-10">
          Applications
        </div>
        {/* table actions */}
        <div className="flex flex-row">

        </div>
      </main>
    </>
  );
}
