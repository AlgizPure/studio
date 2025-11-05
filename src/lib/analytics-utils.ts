// src/lib/analytics-utils.ts
// Утилиты для расчета статистики и аналитики тренировок

import type { WorkoutLog } from './types';

/**
 * @fileoverview Утилиты для расчета статистики и аналитики тренировок.
 */

/** Временной диапазон для аналитики. */
export type TimeRange = '7d' | '30d' | '90d' | 'all';

/** Сгруппированная тренировка. */
export type GroupedWorkout = {
  date: string; // YYYY-MM-DD or YYYY-WW or YYYY-MM
  totalVolume: number;
  totalDuration: number;
  workoutCount: number;
};

/** Данные о прогрессе по упражнению. */
export type ExerciseProgressData = {
  date: string;
  exerciseName: string;
  maxWeight: number;
  avgWeight: number;
  avgRPE: number;
  totalVolume: number;
  totalReps: number;
};

/** Данные о тренде. */
export type TrendData = {
  slope: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercentage: number;
};

/**
 * Вычисляет объем тренировки.
 * @param {WorkoutLog} workout - Лог тренировки.
 * @returns {number} - Общий объем.
 */
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

/**
 * Вычисляет общий объем для нескольких тренировок.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @returns {number} - Общий объем.
 */
export function calculateTotalVolume(workouts: WorkoutLog[]): number {
  return workouts.reduce((sum, workout) => {
    return sum + (workout.totalVolume || calculateWorkoutVolume(workout));
  }, 0);
}

/**
 * Фильтрует тренировки по временному диапазону.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {TimeRange} range - Временной диапазон.
 * @returns {WorkoutLog[]} - Отфильтрованный массив логов тренировок.
 */
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

/**
 * Группирует тренировки по периоду (день, неделя, месяц).
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {'day' | 'week' | 'month'} [period='day'] - Период группировки.
 * @returns {GroupedWorkout[]} - Массив сгруппированных тренировок.
 */
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

/**
 * Получает данные о прогрессе по конкретному упражнению.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {string} exerciseId - ID упражнения.
 * @param {string} exerciseName - Название упражнения.
 * @returns {ExerciseProgressData[]} - Массив данных о прогрессе.
 */
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

/**
 * Получает уникальные упражнения из логов тренировок.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @returns {Array<{ id: string; name: string }>} - Массив уникальных упражнений.
 */
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

/**
 * Вычисляет тренд для набора данных.
 * @param {number[]} data - Массив числовых данных.
 * @returns {TrendData} - Объект с данными о тренде.
 */
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

/**
 * Генерирует линию тренда для набора данных.
 * @param {number[]} data - Массив числовых данных.
 * @returns {number[]} - Массив значений линии тренда.
 */
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

/**
 * Вычисляет основную статистику по тренировкам.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {TimeRange} range - Временной диапазон.
 * @returns {object} - Объект со статистикой.
 */
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
 * Форматирует объем.
 * @param {number} volume - Объем.
 * @returns {string} - Отформатированный объем.
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}тыс. кг`;
  }
  return `${Math.round(volume)} кг`;
}

/**
 * Форматирует продолжительность.
 * @param {number} minutes - Продолжительность в минутах.
 * @returns {string} - Отформатированная продолжительность.
 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  }
  return `${minutes}м`;
}
