// src/lib/analytics-utils.ts
// Утилиты для расчета статистики и аналитики тренировок

import type { WorkoutLog } from './types';

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

export function calculateWorkoutVolume(workout: WorkoutLog): number {
  let total = 0;
  workout.cycles?.forEach(cycle => {
    cycle.exercises?.forEach(exercise => {
      exercise.sets?.forEach(set => {
        if (set.completed && set.weight && set.reps) {
          total += set.weight * set.reps;
        }
      });
    });
  });
  return total;
}

export function calculateTotalVolume(workouts: WorkoutLog[]): number {
  return workouts.reduce((sum, workout) => {
    return sum + (workout.totalVolume || calculateWorkoutVolume(workout));
  }, 0);
}

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

export function getExerciseProgress(
  workouts: WorkoutLog[],
  exerciseId: string,
  exerciseName: string
): ExerciseProgressData[] {
  const progressData: ExerciseProgressData[] = [];
  workouts.forEach(workout => {
    let maxWeight = 0;
    let totalWeight = 0;
    let totalRPE = 0;
    let totalVolume = 0;
    let totalReps = 0;
    let setCount = 0;
    let rpeCount = 0;
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        if (exercise.exerciseId === exerciseId) {
          exercise.sets?.forEach(set => {
            if (set.completed) {
              if (set.weight) {
                maxWeight = Math.max(maxWeight, set.weight);
                totalWeight += set.weight;
                totalVolume += set.weight * set.reps;
                setCount++;
              }
              totalReps += set.reps;
              if (set.rpe) {
                totalRPE += set.rpe;
                rpeCount++;
              }
            }
          });
        }
      });
    });
    if (setCount > 0) {
      progressData.push({
        date: workout.date,
        exerciseName,
        maxWeight,
        avgWeight: totalWeight / setCount,
        avgRPE: rpeCount > 0 ? totalRPE / rpeCount : 0,
        totalVolume,
        totalReps,
      });
    }
  });
  return progressData.sort((a, b) => a.date.localeCompare(b.date));
}

export function getUniqueExercises(workouts: WorkoutLog[]): Array<{ id: string; name: string }> {
  const exerciseMap = new Map<string, string>();
  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        if (!exerciseMap.has(exercise.exerciseId)) {
          exerciseMap.set(exercise.exerciseId, exercise.exerciseId);
        }
      });
    });
  });
  return Array.from(exerciseMap.entries()).map(([id, name]) => ({ id, name }));
}

export function calculateTrend(data: number[]): TrendData {
  if (data.length < 2) {
    return { slope: 0, trend: 'stable', changePercentage: 0 };
  }
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const changePercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  let trend: 'increasing' | 'stable' | 'decreasing';
  if (Math.abs(changePercentage) < 5) {
    trend = 'stable';
  } else if (changePercentage > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  return { slope, trend, changePercentage };
}

export function generateTrendLine(data: number[]): number[] {
  if (data.length < 2) return data;
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return indices.map(x => slope * x + intercept);
}

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

export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${Math.round(volume)} kg`;
}

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

// ============================================================================
// STAGE 4.3: ADVANCED ANALYTICS UTILITIES
// ============================================================================

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
 */
export function calculatePersonalRecords(workouts: WorkoutLog[]): PersonalRecord[] {
  const exerciseRecords = new Map<string, PersonalRecord>();

  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        const exId = exercise.exerciseId;

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
            exerciseName: exId, // TODO: resolve exercise name from exercises collection
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


