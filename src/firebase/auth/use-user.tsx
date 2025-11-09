'use client';

import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { logger } from '@/lib/logger';

export type AppUser = AuthUser & UserProfile;

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth || !firestore) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(firestore, `users/${authUser.uid}`);
        
        try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userProfile = userSnap.data() as UserProfile;
                const mergedUser: AppUser = { ...authUser, ...userProfile, id: authUser.uid };
                setUser(mergedUser);
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
                await setDoc(userRef, userProfileData).catch(async (err) => {
                    const permissionError = new FirestorePermissionError({
                      operation: 'create',
                      path: userRef.path,
                      requestResourceData: userProfileData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    // Re-throw to be caught by the outer catch block
                    throw err;
                });
                const mergedUser: AppUser = { ...authUser, ...userProfileData, id: authUser.uid };
                setUser(mergedUser);
            }
        } catch (error) {
            logger.error("Error fetching or creating user profile:", error);
            // Fallback to just the auth user if profile fails
            setUser(authUser as AppUser); 
        }

      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    }
  }, [auth, firestore]);

  return { user, isUserLoading };
};
