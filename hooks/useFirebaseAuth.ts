import { useState, useEffect } from 'react';
import { User } from '@firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, getIdToken } from '@firebase/auth';

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

const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const userEmail = result.user.email;

    if (!userEmail?.endsWith('@lula.is')) {
      alert('Please use a lula.is domain email to sign in.');
      await firebaseSignOut(auth);
    }
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.log('Popup closed by user.');
    } else {
      console.error('Error signing in:', error);
    }
  }
};

const signOut = () => firebaseSignOut(auth);

const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
      const unsubscribe = observeAuthState(async (user: any) => {
          setUser(user);
          if (user) {
              const idToken = await getIdToken(user);
              setToken(idToken);
          } else {
              setToken(undefined);
          }
      });

      return () => {
          unsubscribe();
      };
  }, []);

  return { user, token, signIn, signOut };
};
