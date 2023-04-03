import Head from "next/head";
// import { Header } from "@lula-technologies-inc/lux"; // SEEMS NOT TO WORK AS IN STORYBOOK
import Header from "@/components/common/Header";

export default function Products() {
  return (
    <>
      <Head>
        <title>LULA - Products</title>
        <meta
          name="description"
          content="Manage products available to include in product offerings"
        />
      </Head>
      <main>
        <Header/>
        <div className="flex justify-center h-screen w-full text-6xl p-10">
          Products Go Here
        </div>
      </main>
    </>
  );
}
