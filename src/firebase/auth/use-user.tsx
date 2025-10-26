'use client';

import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '../provider';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

export type AppUser = AuthUser & UserProfile;

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in, now fetch the profile
        const userRef = doc(firestore, `users/${authUser.uid}`);
        
        // This is a one-time fetch for the profile data upon auth change.
        // For real-time updates to profile, a separate hook/listener would be needed if required elsewhere.
        try {
            const userSnap = await (await import('firebase/firestore')).getDoc(userRef);
            if (userSnap.exists()) {
                setUser({ ...authUser, ...(userSnap.data() as UserProfile) });
            } else {
                // Profile doesn't exist, create it.
                const userProfileData: UserProfile = {
                    id: authUser.uid,
                    email: authUser.email || '',
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL,
                    currentStreak: 0,
                    lastActiveDate: null,
                };
                await (await import('firebase/firestore')).setDoc(userRef, userProfileData);
                setUser({ ...authUser, ...userProfileData });
            }
        } catch (error) {
            console.error("Error fetching or creating user profile:", error);
            // Fallback to just the auth user if profile fails
            setUser(authUser as AppUser); 
        }

      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, isUserLoading: loading, appUser: user };
};
