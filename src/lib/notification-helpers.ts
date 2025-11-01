/**
 * Helper functions for in-app notifications
 * Manages saving, reading, and marking notifications in Firestore
 */

import { collection, addDoc, doc, updateDoc, query, where, orderBy, limit, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { InAppNotification, NotificationType } from './types';

/**
 * Create and save an in-app notification to Firestore
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
 * Mark notification as read
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
 * Mark all notifications as read for a user
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
 * Delete a notification
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
 * Delete expired notifications
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
 * Get unread notification count
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
 * Create notification from push message
 * Called when FCM push notification is received
 */
export function createNotificationFromPush(
  payload: any,
  userId: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  const notification = payload.notification || {};
  const data = payload.data || {};

  // Map FCM data to notification type
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
    title: notification.title || 'Notification',
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
 * Create habit reminder notification
 */
export function createHabitReminderNotification(
  habitId: string,
  habitName: string,
  reminderTime?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'habit_reminder',
    title: '⏰ Habit Reminder',
    message: `Time for: ${habitName}`,
    actionUrl: '/habits',
    actionLabel: 'Complete',
    data: { habitId },
    priority: 3,
  };
}

/**
 * Create streak milestone notification
 */
export function createStreakMilestoneNotification(
  habitId: string,
  habitName: string,
  streakValue: number
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  const milestones = [7, 14, 30, 60, 90, 100, 180, 365];
  const isMilestone = milestones.includes(streakValue);

  if (!isMilestone) {
    // Only notify on milestone days
    throw new Error('Not a milestone day');
  }

  return {
    type: 'streak_milestone',
    title: `🔥 ${streakValue} Day Streak!`,
    message: `Amazing! You've maintained "${habitName}" for ${streakValue} days!`,
    actionUrl: '/habits',
    actionLabel: 'View Streaks',
    data: { habitId, streakValue },
    priority: streakValue >= 100 ? 5 : streakValue >= 30 ? 4 : 3,
  };
}

/**
 * Create workout complete notification
 */
export function createWorkoutCompleteNotification(
  workoutName: string,
  workoutId?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'workout_complete',
    title: '💪 Workout Complete!',
    message: `Great job completing "${workoutName}"!`,
    actionUrl: workoutId ? `/programs/${workoutId}` : '/programs',
    actionLabel: 'View',
    data: { workoutId },
    priority: 2,
  };
}

/**
 * Create AI insight notification
 */
export function createAIInsightNotification(
  insightTitle: string,
  insightMessage: string,
  programId?: string
): Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'ai_insight',
    title: '🤖 AI Insight',
    message: `${insightTitle}: ${insightMessage}`,
    actionUrl: programId ? `/programs/${programId}` : '/analytics',
    actionLabel: 'View Details',
    data: { programId },
    priority: 3,
  };
}

