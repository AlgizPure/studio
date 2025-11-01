/**
 * Firebase Cloud Messaging Service Worker
 * Handles background notifications when app is not active
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// These values should match your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Habit Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'Time to complete your habit',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.habitId || 'habit-reminder',
    data: payload.data,
    actions: [
      { action: 'complete', title: '✓ Done' },
      { action: 'snooze', title: '⏰ Snooze 30m' },
      { action: 'skip', title: '× Skip' },
    ],
    requireInteraction: payload.data?.untilDone === 'true',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const habitId = event.notification.data?.habitId;
  
  if (event.action === 'complete') {
    // Open app and complete habit
    event.waitUntil(
      clients.openWindow(`/?action=complete&habitId=${habitId}`)
    );
  } else if (event.action === 'snooze') {
    // Reschedule notification for 30 minutes later
    event.waitUntil(
      clients.openWindow(`/?action=snooze&habitId=${habitId}&delay=30`)
    );
  } else if (event.action === 'skip') {
    // Mark as skipped
    event.waitUntil(
      clients.openWindow(`/?action=skip&habitId=${habitId}`)
    );
  } else {
    // Default: just open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

