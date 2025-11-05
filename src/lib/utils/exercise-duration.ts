import type { ExerciseLog } from '@/lib/types';

/**
 * @fileoverview Функция для расчета фактической длительности упражнения.
 */

/**
 * Рассчитывает фактическую длительность упражнения как среднее арифметическое
 * из всех логов, отсекая выбросы (используя межквартильный размах IQR).
 * @param {ExerciseLog[]} exerciseLogs - Массив логов выполнения упражнения.
 * @returns {number} - Рассчитанная фактическая длительность в секундах.
 */
export function calculateExerciseActualDuration(
  exerciseLogs: ExerciseLog[]
): number {
  // Фильтруем только логи с duration
  const durations = exerciseLogs
    .filter(log => log.duration && log.duration > 0)
    .map(log => log.duration!);
  
  if (durations.length === 0) return 0;
  
  // Если данных мало, просто возвращаем среднее
  if (durations.length <= 3) {
    return Math.round(
      durations.reduce((sum, d) => sum + d, 0) / durations.length
    );
  }
  
  // Отсекаем выбросы (используя межквартильный размах)
  const sorted = [...durations].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const filtered = sorted.filter(d => d >= lowerBound && d <= upperBound);
  
  // Если после фильтрации не осталось данных, используем исходные
  const dataToUse = filtered.length > 0 ? filtered : sorted;
  
  // Среднее арифметическое
  return Math.round(
    dataToUse.reduce((sum, d) => sum + d, 0) / dataToUse.length
  );
}
