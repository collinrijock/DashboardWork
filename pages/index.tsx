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
        apiKey: 'AIzaSyBTSMnO6jdcyokeyv7JiGE0sQfhrxJhaUw',
        authDomain: 'lula-app-staging-cba45.firebaseapp.com',
        projectId: 'lula-app-staging-cba45',
        storageBucket: 'lula-app-staging-cba45.appspot.com',
        messagingSenderId: '762204877252',
        appId: '1:762204877252:web:7da95f2dd90b00ae773491',
        measurementId: 'G-Z97YSYZ6TD'
    });
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
    
    // (auth as unknown as any)._canInitEmulator = true;
    // connectAuthEmulator(auth, "http://localhost:9099", {
    //     disableWarnings: true,
    // });
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
