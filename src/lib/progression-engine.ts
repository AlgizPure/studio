// src/lib/progression-engine.ts
// Логика автоматической прогрессии нагрузок

import type { WorkoutLog, SetLog } from './types';

/**
 * @fileoverview Логика автоматической прогрессии нагрузок.
 * Анализирует историю тренировок и предлагает изменения в весе или повторениях.
 */

/** Правило прогрессии. */
export type ProgressionRule = 'increase_weight' | 'increase_reps' | 'decrease_weight' | 'decrease_reps' | 'maintain';

/** Предложение по прогрессии. */
export type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  currentRPE?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  reason: string;
  rule: ProgressionRule;
  confidence: number; // 0-100%
};

/** История выполнения упражнения. */
export type ExerciseHistory = {
  exerciseId: string;
  sessions: Array<{
    date: string;
    sets: SetLog[];
    avgRPE: number;
    maxWeight: number;
    completedAllSets: boolean;
  }>;
};

const PROGRESSION_RULES = {
  RPE_TOO_EASY: 7,
  RPE_OPTIMAL: 8,
  RPE_TOO_HARD: 9,
  WEIGHT_INCREASE_PERCENT: 2.5,
  WEIGHT_DECREASE_PERCENT: 5,
  MIN_WEIGHT_STEP_BARBELL: 2.5,
  MIN_WEIGHT_STEP_DUMBBELL: 1,
  HISTORY_WINDOW: 2,
  MIN_SESSIONS_FOR_PROGRESSION: 2,
};

/**
 * Анализирует историю выполнения упражнения.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {string} exerciseId - ID упражнения.
 * @returns {ExerciseHistory} - История выполнения упражнения.
 */
export function analyzeExerciseHistory(
  workouts: WorkoutLog[],
  exerciseId: string
): ExerciseHistory {
  const sessions: ExerciseHistory['sessions'] = [];
  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  sortedWorkouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        if (exercise.exerciseId === exerciseId && exercise.sets && exercise.sets.length > 0) {
          const completedSets = exercise.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            const avgRPE = completedSets.reduce((sum, set) => sum + (set.rpe || 0), 0) / completedSets.length;
            const maxWeight = Math.max(...completedSets.map(s => s.weight || 0));
            const completedAllSets = exercise.sets.every(s => s.completed);
            sessions.push({
              date: workout.date,
              sets: completedSets,
              avgRPE,
              maxWeight,
              completedAllSets,
            });
          }
        }
      });
    });
  });
  return { exerciseId, sessions };
}

/**
 * Определяет, следует ли прогрессировать.
 * @param {ExerciseHistory} history - История выполнения упражнения.
 * @returns {{ should: boolean; rule: ProgressionRule; reason: string }} - Решение о прогрессии.
 */
export function shouldProgress(history: ExerciseHistory): {
  should: boolean;
  rule: ProgressionRule;
  reason: string;
} {
  const { sessions } = history;
  if (sessions.length < PROGRESSION_RULES.MIN_SESSIONS_FOR_PROGRESSION) {
    return {
      should: false,
      rule: 'maintain',
      reason: `Нужно как минимум ${PROGRESSION_RULES.MIN_SESSIONS_FOR_PROGRESSION} сессии для анализа прогрессии`,
    };
  }
  const recentSessions = sessions.slice(-PROGRESSION_RULES.HISTORY_WINDOW);
  const allCompleted = recentSessions.every(s => s.completedAllSets);
  const avgRPE = recentSessions.reduce((sum, s) => sum + s.avgRPE, 0) / recentSessions.length;
  if (avgRPE <= PROGRESSION_RULES.RPE_TOO_EASY && allCompleted) {
    return {
      should: true,
      rule: 'increase_weight',
      reason: `Средний RPE ${avgRPE.toFixed(1)} (≤${PROGRESSION_RULES.RPE_TOO_EASY}) и все подходы выполнены`,
    };
  }
  if (avgRPE >= PROGRESSION_RULES.RPE_TOO_EASY && avgRPE <= PROGRESSION_RULES.RPE_TOO_HARD) {
    return {
      should: false,
      rule: 'maintain',
      reason: `Средний RPE ${avgRPE.toFixed(1)} (оптимальный диапазон ${PROGRESSION_RULES.RPE_TOO_EASY}-${PROGRESSION_RULES.RPE_TOO_HARD})`,
    };
  }
  if (avgRPE > PROGRESSION_RULES.RPE_TOO_HARD) {
    return {
      should: true,
      rule: 'decrease_weight',
      reason: `Средний RPE ${avgRPE.toFixed(1)} (>${PROGRESSION_RULES.RPE_TOO_HARD}), вес слишком большой`,
    };
  }
  return { should: false, rule: 'maintain', reason: 'Нет четкого сигнала для прогрессии' };
}

/**
 * Вычисляет новые целевые значения.
 * @param {ExerciseHistory} history - История выполнения упражнения.
 * @param {ProgressionRule} rule - Правило прогрессии.
 * @param {'barbell' | 'dumbbell' | 'bodyweight'} [exerciseType='barbell'] - Тип упражнения.
 * @returns {{ newWeight?: number; newReps?: number }} - Новые целевые значения.
 */
