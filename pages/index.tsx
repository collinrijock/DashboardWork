import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/common/header";
import Table from "@/components/common/table";
import Signin from "@/components/common/signin";
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function Home() {
  const { user, signIn, signOut } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      setLoading(false);
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <div>
      <Head>
        <title>LULA Applications Dashboard</title>
        <meta
          name="description"
          content="Administrative dashboard for LULA applications."
        />
      </Head>
      <main className="min-h-screen h-full bg-secondary flex flex-col">
        <Header />
        {!loading && (
          <>
            {user ? (
              <div className="flex flex-col p-12 animate-fade-in">
                <h1 className="w-full text-6xl p-2">Applications</h1>
                <p className="p-2">Click on the <span className="underline" >arrow at the end of a table row</span> to view more details on an application.</p>
                <Table />
              </div>
            ) : (
              <Signin />
            )}
          </>
        )}
      </main>
    </div>
  );
}
