'use server'

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

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
