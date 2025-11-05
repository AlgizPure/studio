'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { useUser as useAuthUser, type AppUser } from './auth/use-user';

/**
 * @fileoverview Провайдер и хуки для доступа к сервисам Firebase в приложении.
 */

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * Провайдер, который делает сервисы Firebase доступными для дочерних компонентов.
 * @param {object} props - Свойства компонента.
 * @param {ReactNode} props.children - Дочерние компоненты.
 * @param {FirebaseApp | null} props.firebaseApp - Экземпляр Firebase App.
 * @param {Firestore | null} props.firestore - Экземпляр Firestore.
 * @param {Auth | null} props.auth - Экземпляр Auth.
 * @param {FirebaseStorage | null} props.storage - Экземпляр Storage.
 * @returns {JSX.Element} - Провайдер Firebase.
 */
export const FirebaseProvider: React.FC<{ children: ReactNode } & FirebaseContextState> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const contextValue = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    storage,
  }), [firebaseApp, firestore, auth, storage]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Хук для доступа к контексту Firebase.
 * @returns {FirebaseContextState} - Контекст Firebase.
 * @throws {Error} - Если используется вне FirebaseProvider.
 */
function useFirebase(): FirebaseContextState {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase должен использоваться внутри FirebaseProvider.');
  }
  return context;
}

/**
 * Хук для доступа к сервису Auth.
 * @returns {Auth} - Экземпляр Auth.
 * @throws {Error} - Если сервис Auth недоступен.
 */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  if (!auth) throw new Error("Сервис Auth недоступен.");
  return auth;
};

/**
 * Хук для доступа к сервису Firestore.
 * @returns {Firestore} - Экземпляр Firestore.
 * @throws {Error} - Если сервис Firestore недоступен.
 */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  if (!firestore) throw new Error("Сервис Firestore недоступен.");
  return firestore;
};

/**
 * Хук для доступа к экземпляру FirebaseApp.
 * @returns {FirebaseApp} - Экземпляр FirebaseApp.
 * @throws {Error} - Если FirebaseApp недоступен.
 */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  if (!firebaseApp) throw new Error("FirebaseApp недоступен.");
  return firebaseApp;
};

/**
 * Хук для доступа к сервису Storage.
 * @returns {FirebaseStorage} - Экземпляр FirebaseStorage.
 * @throws {Error} - Если сервис Storage недоступен.
 */
export const useStorage = (): FirebaseStorage => {
  const { storage } = useFirebase();
  if (!storage) throw new Error("Сервис Storage недоступен.");
  return storage;
};

/**
 * Обертка вокруг useMemo для мемоизации значений, связанных с Firebase.
 * @param {() => T} factory - Функция, возвращающая значение для мемоизации.
 * @param {DependencyList} deps - Массив зависимостей.
 * @returns {T} - Мемоизированное значение.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}

/**
 * Хук для получения текущего пользователя.
 * @returns {{ user: AppUser | null, isUserLoading: boolean }} - Объект с пользователем и состоянием загрузки.
 */
export const useUser = (): { user: AppUser | null, isUserLoading: boolean } => {
  return useAuthUser();
};

// Экспорт комбинированного хука Firebase для удобства
export { useFirebase };
