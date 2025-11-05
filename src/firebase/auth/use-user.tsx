'use client';

import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * @fileoverview Хук React для получения текущего аутентифицированного пользователя
 * и его профиля из Firestore.
 */

/**
 * Расширенный тип пользователя, объединяющий данные аутентификации Firebase
 * с данными профиля пользователя из Firestore.
 * @typedef {AuthUser & UserProfile} AppUser
 */
export type AppUser = AuthUser & UserProfile;

/**
 * Хук `useUser` для управления состоянием пользователя.
 *
 * @returns {{ user: AppUser | null, isUserLoading: boolean }} - Объект, содержащий:
 * - `user`: Объект `AppUser`, если пользователь вошел в систему, иначе `null`.
 * - `isUserLoading`: `true`, если состояние пользователя еще загружается, иначе `false`.
 */
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
                // Профиль не существует, создаем его.
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
                    // Повторно выбрасываем ошибку для обработки во внешнем блоке catch
                    throw err;
                });
                const mergedUser: AppUser = { ...authUser, ...userProfileData, id: authUser.uid };
                setUser(mergedUser);
            }
        } catch (error) {
            console.error("Ошибка при получении или создании профиля пользователя:", error);
            // В случае сбоя используем только данные аутентификации
            setUser(authUser as AppUser); 
        }

      } else {
        // Пользователь вышел из системы
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
