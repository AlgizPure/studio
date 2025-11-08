// src/lib/analytics/statistics.ts
// Advanced statistics utilities

import type { WorkoutLog } from '@/lib/types';
import type { TimeRange, DayFrequency, PersonalRecord, RPEDistribution, PeriodStats, ComparisonData } from './types';
import { calculateWorkoutVolume, calculateTotalVolume } from './volume';
import { getWorkoutsByDateRange } from './date-utils';
import { calculateTrend } from './trend-analysis';

export function calculateStats(workouts: WorkoutLog[], range: TimeRange) {
  const filteredWorkouts = getWorkoutsByDateRange(workouts, range);
  const totalWorkouts = filteredWorkouts.length;
  const totalVolume = calculateTotalVolume(filteredWorkouts);
  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const consistency = Math.round((totalWorkouts / days) * 100);
  return {
    totalWorkouts,
    totalVolume,
    avgDuration,
    consistency: Math.min(consistency, 100),
  };
}

/**
 * Calculate workout frequency by day of week
 */
export function calculateDayFrequency(workouts: WorkoutLog[]): DayFrequency[] {
  const dayMap = new Map<number, { count: number; volume: number; duration: number }>();

  // Инициализация всех дней недели
  for (let i = 0; i < 7; i++) {
    dayMap.set(i, { count: 0, volume: 0, duration: 0 });
  }

  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0, Sun=6

    const day = dayMap.get(dayIndex)!;
    day.count++;
    day.volume += workout.totalVolume || calculateWorkoutVolume(workout);
    day.duration += workout.duration || 0;
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return Array.from(dayMap.entries()).map(([index, data]) => ({
    dayOfWeek: dayNames[index],
    dayIndex: index,
    count: data.count,
    avgVolume: data.count > 0 ? Math.round(data.volume / data.count) : 0,
    avgDuration: data.count > 0 ? Math.round(data.duration / data.count) : 0,
  }));
}

/**
 * Calculate personal records for each exercise
 *
 * @param workouts - Array of workout logs
 * @param exerciseNameMap - Optional map of exerciseId to exercise name. If not provided, uses exerciseId as name
 */
export function calculatePersonalRecords(
  workouts: WorkoutLog[],
  exerciseNameMap?: Map<string, string> | Record<string, string>
): PersonalRecord[] {
  const exerciseRecords = new Map<string, PersonalRecord>();

  // Convert exerciseNameMap to Map if it's an object
  const nameMap = exerciseNameMap instanceof Map
    ? exerciseNameMap
    : exerciseNameMap
      ? new Map(Object.entries(exerciseNameMap))
      : null;

  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        const exId = exercise.exerciseId;

        // Resolve exercise name from map or fall back to ID
        const exerciseName = nameMap?.get(exId) || exId;

        // Максимальный вес за один подход
        const completedSets = exercise.sets?.filter(s => s.completed && s.weight) || [];
        const maxWeightInSession = completedSets.length > 0
          ? Math.max(...completedSets.map(s => s.weight!))
          : 0;

        // Максимальные повторения
        const allSets = exercise.sets || [];
        const maxRepsInSession = allSets.length > 0
          ? Math.max(...allSets.map(s => s.reps))
          : 0;

        // Объем за тренировку
        const volumeInSession = completedSets.reduce(
          (sum, s) => sum + s.weight! * s.reps,
          0
        );

        const existing = exerciseRecords.get(exId);

        if (!existing || maxWeightInSession > existing.maxWeight) {
          exerciseRecords.set(exId, {
            exerciseId: exId,
            exerciseName: exerciseName,
            maxWeight: maxWeightInSession,
            maxVolume: volumeInSession,
            maxReps: maxRepsInSession,
            date: workout.date,
            recentProgress: 'stable',
          });
        }

        // Обновляем максимальный объем если больше
        if (existing && volumeInSession > existing.maxVolume) {
          existing.maxVolume = volumeInSession;
        }

        // Обновляем максимальные повторения если больше
        if (existing && maxRepsInSession > existing.maxReps) {
          existing.maxReps = maxRepsInSession;
        }
      });
    });
  });

  // Рассчитываем прогресс для каждого упражнения
  const records = Array.from(exerciseRecords.values());
  records.forEach(record => {
    record.recentProgress = calculateRecentProgress(record.exerciseId, workouts, 30);
  });

  return records.sort((a, b) => b.maxWeight - a.maxWeight);
}

/**
 * Calculate recent progress for an exercise
 */
