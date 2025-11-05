/**
 * @fileoverview Мок-генераторы для инсайтов AI по тренировкам (для разработки без API-ключа).
 */

import type { WorkoutLog, Program } from '@/lib/types';

/**
 * @typedef {object} QuickInsight
 * Быстрый инсайт.
 * @property {'positive' | 'warning' | 'recommendation'} type - Тип инсайта.
 * @property {1 | 2 | 3} priority - Приоритет.
 * @property {string} title - Заголовок.
 * @property {string} description - Описание.
 * @property {boolean} actionable - Действенный.
 * @property {string} [relatedProgram] - Связанная программа.
 */
export type QuickInsight = {
  type: 'positive' | 'warning' | 'recommendation';
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  actionable: boolean;
  relatedProgram?: string;
};

/**
 * @typedef {object} QuickInsightsOutput
 * Вывод быстрых инсайтов.
 * @property {QuickInsight[]} insights - Массив инсайтов.
 * @property {string} summary - Резюме.
 * @property {number} confidence - Уверенность.
 */
export type QuickInsightsOutput = {
  insights: QuickInsight[];
  summary: string;
  confidence: number;
};

/**
 * @typedef {object} ProgressionSuggestion
 * Предложение по прогрессии.
 * @property {string} exerciseId - ID упражнения.
 * @property {string} exerciseName - Название упражнения.
 * @property {number} [currentWeight] - Текущий вес.
 * @property {number} [currentReps] - Текущие повторения.
 * @property {number} [suggestedWeight] - Предлагаемый вес.
 * @property {number} [suggestedReps] - Предлагаемые повторения.
 * @property {string} reasoning - Обоснование.
 * @property {number} confidence - Уверенность (0-100).
 * @property {boolean} applyImmediately - Применять немедленно.
 */
export type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  reasoning: string;
  confidence: number; // 0-100
  applyImmediately: boolean;
};

/**
 * @typedef {object} ProgressionSuggestionsOutput
 * Вывод предложений по прогрессии.
 * @property {ProgressionSuggestion[]} suggestions - Массив предложений.
 * @property {string} [globalRecommendation] - Глобальная рекомендация.
 */
export type ProgressionSuggestionsOutput = {
  suggestions: ProgressionSuggestion[];
  globalRecommendation?: string;
};

/**
 * Генерирует моковые быстрые инсайты.
 * @param {WorkoutLog[]} workoutLogs - Логи тренировок.
 * @param {Program[]} programs - Программы.
 * @param {string} [userGoal] - Цель пользователя.
 * @returns {QuickInsightsOutput} - Моковые быстрые инсайты.
 */
export function generateQuickInsightsMock(
  workoutLogs: WorkoutLog[],
  programs: Program[],
  userGoal?: string
): QuickInsightsOutput {
  if (workoutLogs.length === 0) {
    return {
      insights: [
        {
          type: 'recommendation',
          priority: 3,
          title: 'Начните тренироваться',
          description: 'Запишите свою первую тренировку, чтобы получить персональные инсайты.',
          actionable: true,
        },
      ],
      summary: 'Пока нет данных о тренировках.',
      confidence: 0.5,
    };
  }

  const insights: QuickInsight[] = [];
  
  // Рассчитываем базовую статистику
  const totalVolume = workoutLogs.reduce((sum, log) => sum + (log.totalVolume || 0), 0);
  const avgDuration = workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / workoutLogs.length;
  const workoutCount = workoutLogs.length;

  // Позитив: постоянные тренировки
  if (workoutCount >= 8) {
    insights.push({
      type: 'positive',
      priority: 2,
      title: 'Постоянные тренировки',
      description: `Вы завершили ${workoutCount} тренировок за последний период. Отличная постоянность!`,
      actionable: false,
    });
  }

  // Предупреждение: низкий объем
  if (totalVolume < 10000 && workoutCount > 5) {
    insights.push({
      type: 'warning',
      priority: 2,
      title: 'Низкий тренировочный объем',
      description: `Общий объем составляет ${Math.round(totalVolume)}кг. Рассмотрите возможность увеличения интенсивности или частоты.`,
      actionable: true,
    });
  }

  // Рекомендация: добавить разнообразие
  if (programs.length === 0) {
    insights.push({
      type: 'recommendation',
      priority: 3,
      title: 'Создайте программу',
      description: 'Структурированные программы помогают обеспечить прогрессивную перегрузку и сбалансированное развитие.',
      actionable: true,
    });
  }

  return {
    insights: insights.slice(0, 5), // Ограничиваем до 5 лучших
    summary: `Проанализировано ${workoutCount} тренировок с общим объемом ${Math.round(totalVolume)}кг.`,
    confidence: workoutCount >= 5 ? 0.8 : 0.5,
  };
}

/**
 * Генерирует моковые предложения по прогрессии.
 * @param {Program} program - Программа.
 * @param {WorkoutLog[]} recentWorkouts - Недавние тренировки.
 * @returns {ProgressionSuggestionsOutput} - Моковые предложения по прогрессии.
 */
export function generateProgressionSuggestionsMock(
  program: Program,
  recentWorkouts: WorkoutLog[]
): ProgressionSuggestionsOutput {
  const suggestions: ProgressionSuggestion[] = [];

  // Извлекаем данные об упражнениях из недавних тренировок
  const exerciseMap = new Map<string, { weight: number; reps: number; count: number }>();

  recentWorkouts.forEach(log => {
    log.cycles.forEach(cycle => {
      cycle.exercises.forEach(ex => {
        const exId = ex.exerciseId;
        ex.sets.forEach(set => {
          if (set.weight && set.completed) {
            const existing = exerciseMap.get(exId) || { weight: 0, reps: 0, count: 0 };
            existing.weight += set.weight;
            existing.reps += set.reps;
            existing.count += 1;
            exerciseMap.set(exId, existing);
          }
        });
      });
    });
  });

  // Генерируем моковые предложения
  exerciseMap.forEach((data, exerciseId) => {
    const avgWeight = data.weight / data.count;
    const avgReps = data.reps / data.count;
    
    if (data.count >= 3 && avgWeight > 0) {
      suggestions.push({
        exerciseId,
        exerciseName: `Упражнение ${exerciseId}`,
        currentWeight: avgWeight,
        currentReps: Math.round(avgReps),
        suggestedWeight: avgWeight * 1.025, // +2.5%
        suggestedReps: Math.round(avgReps),
        reasoning: `Мок: На основе ${data.count} недавних сессий. Средний вес ${Math.round(avgWeight)}кг × ${Math.round(avgReps)} повторений.`,
        confidence: 70,
        applyImmediately: false,
      });
    }
  });

  return {
    suggestions: suggestions.slice(0, 10),
    globalRecommendation: suggestions.length > 0 
      ? `Рассмотрите возможность прогрессии в ${suggestions.length} упражнениях на основе недавней производительности.`
      : undefined,
  };
}
