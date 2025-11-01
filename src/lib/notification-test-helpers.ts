/**
 * Test helpers for creating sample notifications
 * Useful for development and testing
 */

import type { InAppNotification } from './types';
import { createNotification } from './notification-helpers';
import type { Firestore } from 'firebase/firestore';

/**
 * Create a test notification for development
 */
export async function createTestNotification(
  firestore: Firestore,
  userId: string,
  type: InAppNotification['type'] = 'system'
): Promise<string> {
  const testNotifications: Record<InAppNotification['type'], Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>> = {
    habit_reminder: {
      type: 'habit_reminder',
      title: '⏰ Habit Reminder',
      message: 'Time to complete: Drink Water',
      actionUrl: '/habits',
      actionLabel: 'Complete',
      data: { habitId: 'test-habit-1' },
      priority: 3,
    },
    workout_complete: {
      type: 'workout_complete',
      title: '💪 Workout Complete!',
      message: 'Great job completing "Full Body Strength"!',
      actionUrl: '/programs',
      actionLabel: 'View Progress',
      data: { workoutId: 'test-workout-1' },
      priority: 2,
    },
    streak_milestone: {
      type: 'streak_milestone',
      title: '🔥 30 Day Streak!',
      message: 'Amazing! You\'ve maintained "Meditation" for 30 days!',
      actionUrl: '/habits',
      actionLabel: 'View Streaks',
      data: { habitId: 'test-habit-1', streakValue: 30 },
      priority: 4,
    },
    streak_broken: {
      type: 'streak_broken',
      title: '💔 Streak Broken',
      message: 'Your "Exercise" streak has ended. Start a new one!',
      actionUrl: '/habits',
      actionLabel: 'Restart',
      data: { habitId: 'test-habit-2' },
      priority: 3,
    },
    ai_insight: {
      type: 'ai_insight',
      title: '🤖 AI Insight Available',
      message: 'New progression suggestions for your training program',
      actionUrl: '/analytics',
      actionLabel: 'View Insights',
      data: { programId: 'test-program-1' },
      priority: 3,
    },
    program_reminder: {
      type: 'program_reminder',
      title: '📅 Program Reminder',
      message: 'Time for your "Push Day" workout',
      actionUrl: '/programs',
      actionLabel: 'Start Workout',
      data: { programId: 'test-program-1' },
      priority: 3,
    },
    achievement: {
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: 'You\'ve completed 100 workouts!',
      actionUrl: '/analytics',
      actionLabel: 'View Achievement',
      data: { achievementId: '100-workouts' },
      priority: 5,
    },
    system: {
      type: 'system',
      title: '🔔 System Update',
      message: 'New features available! Check out the enhanced UI.',
      actionUrl: '/',
      actionLabel: 'Learn More',
      priority: 2,
    },
  };

  const notification = testNotifications[type] || testNotifications.system;
  return await createNotification(firestore, userId, notification);
}

/**
 * Create multiple test notifications for different types
 */
export async function createTestNotificationSet(
  firestore: Firestore,
  userId: string
): Promise<string[]> {
  const types: InAppNotification['type'][] = [
    'habit_reminder',
    'workout_complete',
    'streak_milestone',
    'ai_insight',
    'achievement',
  ];

  const ids = await Promise.all(
    types.map(type => createTestNotification(firestore, userId, type))
  );

  return ids;
}

