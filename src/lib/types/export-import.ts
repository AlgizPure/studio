import type { Habit, HabitLog, HabitStreak } from './habit';
import type { HabitInsight } from './insight';
import type { AnalysisSystem } from './system';

// ===============================
// EXPORT / IMPORT
// ===============================

export type HabitExportV1 = {
  version: '1.0';
  exportDate: string;
  userId: string;
  habits: Habit[]; // Can be both Legacy and V2 habits
  logs: HabitLog[];
  streaks: HabitStreak[];
  insights: HabitInsight[];
  activeSystems: { systemId: string; systemVersion: string }[];
  systemDefinitions?: AnalysisSystem[];
  metadata: {
    totalHabits: number;
    dateRange: { from: string; to: string };
    completionRate: number;
  };
};
