'use client';

/**
 * @fileoverview Настройка Firebase Cloud Messaging для push-уведомлений.
 * Обрабатывает запросы на разрешение, управление токенами и планирование уведомлений.
 */

import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';

let messaging: Messaging | null = null;

/**
 * Инициализирует экземпляр FCM messaging.
 * Работает только в окружении браузера.
 * @param {FirebaseApp} app - Экземпляр Firebase App.
 * @returns {Messaging | null} - Экземпляр Messaging или null.
 */
export function initializeMessaging(app: FirebaseApp): Messaging | null {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error('[FCM] Не удалось инициализировать messaging:', error);
    return null;
  }
}

/**
 * Запрашивает разрешение на отправку уведомлений и получает токен FCM.
 * @param {FirebaseApp} app - Экземпляр Firebase App.
 * @returns {Promise<string | null>} - Токен FCM или null, если разрешение отклонено.
 */
export async function requestNotificationPermission(app: FirebaseApp): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) {
    console.warn('[FCM] Этот браузер не поддерживает уведомления');
    return null;
  }

  try {
    // Проверяем текущее разрешение
    if (Notification.permission === 'granted') {
      return await getMessagingToken(app);
    }

    // Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getMessagingToken(app);
    } else {
      console.log('[FCM] Разрешение на уведомления отклонено');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Ошибка при запросе разрешения на уведомления:', error);
    return null;
  }
}

/**
 * Получает регистрационный токен FCM.
 * @param {FirebaseApp} app - Экземпляр Firebase App.
 * @returns {Promise<string | null>} - Токен FCM или null.
 */
async function getMessagingToken(app: FirebaseApp): Promise<string | null> {
  const messagingInstance = initializeMessaging(app);
  if (!messagingInstance) return null;

  try {
    // VAPID-ключ должен быть установлен в Firebase Console -> Project Settings -> Cloud Messaging
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] VAPID-ключ не настроен');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    if (token) {
      console.log('[FCM] Регистрационный токен получен:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('[FCM] Регистрационный токен недоступен');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Ошибка при получении токена:', error);
    return null;
  }
}

/**
 * Прослушивает сообщения в активном окне.
 * Также сохраняет уведомление в Firestore для отображения в приложении.
 * @param {FirebaseApp} app - Экземпляр Firebase App.
 * @param {(payload: any) => void} callback - Функция обратного вызова при получении сообщения.
 * @param {(notification: any) => Promise<void>} [saveToFirestore] - Функция для сохранения уведомления в Firestore.
 * @returns {() => void} - Функция для отписки.
 */
export function onForegroundMessage(
  app: FirebaseApp, 
  callback: (payload: any) => void,
  saveToFirestore?: (notification: any) => Promise<void>
) {
  const messagingInstance = initializeMessaging(app);
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, async (payload) => {
    console.log('[FCM] Получено сообщение в активном окне:', payload);
    
    // Сохраняем в Firestore для центра уведомлений в приложении
    if (saveToFirestore) {
      try {
        await saveToFirestore(payload);
      } catch (error) {
        console.error('[FCM] Не удалось сохранить уведомление в Firestore:', error);
      }
    }
    
    callback(payload);
  });
}

/**
 * Проверяет, поддерживаются ли и включены ли уведомления.
 * @returns {boolean} - true, если уведомления поддерживаются.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Получает текущий статус разрешения на уведомления.
 * @returns {NotificationPermission | null} - Статус разрешения.
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

/**
 * Подписывает пользователя на напоминания о привычках.
 * Сохраняет токен FCM в профиле пользователя.
 * @param {FirebaseApp} app - Экземпляр Firebase App.
 * @param {string} userId - ID пользователя.
 * @param {(data: { fcmToken: string }) => Promise<void>} updateProfile - Функция для обновления профиля пользователя.
 * @returns {Promise<boolean>} - true, если подписка прошла успешно.
 */
export async function subscribeToHabitReminders(
  app: FirebaseApp,
  userId: string,
  updateProfile: (data: { fcmToken: string }) => Promise<void>
): Promise<boolean> {
  try {
    const token = await requestNotificationPermission(app);
    if (!token) return false;

    // Сохраняем токен в профиле пользователя
    await updateProfile({ fcmToken: token });
    console.log('[FCM] Подписан на напоминания о привычках');
    return true;
  } catch (error) {
    console.error('[FCM] Не удалось подписаться на напоминания:', error);
    return false;
  }
}

/**
 * Планирует локальное уведомление (запасной вариант, когда FCM недоступен).
 * @param {string} title - Заголовок уведомления.
 * @param {string} body - Текст уведомления.
 * @param {number} delayMs - Задержка в миллисекундах.
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
