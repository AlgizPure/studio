
/**
 * @fileoverview Этот файл используется для настройки проекта Firebase.
 * Рекомендуется использовать переменные окружения для этого.
 * @see https://firebase.google.com/docs/web/setup#config-object
 */

/**
 * Конфигурация Firebase.
 * @type {object}
 * @property {string | undefined} apiKey - Ключ API.
 * @property {string | undefined} authDomain - Домен аутентификации.
 * @property {string | undefined} projectId - ID проекта.
 * @property {string | undefined} storageBucket - Хранилище.
 * @property {string | undefined} messagingSenderId - ID отправителя сообщений.
 * @property {string | undefined} appId - ID приложения.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
