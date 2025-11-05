/**
 * @fileoverview Вспомогательные функции для создания образцов уведомлений.
 * Полезно для разработки и тестирования.
 */

import type { InAppNotification } from './types';
import { createNotification } from './notification-helpers';
import type { Firestore } from 'firebase/firestore';

/**
 * Создает тестовое уведомление для разработки.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {InAppNotification['type']} [type='system'] - Тип уведомления.
 * @returns {Promise<string>} - ID созданного уведомления.
 */
export async function createTestNotification(
  firestore: Firestore,
  userId: string,
  type: InAppNotification['type'] = 'system'
): Promise<string> {
  const testNotifications: Record<InAppNotification['type'], Omit<InAppNotification, 'id' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>> = {
    habit_reminder: {
      type: 'habit_reminder',
      title: '⏰ Напоминание о привычке',
      message: 'Время выполнить: Пить воду',
      actionUrl: '/habits',
      actionLabel: 'Выполнить',
      data: { habitId: 'test-habit-1' },
      priority: 3,
    },
    workout_complete: {
      type: 'workout_complete',
      title: '💪 Тренировка завершена!',
      message: 'Отличная работа, вы завершили "Силовая на все тело"!',
      actionUrl: '/programs',
      actionLabel: 'Посмотреть прогресс',
      data: { workoutId: 'test-workout-1' },
      priority: 2,
    },
    streak_milestone: {
      type: 'streak_milestone',
      title: '🔥 Серия 30 дней!',
      message: 'Отлично! Вы поддерживаете "Медитация" уже 30 дней!',
      actionUrl: '/habits',
      actionLabel: 'Посмотреть серии',
      data: { habitId: 'test-habit-1', streakValue: 30 },
      priority: 4,
    },
    streak_broken: {
      type: 'streak_broken',
      title: '💔 Серия прервана',
      message: 'Ваша серия "Упражнения" закончилась. Начните новую!',
      actionUrl: '/habits',
      actionLabel: 'Перезапустить',
      data: { habitId: 'test-habit-2' },
      priority: 3,
    },
    ai_insight: {
      type: 'ai_insight',
      title: '🤖 Доступен инсайт от AI',
      message: 'Новые предложения по прогрессии для вашей тренировочной программы',
      actionUrl: '/analytics',
      actionLabel: 'Посмотреть инсайты',
      data: { programId: 'test-program-1' },
      priority: 3,
    },
    program_reminder: {
      type: 'program_reminder',
      title: '📅 Напоминание о программе',
      message: 'Время для тренировки "День жима"',
      actionUrl: '/programs',
      actionLabel: 'Начать тренировку',
      data: { programId: 'test-program-1' },
      priority: 3,
    },
    achievement: {
      type: 'achievement',
      title: '🏆 Достижение разблокировано!',
      message: 'Вы завершили 100 тренировок!',
      actionUrl: '/analytics',
      actionLabel: 'Посмотреть достижение',
      data: { achievementId: '100-workouts' },
      priority: 5,
    },
    system: {
      type: 'system',
      title: '🔔 Системное обновление',
      message: 'Доступны новые функции! Оцените улучшенный интерфейс.',
      actionUrl: '/',
      actionLabel: 'Узнать больше',
      priority: 2,
    },
  };

  const notification = testNotifications[type] || testNotifications.system;
  return await createNotification(firestore, userId, notification);
}

/**
 * Создает набор тестовых уведомлений разных типов.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<string[]>} - Массив ID созданных уведомлений.
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
