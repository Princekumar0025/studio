'use client';

import { ReactNode, useMemo } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import { getApp, getApps } from 'firebase/app';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return initializeFirebase();
    }
    return { app: null, auth: null, firestore: null };
  }, []);
  
  // Ensure we don't re-initialize on the client
  if (typeof window !== "undefined" && !getApps().length) {
      initializeFirebase();
  }

  const currentApp = getApps().length > 0 ? getApp() : null;

  if (!currentApp) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider app={firebase.app!} auth={firebase.auth!} firestore={firebase.firestore!}>
      {children}
    </FirebaseProvider>
  );
}
