import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { FirebaseProvider } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';


let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
        try {
            firebaseApp = initializeApp(firebaseConfig);
            auth = getAuth(firebaseApp);
            firestore = getFirestore(firebaseApp);
        } catch (e) {
            console.error('Failed to initialize Firebase', e)
        }
    } else {
        firebaseApp = getApp();
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
    }
  }

  return { app: firebaseApp!, auth: auth!, firestore: firestore! };
}

export {
    initializeFirebase,
    FirebaseProvider,
    FirebaseClientProvider,
    useCollection,
    useDoc,
    useUser,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
};
