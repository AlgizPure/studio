/**
 * @fileoverview Вспомогательные функции для обновления структур программ, особенно для предложений по прогрессии от AI.
 */

import type { Program, WorkoutExtended, Cycle, CycleExercise } from '@/lib/types';

/**
 * Находит и обновляет targetWeight упражнения в программе.
 * Поскольку Program.workouts содержит только ссылки (workoutId), нам нужно работать с полной структурой тренировки.
 * Эта функция помогает обновить программу, когда у нас есть полные данные о тренировке.
 * @param {Program} program - Программа для обновления.
 * @param {string} workoutId - ID тренировки.
 * @param {string} exerciseId - ID упражнения.
 * @param {object} updates - Обновления для применения.
 * @param {number} [updates.targetWeight] - Целевой вес.
 * @param {string} [updates.targetReps] - Целевые повторения.
 * @param {number} [updates.targetRPE] - Целевой RPE.
 * @returns {Program} - Обновленная программа.
 */
export function updateExerciseTargetInProgram(
  program: Program,
  workoutId: string,
  exerciseId: string,
  updates: {
    targetWeight?: number;
    targetReps?: string;
    targetRPE?: number;
  }
): Program {
  // Создаем копию обновленной программы
  const updatedProgram = { ...program };

  // Если в программе хранятся детали тренировки (в пользовательском поле), обновляем их
  // В противном случае возвращаем программу как есть и полагаемся на внешние обновления тренировок
  
  // Пока что добавим информацию об обновлении в метаданные программы
  // В полной реализации вы бы обновили фактический документ WorkoutExtended
  if (!(updatedProgram as any).exerciseUpdates) {
    (updatedProgram as any).exerciseUpdates = {};
  }

  const updateKey = `${workoutId}_${exerciseId}`;
  (updatedProgram as any).exerciseUpdates[updateKey] = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  updatedProgram.updatedAt = new Date().toISOString();

  return updatedProgram;
}

/**
 * Применяет предложение по прогрессии к структуре WorkoutExtended.
 * Используется, когда у вас загружена полная тренировка.
 * @param {WorkoutExtended} workout - Тренировка для обновления.
 * @param {string} exerciseId - ID упражнения.
 * @param {object} suggestion - Предложение по прогрессии.
 * @param {number} [suggestion.suggestedWeight] - Предлагаемый вес.
 * @param {number} [suggestion.suggestedReps] - Предлагаемые повторения.
 * @returns {WorkoutExtended} - Обновленная тренировка.
 */
export function applyProgressionToWorkout(
  workout: WorkoutExtended,
  exerciseId: string,
  suggestion: {
    suggestedWeight?: number;
    suggestedReps?: number;
  }
): WorkoutExtended {
  if (!workout.cycles) {
    return workout;
  }

  const updatedWorkout = {
    ...workout,
    cycles: workout.cycles.map(cycle => ({
      ...cycle,
      exercises: cycle.exercises.map(ex => {
        if (ex.exerciseId === exerciseId) {
          return {
            ...ex,
            targetWeight: suggestion.suggestedWeight ?? ex.targetWeight,
            targetReps: suggestion.suggestedReps 
              ? String(suggestion.suggestedReps) 
              : ex.targetReps,
          };
        }
        return ex;
      }),
    })),
  };

  return updatedWorkout;
}

/**
 * Находит упражнение в тренировке по exerciseId.
 * @param {WorkoutExtended} workout - Тренировка для поиска.
 * @param {string} exerciseId - ID упражнения.
 * @returns {{ cycle: Cycle; exercise: CycleExercise } | null} - Найденное упражнение и его цикл, или null.
 */
export function findExerciseInWorkout(
  workout: WorkoutExtended,
  exerciseId: string
): { cycle: Cycle; exercise: CycleExercise } | null {
  if (!workout.cycles) {
    return null;
  }

  for (const cycle of workout.cycles) {
    const exercise = cycle.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise) {
      return { cycle, exercise };
    }
  }

  return null;
}
