import Head from "next/head";
import Header from "@/components/common/header";
import Table from "@/components/common/table";
import Signin from "@/components/common/signin";
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function Home() {
  const { user, signIn, signOut } = useFirebaseAuth();

  return (
    <div>
      <Head>
        <title>LULA Applications Dashboard</title>
        <meta
          name="description"
          content="Administrative dashboard for LULA applications."
        />
      </Head>
      <main className="h-screen bg-secondary flex flex-col">
      <Header />
        {user ? (
          <div className="flex flex-col p-12 ">
            <h1 className="w-full text-6xl p-2">Applications</h1>
            <p className="p-2">Click on the arrow at the end of a table row to view more details on an application.</p>
            <Table />
          </div>
        ) : (
            <Signin />
        )}
      </main>
    </div>
  );
}
