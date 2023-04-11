import Head from "next/head";
// import { Header } from "@lula-technologies-inc/lux"; // SEEMS NOT TO WORK AS IN STORYBOOK
import Header from "@/components/common/Header";
import Table from "@/components/common/table";
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import {initializeApp} from 'firebase/app'
import {getAuth, GoogleAuthProvider, signInWithPopup, User, connectAuthEmulator, onAuthStateChanged} from '@firebase/auth'
export default function Home() {
    const [user, setUser] = useState<User>()
    const [logoutUrl, setLogoutUrl] = useState<string>()
    const [error, setError] = useState<any>()
    const app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
    // if(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    //     (auth as unknown as any)._canInitEmulator = true;
    //     connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, {
    //         disableWarnings: true,
    //     });
    // }
    const signIn = () => signInWithPopup(auth, provider);
    const signOut = () => auth.signOut();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            }
        })
        
    }, [user, error])
   
    return (
    <>

        <div>
            {user ? (
                <>
                    <span>Signed in as : {user.email}</span>
                    {
                        // @ts-ignore
                        console.log(user.accessToken)
                    }
                    <Head>
                        <title>LULA Applications Dashboard</title>
                        <meta
                            name="description"
                            content="Administrative dashboard for LULA applications."
                        />
                    </Head>
                    <main>
                        <Header/>
                        <div className="flex flex-col h-screen p-12 bg-secondary">
                            <h1 className="w-full text-6xl p-2">Applications</h1>
                            <Table/>
                        </div>
                    </main>
                </>
            ) : (
                <>
                    <button onClick={signIn}>Sign In</button>
                    <Head>
                        <title>LULA Applications Dashboard</title>
                        <meta
                            name="description"
                            content="Administrative dashboard for LULA applications."
                        />
                    </Head>
                    <main>
                        <Header/>
                        <div className="flex flex-col h-screen p-12 bg-secondary">
                            <h1 className="w-full text-6xl p-2">Applications</h1>
                            <Table/>
                        </div>
                    </main>
                </>
            )}
        </div>


    </>
  );
}
