// This file acts as a single entry point for all Firebase-related functionality.
// It re-exports providers, hooks, and utilities for easy import throughout the app.

// Export initialization function
export { initializeFirebase } from './init';

// Export core providers and hooks
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth, useStorage } from './provider';

// Export Authentication hooks
export { useUser } from './auth/use-user';
export type { User } from 'firebase/auth';

// Export Firestore hooks and utilities
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
export { useMemoFirebase } from './provider';

// Export Storage hooks
export { useUploadFile } from './storage/use-upload-file';
export { useDownloadUrl } from './storage/use-download-url';

// Export error handling utilities
export * from './errors';
export { errorEmitter } from './error-emitter';
