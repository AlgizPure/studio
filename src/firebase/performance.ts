// src/firebase/performance.ts
// Module 14 - Function 14.5: Firebase Performance Monitoring
// Performance tracking for page loads, API calls, and user interactions

import type { FirebaseApp } from 'firebase/app';
import { getPerformance, type Performance, trace, type Trace } from 'firebase/performance';
import { logger } from '@/lib/logger';

/**
 * Firebase Performance instance (singleton)
 */
let perfInstance: Performance | null = null;

/**
 * Initialize Firebase Performance Monitoring
 * Called from Firebase initialization (src/firebase/init.ts)
 *
 * Note: Performance SDK is client-side only
 */
export function initializePerformance(app: FirebaseApp): void {
  // Performance SDK only works in browser
  if (typeof window === 'undefined') {
    logger.info('[Performance] Skipping initialization (server-side)');
    return;
  }

  try {
    // Delay initialization slightly to avoid blocking app startup
    setTimeout(() => {
      try {
        perfInstance = getPerformance(app);
        logger.info('[Performance] Firebase Performance Monitoring initialized');
      } catch (error) {
        logger.error('[Performance] Initialization failed:', error);
      }
    }, 100); // 100ms delay
  } catch (error) {
    logger.error('[Performance] Setup error:', error);
  }
}

/**
 * Get Performance instance
 * Returns null if not initialized or on server-side
 */
export function getPerf(): Performance | null {
  return perfInstance;
}

/**
 * Predefined trace names for consistency
 */
export const TraceNames = {
  // Page loads
  PAGE_DASHBOARD: 'page_dashboard',
  PAGE_WORKOUTS: 'page_workouts',
  PAGE_PROGRAMS: 'page_programs',
  PAGE_EXERCISES: 'page_exercises',
  PAGE_ANALYTICS: 'page_analytics',
  PAGE_HABITS: 'page_habits',

  // Workout execution
  WORKOUT_EXECUTION: 'workout_execution',
  EXERCISE_COMPLETION: 'exercise_completion',
  WORKOUT_SAVE: 'workout_save',

  // Firestore queries
  FIRESTORE_QUERY: 'firestore_query',
  FIRESTORE_WRITE: 'firestore_write',
  FIRESTORE_BATCH: 'firestore_batch',

  // AI API calls
  AI_API_CALL: 'ai_api_call',
  AI_PROGRESSIONS: 'ai_progressions',
  AI_INSIGHTS: 'ai_insights',
  AI_RECOMMENDATIONS: 'ai_recommendations',
  AI_HABIT_INSIGHTS: 'ai_habit_insights',

  // Habit tracking
  HABIT_LOG_SAVE: 'habit_log_save',
  DAILY_REFLECTION_SAVE: 'daily_reflection_save',
  WEEKLY_CONTEXT_SAVE: 'weekly_context_save',
} as const;

export type TraceName = typeof TraceNames[keyof typeof TraceNames];

/**
 * Create a custom performance trace
 * Returns null if Performance not initialized
 *
 * Usage:
 * ```ts
 * const myTrace = createTrace(TraceNames.WORKOUT_EXECUTION);
 * if (myTrace) {
 *   myTrace.start();
 *   // ... do work
 *   myTrace.putMetric('exercise_count', 5);
 *   myTrace.stop();
 * }
 * ```
 */
export function createTrace(traceName: string): Trace | null {
  const perf = getPerf();
  if (!perf) {
    logger.debug('[Performance] Trace skipped (not initialized):', traceName);
    return null;
  }

  try {
    return trace(perf, traceName);
  } catch (error) {
    logger.error('[Performance] Failed to create trace:', traceName, error);
    return null;
  }
}

/**
 * Measure performance of an async function
 * Automatically starts/stops trace and handles errors
 *
 * Usage:
 * ```ts
 * const result = await measurePerformance(
 *   TraceNames.WORKOUT_SAVE,
 *   async () => saveWorkout(data),
 *   { exercise_count: 5, duration_min: 45 }
 * );
 * ```
 */
export async function measurePerformance<T>(
  traceName: string,
  fn: () => Promise<T>,
  metrics?: Record<string, number>
): Promise<T> {
  const performanceTrace = createTrace(traceName);

  if (performanceTrace) {
    performanceTrace.start();
  }

  try {
    const result = await fn();

    if (performanceTrace) {
      // Add custom metrics
      if (metrics) {
        Object.entries(metrics).forEach(([key, value]) => {
          performanceTrace.putMetric(key, value);
        });
      }
      performanceTrace.stop();
    }

    return result;
  } catch (error) {
    // Stop trace even on error
    if (performanceTrace) {
      performanceTrace.stop();
    }
    throw error;
  }
}

/**
 * Measure performance of a synchronous function
 * For sync operations, wraps in Promise.resolve
 *
 * Usage:
 * ```ts
 * const result = traceSync(
 *   TraceNames.HABIT_LOG_SAVE,
 *   () => processHabitLog(log),
 *   { habit_count: 10 }
 * );
 * ```
 */
export function traceSync<T>(
  traceName: string,
  fn: () => T,
  metrics?: Record<string, number>
): T {
  const performanceTrace = createTrace(traceName);

  if (performanceTrace) {
    performanceTrace.start();
  }

  try {
    const result = fn();

    if (performanceTrace) {
      if (metrics) {
        Object.entries(metrics).forEach(([key, value]) => {
          performanceTrace.putMetric(key, value);
        });
      }
      performanceTrace.stop();
    }

    return result;
  } catch (error) {
    if (performanceTrace) {
      performanceTrace.stop();
    }
    throw error;
  }
}

/**
 * Export Trace type for component usage
 */
export type { Trace };
