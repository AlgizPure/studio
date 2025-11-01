/**
 * Helper functions for AI analytics: fetching workouts, aggregating exercise history, caching
 */

import type { WorkoutLog, Program } from '@/lib/types';
import type { Firestore } from 'firebase-admin/firestore';
import type { Timestamp } from 'firebase-admin/firestore';

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
 * Fetch recent workouts from Firestore
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
 * Aggregate exercise history from workout logs
 */
export async function getExerciseHistory(
  firestore: Firestore,
  userId: string,
  programId: string,
  days: number = 30
): Promise<Record<string, ExerciseHistory>> {
  const workouts = await getRecentWorkouts(firestore, userId, days);
  
  // Filter workouts for this program
  const programWorkouts = workouts.filter(w => w.programId === programId);

  const history: Record<string, ExerciseHistory> = {};

  programWorkouts.forEach(log => {
    log.cycles.forEach(cycle => {
      cycle.exercises.forEach(ex => {
        const exId = ex.exerciseId;
        if (!history[exId]) {
          history[exId] = { sessions: [] };
        }

        // Calculate RPE and volume for this session
        const setsWithRPE = ex.sets.filter(s => s.rpe !== undefined);
        const avgRPE = setsWithRPE.length > 0
          ? setsWithRPE.reduce((sum, s) => sum + (s.rpe || 0), 0) / setsWithRPE.length
          : 7.5; // Default if no RPE

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
 * Get cached insights from Firestore
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

  // Check if expired
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
 * Save insights to cache in Firestore
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
    now.toMillis() + (type === 'quick_insights' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000) // 24h or 7 days
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
 * Check and update AI usage limits
 */
export type AIUsage = {
  date: string; // YYYY-MM-DD
  insightsCount: number;
  progressionsCount: number;
  tokensUsed: number;
};

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

  // Check limits (10 insights/day, 10 progressions/day)
  const maxCount = 10;
  const currentCount = type === 'insights' ? usage.insightsCount : usage.progressionsCount;

  if (currentCount >= maxCount) {
    return { allowed: false, usage };
  }

  // Update usage
  const updatedUsage: AIUsage = {
    date: today,
    ...usage,
    insightsCount: type === 'insights' ? usage.insightsCount + 1 : usage.insightsCount,
    progressionsCount: type === 'progressions' ? usage.progressionsCount + 1 : usage.progressionsCount,
  };

  await firestore.collection(`users/${userId}/aiUsage`).doc(today).set(updatedUsage);
  return { allowed: true, usage: updatedUsage };
}