function calculateRecentProgress(
  exerciseId: string,
  workouts: WorkoutLog[],
  daysBack: number = 30
): 'improving' | 'stable' | 'declining' {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const recent = workouts
    .filter(w => {
      const date = new Date(w.date);
      return date >= cutoffDate;
    })
    .slice(-5); // последние 5 тренировок

  // Извлекаем максимальные веса
  const weights: number[] = [];
  recent.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(ex => {
        if (ex.exerciseId === exerciseId) {
          const completedSets = ex.sets?.filter(s => s.completed && s.weight) || [];
          if (completedSets.length > 0) {
            const maxW = Math.max(...completedSets.map(s => s.weight!));
            if (maxW > 0) weights.push(maxW);
          }
        }
      });
    });
  });

  if (weights.length < 2) return 'stable';

  const trend = calculateTrend(weights);
  if (trend.changePercentage > 2) return 'improving';
  if (trend.changePercentage < -2) return 'declining';
  return 'stable';
}

/**
 * Calculate RPE distribution across all sets
 */
export function calculateRPEDistribution(workouts: WorkoutLog[]): RPEDistribution[] {
  const rpeCounts = new Map<number, number>();
  let totalSets = 0;

  // Инициализация всех значений RPE (1-10)
  for (let i = 1; i <= 10; i++) {
    rpeCounts.set(i, 0);
  }

  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        exercise.sets?.forEach(set => {
          if (set.completed && set.rpe) {
            const rpeRounded = Math.round(set.rpe);
            rpeCounts.set(rpeRounded, (rpeCounts.get(rpeRounded) || 0) + 1);
            totalSets++;
          }
        });
      });
    });
  });

  return Array.from(rpeCounts.entries()).map(([rpe, count]) => ({
    rpe,
    count,
    percentage: totalSets > 0 ? Math.round((count / totalSets) * 100) : 0,
  }));
}

/**
 * Calculate statistics for a specific time period
 */
export function calculatePeriodStats(
  workouts: WorkoutLog[],
  startDate: Date,
  endDate: Date
): PeriodStats {
  const filtered = workouts.filter(w => {
    const date = new Date(w.date);
    return date >= startDate && date <= endDate;
  });

  const totalWorkouts = filtered.length;
  const totalVolume = calculateTotalVolume(filtered);
  const totalDuration = filtered.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Средний RPE
  let totalRPE = 0;
  let rpeCount = 0;
  filtered.forEach(w => {
    w.cycles?.forEach(c => {
      c.exercises?.forEach(e => {
        e.sets?.forEach(s => {
          if (s.completed && s.rpe) {
            totalRPE += s.rpe;
            rpeCount++;
          }
        });
      });
    });
  });
  const avgRPE = rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0;

  // Consistency
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const consistency = days > 0 ? Math.round((totalWorkouts / days) * 100) : 0;

  return {
    totalWorkouts,
    totalVolume,
    avgDuration,
    avgRPE,
    consistency: Math.min(consistency, 100),
  };
}

/**
 * Compare two time periods
 */
export function comparePeriods(
  currentStats: PeriodStats,
  previousStats: PeriodStats
): ComparisonData[] {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return [
    {
      metric: 'Workouts',
      current: currentStats.totalWorkouts,
      previous: previousStats.totalWorkouts,
      change: calculateChange(currentStats.totalWorkouts, previousStats.totalWorkouts),
      changeType: currentStats.totalWorkouts > previousStats.totalWorkouts ? 'positive' :
                  currentStats.totalWorkouts < previousStats.totalWorkouts ? 'negative' : 'neutral',
    },
    {
      metric: 'Volume',
      current: currentStats.totalVolume,
      previous: previousStats.totalVolume,
      change: calculateChange(currentStats.totalVolume, previousStats.totalVolume),
      changeType: currentStats.totalVolume > previousStats.totalVolume ? 'positive' :
                  currentStats.totalVolume < previousStats.totalVolume ? 'negative' : 'neutral',
    },
    {
      metric: 'Avg Duration',
      current: currentStats.avgDuration,
      previous: previousStats.avgDuration,
      change: calculateChange(currentStats.avgDuration, previousStats.avgDuration),
      changeType: 'neutral',
    },
    {
      metric: 'Avg RPE',
      current: currentStats.avgRPE,
      previous: previousStats.avgRPE,
      change: calculateChange(currentStats.avgRPE, previousStats.avgRPE),
      changeType: 'neutral',
    },
  ];
}
