'use client';

import {
  FirebaseProvider,
  FirebaseContext,
} from './provider';

import { initializeFirebase } from './';
import { useMemo } from 'react';

// This provider is intended to be used in the root layout of your application.
// It will initialize Firebase on the client side and provide the Firebase app,
// Firestore, and Auth instances to all child components.
export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { app, firestore, auth } = useMemo(() => initializeFirebase(), []);

  const contextValue: FirebaseContext = {
    app,
    auth,
    firestore,
  };

  return (
    <FirebaseProvider
      app={contextValue.app}
      auth={contextValue.auth}
      firestore={contextValue.firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
