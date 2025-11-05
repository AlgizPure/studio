'use server'

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

/**
 * @fileoverview Инициализация и получение экземпляра Firebase Admin SDK.
 */

/**
 * Учетные данные сервисного аккаунта Firebase.
 * @type {object | undefined}
 */
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

/**
 * Получает или инициализирует экземпляр Firebase Admin App.
 * @returns {App} - Экземпляр Firebase Admin App.
 */
function getFirebaseAdminApp(): App {
  if (getApps().length > 0 && getApps().find(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }
  return initializeApp(
    {
      credential: cert(serviceAccount!),
    },
    'admin'
  );
}

export { getFirebaseAdminApp };
