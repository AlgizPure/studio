/**
 * @fileoverview Вспомогательные функции для уведомлений в приложении.
 * Управляет сохранением, чтением и пометкой уведомлений в Firestore.
 */

import { collection, addDoc, doc, updateDoc, query, where, orderBy, limit, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { InAppNotification, NotificationType } from './types';

/**
 * Создает и сохраняет уведомление в приложении в Firestore.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} notification - Данные уведомления.
 * @returns {Promise<string>} - ID созданного уведомления.
 */
export async function createNotification(
  firestore: Firestore,
  userId: string,
  notification: Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  
  const notificationData: Omit<InAppNotification, 'id'> = {
    ...notification,
    userId,
    timestamp: now,
    read: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(
    collection(firestore, `users/${userId}/notifications`),
    notificationData
  );

  return docRef.id;
}

/**
 * Помечает уведомление как прочитанное.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {string} notificationId - ID уведомления.
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(
  firestore: Firestore,
  userId: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(firestore, `users/${userId}/notifications/${notificationId}`);
  await updateDoc(notificationRef, {
    read: true,
    readAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Помечает все уведомления пользователя как прочитанные.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<void>}
 */
export async function markAllNotificationsAsRead(
  firestore: Firestore,
  userId: string
): Promise<void> {
  const notificationsRef = collection(firestore, `users/${userId}/notifications`);
  const unreadQuery = query(notificationsRef, where('read', '==', false));
  const snapshot = await getDocs(unreadQuery);
  
  const now = new Date().toISOString();
  const updates = snapshot.docs.map(docRef =>
    updateDoc(docRef.ref, {
      read: true,
      readAt: now,
      updatedAt: now,
    })
  );

  await Promise.all(updates);
}

/**
 * Удаляет уведомление.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {string} notificationId - ID уведомления.
 * @returns {Promise<void>}
 */
export async function deleteNotification(
  firestore: Firestore,
  userId: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(firestore, `users/${userId}/notifications/${notificationId}`);
  await deleteDoc(notificationRef);
}

/**
 * Удаляет просроченные уведомления.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<void>}
 */
export async function deleteExpiredNotifications(
  firestore: Firestore,
  userId: string
): Promise<void> {
  const notificationsRef = collection(firestore, `users/${userId}/notifications`);
  const now = new Date().toISOString();
  const expiredQuery = query(
    notificationsRef,
    where('expiresAt', '<=', now)
  );
  const snapshot = await getDocs(expiredQuery);
  
  const deletions = snapshot.docs.map(docRef => deleteDoc(docRef.ref));
  await Promise.all(deletions);
}

/**
 * Получает количество непрочитанных уведомлений.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<number>} - Количество непрочитанных уведомлений.
 */
export async function getUnreadCount(
  firestore: Firestore,
  userId: string
): Promise<number> {
  const notificationsRef = collection(firestore, `users/${userId}/notifications`);
  const unreadQuery = query(
    notificationsRef,
    where('read', '==', false)
  );
  const snapshot = await getDocs(unreadQuery);
  return snapshot.size;
}

/**
 * Создает уведомление из push-сообщения.
 * Вызывается при получении push-уведомления FCM.
 * @param {any} payload - Данные push-уведомления.
 * @param {string} userId - ID пользователя.
 * @returns {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} - Данные уведомления.
 */
export function createNotificationFromPush(
  payload: any,
  userId: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  const notification = payload.notification || {};
  const data = payload.data || {};

  // Сопоставляем данные FCM с типом уведомления
  let type: NotificationType = 'habit_reminder';
  if (data.type) {
    type = data.type as NotificationType;
  } else if (data.habitId) {
    type = 'habit_reminder';
  } else if (data.workoutId) {
    type = 'workout_complete';
  } else if (data.streakValue) {
    type = 'streak_milestone';
  }

  return {
    type,
    title: notification.title || 'Уведомление',
    message: notification.body || data.message || '',
    actionUrl: data.actionUrl || data.url,
    actionLabel: data.actionLabel,
    data: {
      habitId: data.habitId,
      workoutId: data.workoutId,
      programId: data.programId,
      streakValue: data.streakValue ? parseInt(data.streakValue) : undefined,
    },
    priority: data.priority ? parseInt(data.priority) as 1 | 2 | 3 | 4 | 5 : undefined,
  };
}

/**
 * Создает уведомление-напоминание о привычке.
 * @param {string} habitId - ID привычки.
 * @param {string} habitName - Название привычки.
 * @param {string} [reminderTime] - Время напоминания.
 * @returns {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} - Данные уведомления.
 */
export function createHabitReminderNotification(
  habitId: string,
  habitName: string,
  reminderTime?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'habit_reminder',
    title: '⏰ Напоминание о привычке',
    message: `Время для: ${habitName}`,
    actionUrl: '/habits',
    actionLabel: 'Выполнить',
    data: { habitId },
    priority: 3,
  };
}

/**
 * Создает уведомление о достижении в серии.
 * @param {string} habitId - ID привычки.
 * @param {string} habitName - Название привычки.
 * @param {number} streakValue - Значение серии.
 * @returns {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} - Данные уведомления.
 * @throws {Error} - Если это не день достижения.
 */
export function createStreakMilestoneNotification(
  habitId: string,
  habitName: string,
  streakValue: number
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  const milestones = [7, 14, 30, 60, 90, 100, 180, 365];
  const isMilestone = milestones.includes(streakValue);

  if (!isMilestone) {
    // Уведомляем только в дни достижений
    throw new Error('Не день достижения');
  }

  return {
    type: 'streak_milestone',
    title: `🔥 Серия ${streakValue} дней!`,
    message: `Отлично! Вы поддерживаете "${habitName}" уже ${streakValue} дней!`,
    actionUrl: '/habits',
    actionLabel: 'Посмотреть серии',
    data: { habitId, streakValue },
    priority: streakValue >= 100 ? 5 : streakValue >= 30 ? 4 : 3,
  };
}

/**
 * Создает уведомление о завершении тренировки.
 * @param {string} workoutName - Название тренировки.
 * @param {string} [workoutId] - ID тренировки.
 * @returns {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} - Данные уведомления.
 */
export function createWorkoutCompleteNotification(
  workoutName: string,
  workoutId?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'workout_complete',
    title: '💪 Тренировка завершена!',
    message: `Отличная работа, вы завершили "${workoutName}"!`,
    actionUrl: workoutId ? `/programs/${workoutId}` : '/programs',
    actionLabel: 'Посмотреть',
    data: { workoutId },
    priority: 2,
  };
}

/**
 * Создает уведомление об инсайте от AI.
 * @param {string} insightTitle - Заголовок инсайта.
 * @param {string} insightMessage - Сообщение инсайта.
 * @param {string} [programId] - ID программы.
 * @returns {Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>} - Данные уведомления.
 */
export function createAIInsightNotification(
  insightTitle: string,
  insightMessage: string,
  programId?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'ai_insight',
    title: '🤖 Инсайт от AI',
    message: `${insightTitle}: ${insightMessage}`,
    actionUrl: programId ? `/programs/${programId}` : '/analytics',
    actionLabel: 'Посмотреть детали',
    data: { programId },
    priority: 3,
  };
}
