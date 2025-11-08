// src/lib/analytics/date-utils.ts
// Date filtering and grouping utilities

import type { WorkoutLog } from '@/lib/types';
import type { TimeRange, GroupedWorkout } from './types';
import { calculateWorkoutVolume } from './volume';

export function getWorkoutsByDateRange(workouts: WorkoutLog[], range: TimeRange): WorkoutLog[] {
  if (range === 'all') return workouts;
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= cutoffDate;
  });
}

export function groupWorkoutsByPeriod(
  workouts: WorkoutLog[],
  period: 'day' | 'week' | 'month' = 'day'
): GroupedWorkout[] {
  const grouped: Record<string, GroupedWorkout> = {};
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    let key: string;
    if (period === 'day') {
      key = workout.date; // YYYY-MM-DD
    } else if (period === 'week') {
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      key = `${year}-W${week.toString().padStart(2, '0')}`;
    } else {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      key = `${year}-${month}`;
    }
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        totalVolume: 0,
        totalDuration: 0,
        workoutCount: 0,
      };
    }
    grouped[key].totalVolume += workout.totalVolume || calculateWorkoutVolume(workout);
    grouped[key].totalDuration += workout.duration || 0;
    grouped[key].workoutCount += 1;
  });
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
