'use client';

import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type AppUser = AuthUser & UserProfile;

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth || !firestore) {
      console.log('[useUser] Auth or Firestore service not available yet.');
      setIsLoading(false);
      return;
    }

    console.log('[useUser] Subscribing to onAuthStateChanged.');
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log('[useUser] onAuthStateChanged: User is signed in with UID:', authUser.uid);
        // User is signed in, now fetch the profile
        const userRef = doc(firestore, `users/${authUser.uid}`);
        
        try {
            console.log(`[useUser] Fetching user profile from: ${userRef.path}`);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                console.log('[useUser] User profile found.');
                const userProfile = userSnap.data() as UserProfile;
                const mergedUser: AppUser = { ...authUser, ...userProfile, id: authUser.uid };
                setUser(mergedUser);
            } else {
                // Profile doesn't exist, create it.
                console.log('[useUser] User profile not found, creating new one.');
                const userProfileData: UserProfile = {
                    id: authUser.uid,
                    email: authUser.email || '',
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL,
                    currentStreak: 0,
                    lastActiveDate: null,
                };
                await setDoc(userRef, userProfileData);
                console.log('[useUser] New user profile created.');
                const mergedUser: AppUser = { ...authUser, ...userProfileData, id: authUser.uid };
                setUser(mergedUser);
            }
        } catch (error) {
            console.error("[useUser] Error fetching or creating user profile:", error);
            // Fallback to just the auth user if profile fails
            setUser(authUser as AppUser); 
        }

      } else {
        // User is signed out
        console.log('[useUser] onAuthStateChanged: User is signed out.');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      console.log('[useUser] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    }
  }, [auth, firestore]);

  return { user, isUserLoading };
};
