import { useState, useEffect } from 'react';
import { User } from '@firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from '@firebase/auth';

const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const signIn = () => signInWithPopup(auth, provider);

const signOut = () => firebaseSignOut(auth);

const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const useFirebaseAuth = () => {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const unsubscribe = observeAuthState((user: any) => {
            return setUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { user, signIn, signOut };
};
