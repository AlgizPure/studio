/**
 * @fileoverview Вспомогательные функции для аналитики AI: получение тренировок, агрегация истории упражнений, кэширование.
 */

import type { WorkoutLog, Program } from '@/lib/types';
import type { Firestore } from 'firebase-admin/firestore';
import type { Timestamp } from 'firebase-admin/firestore';

/**
 * @typedef {object} ExerciseHistory
 * История выполнения упражнения.
 * @property {Array<{ date: string; sets: Array<{ reps: number; weight?: number; rpe?: number }>; avgRPE: number; totalVolume: number }>} sessions - Массив сессий.
 */
export type ExerciseHistory = {
  sessions: Array<{
    date: string;
    sets: Array<{
      reps: number;
      weight?: number;
      rpe?: number;
    }>;
    avgRPE: number;
    totalVolume: number;
  }>;
};

/**
 * @typedef {object} AIInsightCache
 * Кэш инсайтов AI.
 * @property {string} id - ID кэша.
 * @property {'quick_insights' | 'progressions'} type - Тип инсайта.
 * @property {any} data - Данные инсайта.
 * @property {string} [timeframe] - Временной промежуток.
 * @property {string} [programId] - ID программы.
 * @property {Timestamp} generatedAt - Время генерации.
 * @property {Timestamp} expiresAt - Время истечения.
 * @property {number} [tokensUsed] - Использованные токены.
 */
export type AIInsightCache = {
  id: string;
  type: 'quick_insights' | 'progressions';
  data: any;
  timeframe?: string;
  programId?: string;
  generatedAt: Timestamp;
  expiresAt: Timestamp;
  tokensUsed?: number;
};

/**
 * Получает недавние тренировки из Firestore.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {number} days - Количество дней для получения.
 * @returns {Promise<WorkoutLog[]>} - Массив логов тренировок.
 */
export async function getRecentWorkouts(
  firestore: Firestore,
  userId: string,
  days: number
): Promise<WorkoutLog[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffISO = cutoffDate.toISOString().split('T')[0];

  const snapshot = await firestore.collection(`users/${userId}/workoutLogs`)
    .where('date', '>=', cutoffISO)
    .orderBy('date', 'desc')
    .limit(100)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog));
}

/**
 * Агрегирует историю упражнений из логов тренировок.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {string} programId - ID программы.
 * @param {number} [days=30] - Количество дней для агрегации.
 * @returns {Promise<Record<string, ExerciseHistory>>} - Объект с историей упражнений.
 */
export async function getExerciseHistory(
  firestore: Firestore,
  userId: string,
  programId: string,
  days: number = 30
): Promise<Record<string, ExerciseHistory>> {
  const workouts = await getRecentWorkouts(firestore, userId, days);
  
  // Фильтруем тренировки для этой программы
  const programWorkouts = workouts.filter(w => w.programId === programId);

  const history: Record<string, ExerciseHistory> = {};

  programWorkouts.forEach(log => {
    log.cycles.forEach(cycle => {
      cycle.exercises.forEach(ex => {
        const exId = ex.exerciseId;
        if (!history[exId]) {
          history[exId] = { sessions: [] };
        }

        // Вычисляем RPE и объем для этой сессии
        const setsWithRPE = ex.sets.filter(s => s.rpe !== undefined);
        const avgRPE = setsWithRPE.length > 0
          ? setsWithRPE.reduce((sum, s) => sum + (s.rpe || 0), 0) / setsWithRPE.length
          : 7.5; // Значение по умолчанию, если нет RPE

        const totalVolume = ex.sets.reduce((sum, set) => {
          if (set.weight && set.completed) {
            return sum + (set.weight * set.reps);
          }
          return sum;
        }, 0);

        history[exId].sessions.push({
          date: log.date,
          sets: ex.sets.map(s => ({
            reps: s.reps,
            weight: s.weight,
            rpe: s.rpe,
          })),
          avgRPE,
          totalVolume,
        });
      });
    });
  });

  return history;
}

/**
 * Получает кэшированные инсайты из Firestore.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {'quick_insights' | 'progressions'} type - Тип инсайта.
 * @param {string} [timeframe] - Временной промежуток.
 * @param {string} [programId] - ID программы.
 * @returns {Promise<AIInsightCache | null>} - Кэшированный инсайт или null.
 */
