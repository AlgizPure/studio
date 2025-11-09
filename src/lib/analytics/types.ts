// src/lib/analytics/types.ts
// Type definitions for analytics

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export type GroupedWorkout = {
  date: string; // YYYY-MM-DD or YYYY-WW or YYYY-MM
  totalVolume: number;
  totalDuration: number;
  workoutCount: number;
};

export type ExerciseProgressData = {
  date: string;
  exerciseName: string;
  maxWeight: number;
  avgWeight: number;
  avgRPE: number;
  totalVolume: number;
  totalReps: number;
};

export type TrendData = {
  slope: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercentage: number;
};

/**
 * Day frequency data structure
 */
export type DayFrequency = {
  dayOfWeek: string;
  dayIndex: number; // 0-6 (Mon=0)
  count: number;
  avgVolume: number;
  avgDuration: number;
};

/**
 * Personal record data structure
 */
export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxVolume: number; // за одну тренировку
  maxReps: number; // за один подход
  date: string; // дата установки рекорда
  recentProgress: 'improving' | 'stable' | 'declining';
};

/**
 * RPE distribution data structure
 */
export type RPEDistribution = {
  rpe: number; // 1-10
  count: number; // количество подходов
  percentage: number; // процент от общего
};

/**
 * Period statistics data structure
 */
export type PeriodStats = {
  totalWorkouts: number;
  totalVolume: number;
  avgDuration: number;
  avgRPE: number;
  consistency: number;
};

/**
 * Comparison data structure
 */
export type ComparisonData = {
  metric: string;
  current: number;
  previous: number;
  change: number; // процент изменения
  changeType: 'positive' | 'negative' | 'neutral';
};