export function calculateNewTargets(
  history: ExerciseHistory,
  rule: ProgressionRule,
  exerciseType: 'barbell' | 'dumbbell' | 'bodyweight' = 'barbell'
): { newWeight?: number; newReps?: number } {
  const lastSession = history.sessions[history.sessions.length - 1];
  if (!lastSession) return {};
  const currentWeight = lastSession.maxWeight;
  const currentReps = Math.max(...lastSession.sets.map(s => s.reps));
  const minStep = exerciseType === 'barbell'
    ? PROGRESSION_RULES.MIN_WEIGHT_STEP_BARBELL
    : PROGRESSION_RULES.MIN_WEIGHT_STEP_DUMBBELL;
  switch (rule) {
    case 'increase_weight': {
      if (!currentWeight) return { newReps: currentReps + 1 };
      const increase = currentWeight * (PROGRESSION_RULES.WEIGHT_INCREASE_PERCENT / 100);
      const roundedIncrease = Math.max(minStep, Math.ceil(increase / minStep) * minStep);
      return { newWeight: currentWeight + roundedIncrease, newReps: currentReps };
    }
    case 'decrease_weight': {
      if (!currentWeight) return { newReps: Math.max(1, currentReps - 1) };
      const decrease = currentWeight * (PROGRESSION_RULES.WEIGHT_DECREASE_PERCENT / 100);
      const roundedDecrease = Math.max(minStep, Math.ceil(decrease / minStep) * minStep);
      return { newWeight: Math.max(minStep, currentWeight - roundedDecrease), newReps: currentReps };
    }
    case 'increase_reps': {
      return { newWeight: currentWeight, newReps: currentReps + 1 };
    }
    case 'decrease_reps': {
      return { newWeight: currentWeight, newReps: Math.max(1, currentReps - 1) };
    }
    case 'maintain':
    default: {
      return { newWeight: currentWeight, newReps: currentReps };
    }
  }
}

/**
 * Получает предложения по прогрессии.
 * @param {WorkoutLog[]} workouts - Массив логов тренировок.
 * @param {string[]} exerciseIds - Массив ID упражнений.
 * @param {Record<string, string>} [exerciseNames={}] - Словарь с названиями упражнений.
 * @returns {ProgressionSuggestion[]} - Массив предложений по прогрессии.
 */
export function getProgressionSuggestions(
  workouts: WorkoutLog[],
  exerciseIds: string[],
  exerciseNames: Record<string, string> = {}
): ProgressionSuggestion[] {
  const suggestions: ProgressionSuggestion[] = [];
  exerciseIds.forEach(exerciseId => {
    const history = analyzeExerciseHistory(workouts, exerciseId);
    if (history.sessions.length < PROGRESSION_RULES.MIN_SESSIONS_FOR_PROGRESSION) {
      return;
    }
    const { should, rule, reason } = shouldProgress(history);
    if (!should && rule === 'maintain') {
      return;
    }
    const lastSession = history.sessions[history.sessions.length - 1];
    const currentWeight = lastSession?.maxWeight;
    const currentReps = lastSession?.sets ? Math.max(...lastSession.sets.map(s => s.reps)) : undefined;
    const currentRPE = lastSession?.avgRPE;
    const { newWeight, newReps } = calculateNewTargets(history, rule);
    const confidence = Math.min(100, (history.sessions.length / 5) * 100);
    suggestions.push({
      exerciseId,
      exerciseName: exerciseNames[exerciseId] || exerciseId,
      currentWeight,
      currentReps,
      currentRPE,
      suggestedWeight: newWeight,
      suggestedReps: newReps,
      reason,
      rule,
      confidence: Math.round(confidence),
    });
  });
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Форматирует предложение по прогрессии в строку.
 * @param {ProgressionSuggestion} suggestion - Предложение по прогрессии.
 * @returns {string} - Отформатированная строка.
 */
export function formatSuggestion(suggestion: ProgressionSuggestion): string {
  const { rule, currentWeight, currentReps, suggestedWeight, suggestedReps } = suggestion;
  switch (rule) {
    case 'increase_weight':
      return `Увеличить вес с ${currentWeight}кг до ${suggestedWeight}кг`;
    case 'decrease_weight':
      return `Уменьшить вес с ${currentWeight}кг до ${suggestedWeight}кг`;
    case 'increase_reps':
      return `Увеличить повторения с ${currentReps} до ${suggestedReps}`;
    case 'decrease_reps':
      return `Уменьшить повторения с ${currentReps} до ${suggestedReps}`;
    case 'maintain':
    default:
      return `Сохранить текущий вес (${currentWeight}кг) и повторения (${currentReps})`;
  }
}

/**
 * Получает цвет для правила прогрессии.
 * @param {ProgressionRule} rule - Правило прогрессии.
 * @returns {string} - CSS-класс цвета.
 */
export function getProgressionColor(rule: ProgressionRule): string {
  switch (rule) {
    case 'increase_weight':
    case 'increase_reps':
      return 'text-green-600 dark:text-green-400';
    case 'decrease_weight':
    case 'decrease_reps':
      return 'text-orange-600 dark:text-orange-400';
    case 'maintain':
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Получает иконку для правила прогрессии.
 * @param {ProgressionRule} rule - Правило прогрессии.
 * @returns {string} - Иконка.
 */
export function getProgressionIcon(rule: ProgressionRule): string {
  switch (rule) {
    case 'increase_weight':
    case 'increase_reps':
      return '↗';
    case 'decrease_weight':
    case 'decrease_reps':
      return '↘';
    case 'maintain':
    default:
      return '→';
  }
}
