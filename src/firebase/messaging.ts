'use client';

/**
 * Firebase Cloud Messaging setup for push notifications
 * Handles permission requests, token management, and notification scheduling
 */

import { getMessaging, getToken, onMessage, type Messaging, type MessagePayload } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';
import { logger } from '@/lib/logger';

let messaging: Messaging | null = null;

/**
 * Initialize FCM messaging instance
 * Only works in browser environment
 */
export function initializeMessaging(app: FirebaseApp): Messaging | null {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    logger.error('[FCM] Failed to initialize messaging:', error);
    return null;
  }
}

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if permission denied
 */
export async function requestNotificationPermission(app: FirebaseApp): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) {
    logger.warn('[FCM] This browser does not support notifications');
    return null;
  }

  try {
    // Check current permission
    if (Notification.permission === 'granted') {
      return await getMessagingToken(app);
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getMessagingToken(app);
    } else {
      logger.debug('[FCM] Notification permission denied');
      return null;
    }
  } catch (error) {
    logger.error('[FCM] Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Get FCM registration token
 */
async function getMessagingToken(app: FirebaseApp): Promise<string | null> {
  const messagingInstance = initializeMessaging(app);
  if (!messagingInstance) return null;

  try {
    // VAPID key should be set in Firebase Console -> Project Settings -> Cloud Messaging
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      logger.warn('[FCM] VAPID key not configured');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    if (token) {
      logger.debug('[FCM] Registration token obtained: ' + token.substring(0, 20) + '...');
      return token;
    } else {
      logger.debug('[FCM] No registration token available');
      return null;
    }
  } catch (error) {
    logger.error('[FCM] Error getting token:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * Also saves notification to Firestore for in-app display
 */
export function onForegroundMessage(
  app: FirebaseApp,
  callback: (payload: MessagePayload) => void,
  saveToFirestore?: (notification: MessagePayload) => Promise<void>
) {
  const messagingInstance = initializeMessaging(app);
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, async (payload) => {
    logger.debug('[FCM] Foreground message received', { payload });
    
    // Save to Firestore for in-app notification center
    if (saveToFirestore) {
      try {
        await saveToFirestore(payload);
      } catch (error) {
        logger.error('[FCM] Failed to save notification to Firestore:', error);
      }
    }
    
    callback(payload);
  });
}

/**
 * Check if notifications are supported and enabled
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

/**
 * Subscribe user to habit reminders
 * Stores FCM token in user profile
 */
export async function subscribeToHabitReminders(
  app: FirebaseApp,
  userId: string,
  updateProfile: (data: { fcmToken: string }) => Promise<void>
): Promise<boolean> {
  try {
    const token = await requestNotificationPermission(app);
    if (!token) return false;

    // Save token to user profile
    await updateProfile({ fcmToken: token });
    logger.debug('[FCM] Subscribed to habit reminders');
    return true;
  } catch (error) {
    logger.error('[FCM] Failed to subscribe to reminders:', error);
    return false;
  }
}

/**
 * Schedule a local notification (fallback for when FCM is not available)
 */
export function scheduleLocalNotification(title: string, body: string, delayMs: number) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'habit-reminder',
      requireInteraction: false,
    });
  }, delayMs);
}

