'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * @fileoverview Функции для инициализации Firebase и получения SDK.
 */

/**
 * Инициализирует Firebase, если это еще не сделано.
 * @returns {{ firebaseApp: FirebaseApp, auth: import('firebase/auth').Auth, firestore: import('firebase/firestore').Firestore, storage: import('firebase/storage').FirebaseStorage }} - Объект с сервисами Firebase.
 */
// ВАЖНО: НЕ ИЗМЕНЯЙТЕ ЭТУ ФУНКЦИЮ
export function initializeFirebase() {
  if (!getApps().length) {
    // Если объект конфигурации не заполнен полностью, Firebase попытается инициализироваться из окружения.
    // Это рекомендуемый способ для App Hosting.
    // В качестве запасного варианта для локальной разработки мы используем файл конфигурации.
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Автоматическая инициализация не удалась. Используется объект конфигурации firebase.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

/**
 * Получает SDK Firebase из экземпляра приложения.
 * @param {FirebaseApp} firebaseApp - Экземпляр Firebase App.
 * @returns {{ firebaseApp: FirebaseApp, auth: import('firebase/auth').Auth, firestore: import('firebase/firestore').Firestore, storage: import('firebase/storage').FirebaseStorage }} - Объект с сервисами Firebase.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}
