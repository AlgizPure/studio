import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import {
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';

// Initializes and returns a Firebase object with the app, auth, and firestore.
// This is a singleton, so it will only be initialized once.
export const initializeFirebase = (): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} => {
  const isServer = typeof window === 'undefined';
  const apps = getApps();

  // Don't initialize on the server
  if (isServer && apps.length > 0) {
    const app = apps[0];
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }

  // Initialize on the client
  if (!apps.length) {
    initializeApp(firebaseConfig);
  }

  const app = apps[0];
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
};

export {
  useCollection,
  useDoc,
  useUser,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
