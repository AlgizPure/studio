'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface FirebaseContext {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export const FirebaseContext = createContext<FirebaseContext>({
  app: null,
  auth: null,
  firestore: null,
});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase()?.app;
export const useAuth = () => useFirebase()?.auth;
export const useFirestore = () => useFirebase()?.firestore;

interface FirebaseProviderProps {
  children: ReactNode;
  app?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

export function FirebaseProvider({
  children,
  ...props
}: FirebaseProviderProps) {
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // If props are provided, use them. This is useful for testing.
    if (props.app && props.auth && props.firestore) {
      return {
        app: props.app,
        auth: props.auth,
        firestore: props.firestore,
      };
    }
    // Otherwise, initialize Firebase. This is the normal flow.
    const { app, auth, firestore } = initializeFirebase();
    return { app, auth, firestore };
  }, [props.app, props.auth, props.firestore]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}