export async function getCachedInsights(
  firestore: Firestore,
  userId: string,
  type: 'quick_insights' | 'progressions',
  timeframe?: string,
  programId?: string
): Promise<AIInsightCache | null> {
  const cacheDoc = await firestore.collection(`users/${userId}/aiInsights`)
    .doc(`${type}_${timeframe || 'default'}_${programId || 'all'}`)
    .get();

  if (!cacheDoc.exists) {
    return null;
  }

  const data = cacheDoc.data() as Omit<AIInsightCache, 'generatedAt' | 'expiresAt'> & {
    generatedAt: any;
    expiresAt: any;
  };

  // Проверяем, не истек ли срок действия
  if (data.expiresAt?.toMillis && data.expiresAt.toMillis() < Date.now()) {
    return null;
  }

  return {
    ...data,
    generatedAt: data.generatedAt,
    expiresAt: data.expiresAt,
  };
}

/**
 * Сохраняет инсайты в кэш в Firestore.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {'quick_insights' | 'progressions'} type - Тип инсайта.
 * @param {any} data - Данные для кэширования.
 * @param {string} [timeframe] - Временной промежуток.
 * @param {string} [programId] - ID программы.
 * @param {number} [tokensUsed] - Использованные токены.
 * @returns {Promise<void>}
 */
export async function saveInsightsCache(
  firestore: Firestore,
  userId: string,
  type: 'quick_insights' | 'progressions',
  data: any,
  timeframe?: string,
  programId?: string,
  tokensUsed?: number
): Promise<void> {
  const { Timestamp } = await import('firebase-admin/firestore');
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + (type === 'quick_insights' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000) // 24 часа или 7 дней
  );

  const cacheRef = firestore.collection(`users/${userId}/aiInsights`)
    .doc(`${type}_${timeframe || 'default'}_${programId || 'all'}`);
  
  await cacheRef.set({
    id: cacheRef.id,
    type,
    data,
    timeframe,
    programId,
    generatedAt: now,
    expiresAt,
    tokensUsed: tokensUsed || 0,
  });
}

/**
 * @typedef {object} AIUsage
 * Использование AI.
 * @property {string} date - Дата (ГГГГ-ММ-ДД).
 * @property {number} insightsCount - Количество инсайтов.
 * @property {number} progressionsCount - Количество прогрессий.
 * @property {number} tokensUsed - Использованные токены.
 */
export type AIUsage = {
  date: string; // YYYY-MM-DD
  insightsCount: number;
  progressionsCount: number;
  tokensUsed: number;
};

/**
 * Проверяет и обновляет лимиты использования AI.
 * @param {Firestore} firestore - Экземпляр Firestore.
 * @param {string} userId - ID пользователя.
 * @param {'insights' | 'progressions'} type - Тип использования.
 * @returns {Promise<{ allowed: boolean; usage: AIUsage }>} - Объект с разрешением и использованием.
 */
export async function checkAndUpdateUsage(
  firestore: Firestore,
  userId: string,
  type: 'insights' | 'progressions'
): Promise<{ allowed: boolean; usage: AIUsage }> {
  const today = new Date().toISOString().split('T')[0];
  const usageDoc = await firestore.collection(`users/${userId}/aiUsage`).doc(today).get();

  let usage: AIUsage;
  if (usageDoc.exists) {
    usage = usageDoc.data() as AIUsage;
  } else {
    usage = {
      date: today,
      insightsCount: 0,
      progressionsCount: 0,
      tokensUsed: 0,
    };
  }

  // Проверяем лимиты (10 инсайтов/день, 10 прогрессий/день)
  const maxCount = 10;
  const currentCount = type === 'insights' ? usage.insightsCount : usage.progressionsCount;

  if (currentCount >= maxCount) {
    return { allowed: false, usage };
  }

  // Обновляем использование
  const updatedUsage: AIUsage = {
    ...usage,
    date: today,
    insightsCount: type === 'insights' ? usage.insightsCount + 1 : usage.insightsCount,
    progressionsCount: type === 'progressions' ? usage.progressionsCount + 1 : usage.progressionsCount,
  };

  await firestore.collection(`users/${userId}/aiUsage`).doc(today).set(updatedUsage);
  return { allowed: true, usage: updatedUsage };
}
