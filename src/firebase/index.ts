/**
 * @fileoverview Этот файл служит единой точкой входа для всей функциональности, связанной с Firebase.
 * Он реэкспортирует провайдеры, хуки и утилиты для удобного импорта во всем приложении.
 */

// Экспорт функции инициализации
export { initializeFirebase } from './init';

// Экспорт основных провайдеров и хуков
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth, useStorage } from './provider';

// Экспорт хуков аутентификации
export { useUser } from './auth/use-user';
export type { User } from 'firebase/auth';

// Экспорт хуков и утилит Firestore
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
export { useMemoFirebase } from './provider';

// Экспорт хуков Storage
export { useUploadFile } from './storage/use-upload-file';
export { useDownloadUrl } from './storage/use-download-url';

// Экспорт утилит для обработки ошибок
export * from './errors';
export { errorEmitter } from './error-emitter';
