'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This function ensures that we initialize Firebase only once.
function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Create singleton instances of Firebase services
const firebaseApp: FirebaseApp = createFirebaseApp();
const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

// The initializeFirebase function now simply returns the pre-initialized services.
// This is used by the FirebaseClientProvider.
export function initializeFirebase() {
  return { firebaseApp, auth, firestore };
}

// Export hooks and utilities for use in components
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
