// src/lib/analytics/index.ts
// Re-exports all analytics functions and types for backward compatibility

// Export all types
export type {
  TimeRange,
  GroupedWorkout,
  ExerciseProgressData,
  TrendData,
  DayFrequency,
  PersonalRecord,
  RPEDistribution,
  PeriodStats,
  ComparisonData,
} from './types';

// Export volume functions
export {
  calculateWorkoutVolume,
  calculateTotalVolume,
} from './volume';

// Export date utilities
export {
  getWorkoutsByDateRange,
  groupWorkoutsByPeriod,
} from './date-utils';

// Export exercise progress functions
export {
  getExerciseProgress,
  getUniqueExercises,
} from './exercise-progress';

// Export trend analysis functions
export {
  calculateTrend,
  generateTrendLine,
} from './trend-analysis';

// Export statistics functions
export {
  calculateStats,
  calculateDayFrequency,
  calculatePersonalRecords,
  calculateRPEDistribution,
  calculatePeriodStats,
  comparePeriods,
} from './statistics';

// Export formatters
export {
  formatVolume,
  formatDuration,
} from './formatters';
