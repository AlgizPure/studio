/**
 * Firebase Performance Monitoring Integration
 *
 * Tracks and analyzes app performance in production:
 * - Page load times (FCP, TTI)
 * - API response times (Firestore, AI API)
 * - User interactions (button clicks, form submissions)
 * - Custom traces for critical paths
 *
 * Module: Performance & Optimization (Module 14)
 * Function: 14.5 - Performance Monitoring
 * Reference: docs/requirements/14_performance_requirements.md
 */

import { getPerformance, trace as fbTrace, type Performance, type Trace } from 'firebase/performance';
import { getApp } from 'firebase/app';

let performance: Performance | null = null;

/**
 * Initialize Firebase Performance Monitoring
 * Called automatically in client-side Firebase config
 */
export function initializePerformance(): Performance | null {
  if (typeof window === 'undefined') {
    // Server-side: Performance monitoring not available
    return null;
  }

  if (performance) {
    return performance;
  }

  try {
    const app = getApp();
    performance = getPerformance(app);
    console.log('[Performance] Firebase Performance Monitoring initialized');
    return performance;
  } catch (error) {
    console.error('[Performance] Failed to initialize:', error);
    return null;
  }
}

/**
 * Get Performance instance (lazy initialization)
 */
export function getPerf(): Performance | null {
  if (!performance) {
    performance = initializePerformance();
  }
  return performance;
}

/**
 * Create a custom trace for measuring performance
 *
 * @example
 * const trace = createTrace('workout_execution');
 * trace.start();
 * // ... perform workout
 * trace.putMetric('exercise_count', 10);
 * trace.stop();
 */
export function createTrace(traceName: string): Trace | null {
  const perf = getPerf();
  if (!perf) return null;

  try {
    return fbTrace(perf, traceName);
  } catch (error) {
    console.error(`[Performance] Failed to create trace "${traceName}":`, error);
    return null;
  }
}

/**
 * Measure a function's execution time with automatic tracing
 *
 * @example
 * const result = await measurePerformance('load_workouts', async () => {
 *   return await fetchWorkouts();
 * });
 */
export async function measurePerformance<T>(
  traceName: string,
  fn: () => Promise<T>,
  metrics?: Record<string, number>
): Promise<T> {
  const trace = createTrace(traceName);

  if (trace) {
    trace.start();
  }

  try {
    const result = await fn();

    if (trace && metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        trace.putMetric(key, value);
      });
    }

    if (trace) {
      trace.stop();
    }

    return result;
  } catch (error) {
    if (trace) {
      trace.stop();
    }
    throw error;
  }
}

/**
 * Trace helper for synchronous operations
 *
 * @example
 * const result = traceSync('calculate_volume', () => {
 *   return calculateTotalVolume(exercises);
 * });
 */
export function traceSync<T>(
  traceName: string,
  fn: () => T,
  metrics?: Record<string, number>
): T {
  const trace = createTrace(traceName);

  if (trace) {
    trace.start();
  }

  try {
    const result = fn();

    if (trace && metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        trace.putMetric(key, value);
      });
    }

    if (trace) {
      trace.stop();
    }

    return result;
  } catch (error) {
    if (trace) {
      trace.stop();
    }
    throw error;
  }
}

/**
 * Common trace names for consistency
 */
export const TraceNames = {
  // Page loads
  PAGE_LOAD_DASHBOARD: 'page_load_dashboard',
  PAGE_LOAD_WORKOUTS: 'page_load_workouts',
  PAGE_LOAD_PROGRAMS: 'page_load_programs',
  PAGE_LOAD_ANALYTICS: 'page_load_analytics',
  PAGE_LOAD_LIBRARY: 'page_load_library',

  // Workout execution
  WORKOUT_START: 'workout_start',
  WORKOUT_COMPLETE: 'workout_complete',
  EXERCISE_LOG: 'exercise_log_save',

  // AI operations
  AI_INSIGHTS_GENERATE: 'ai_insights_generate',
  AI_PROGRESSIONS: 'ai_progressions_generate',
  AI_HABIT_INSIGHTS: 'ai_habit_insights_generate',
  AI_RECOMMENDATIONS: 'ai_recommendations_generate',

  // Firestore operations
  FIRESTORE_LOAD_WORKOUTS: 'firestore_load_workouts',
  FIRESTORE_LOAD_EXERCISES: 'firestore_load_exercises',
  FIRESTORE_SAVE_WORKOUT: 'firestore_save_workout',

  // Analytics
  ANALYTICS_CALCULATE: 'analytics_calculate_stats',
  ANALYTICS_CHART_RENDER: 'analytics_chart_render',

  // Habits
  HABIT_LOAD: 'habit_load_data',
  HABIT_LOG: 'habit_log_save',
  HABIT_REFLECTION_SAVE: 'habit_reflection_save',
  HABIT_WHEEL_OF_LIFE: 'habit_wheel_of_life_assess',
} as const;

/**
 * Auto-initialize performance monitoring when module is imported
 * Only runs on client-side
 */
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    initializePerformance();
  }, 100);
}
