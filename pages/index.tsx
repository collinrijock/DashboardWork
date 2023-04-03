import Head from "next/head";
// import { Header } from "@lula-technologies-inc/lux"; // SEEMS NOT TO WORK AS IN STORYBOOK
import Header from "@/components/common/Header";
import Table from "@/components/common/table";

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
        <div className="flex flex-col h-screen p-12">
          <h1 className="w-full text-6xl p-2">Applications</h1>
          <Table/>
        </div>
      </main>
    </>
  );
}
