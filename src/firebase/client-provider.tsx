'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';

/**
 * @fileoverview Провайдер Firebase для клиентской стороны, который инициализирует Firebase и предоставляет сервисы дочерним компонентам.
 */

/**
 * Свойства для компонента FirebaseClientProvider.
 * @interface FirebaseClientProviderProps
 * @property {ReactNode} children - Дочерние компоненты, которые будут иметь доступ к сервисам Firebase.
 */
interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Компонент провайдера Firebase для клиентской стороны.
 * @param {FirebaseClientProviderProps} props - Свойства компонента.
 * @returns {JSX.Element} - Провайдер Firebase с инициализированными сервисами.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Инициализируем Firebase на стороне клиента один раз при монтировании компонента.
    return initializeFirebase();
  }, []); // Пустой массив зависимостей гарантирует, что это выполнится только один раз при монтировании

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
