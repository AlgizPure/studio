'use server';
/**
 * @fileoverview Предложения по прогрессии для программ тренировок с помощью AI (Genkit + Gemini).
 * Использует мок-генератор, если NEXT_PUBLIC_AI_MOCK=1 или отсутствует API-ключ.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Program, WorkoutLog } from '@/lib/types';
import { generateProgressionSuggestionsMock } from '@/lib/workout-ai-mocks';
import type { ProgressionSuggestionsOutput } from '@/lib/workout-ai-mocks';

/**
 * Схема для предложения по прогрессии.
 * @property {string} exerciseId - Идентификатор упражнения.
 * @property {string} exerciseName - Название упражнения.
 * @property {number} [currentWeight] - Текущий вес.
 * @property {number} [currentReps] - Текущее количество повторений.
 * @property {number} [suggestedWeight] - Предлагаемый вес.
 * @property {number} [suggestedReps] - Предлагаемое количество повторений.
 * @property {string} reasoning - Обоснование.
 * @property {number} confidence - Уверенность в предложении (0-100).
 * @property {boolean} applyImmediately - Применять ли немедленно.
 */
const ProgressionSuggestionSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  currentWeight: z.number().optional(),
  currentReps: z.number().optional(),
  suggestedWeight: z.number().optional(),
  suggestedReps: z.number().optional(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(100),
  applyImmediately: z.boolean(),
});

/**
 * Схема входных данных для предложений по прогрессии.
 * @property {object} program - Программа тренировок.
 * @property {Array<object>} recentWorkouts - Недавние тренировки.
 * @property {Record<string, object>} exerciseHistory - История выполнения упражнений.
 */
const ProgressionSuggestionsInputSchema = z.object({
  program: z.object({
    id: z.string(),
    name: z.string(),
    workouts: z.array(z.object({
      workoutId: z.string(),
    })),
  }),
  recentWorkouts: z.array(z.object({
    date: z.string(),
    cycles: z.array(z.object({
      exercises: z.array(z.object({
        exerciseId: z.string(),
        sets: z.array(z.object({
          reps: z.number(),
          weight: z.number().optional(),
          rpe: z.number().optional(),
          completed: z.boolean(),
        })),
      })),
    })),
  })),
  exerciseHistory: z.record(z.object({
    sessions: z.array(z.object({
      date: z.string(),
      sets: z.array(z.object({
        reps: z.number(),
        weight: z.number().optional(),
        rpe: z.number().optional(),
      })),
      avgRPE: z.number(),
      totalVolume: z.number(),
    })),
  })),
});

/**
 * Схема выходных данных для предложений по прогрессии.
 * @property {Array<ProgressionSuggestion>} suggestions - Массив предложений.
 * @property {string} [globalRecommendation] - Глобальная рекомендация.
 */
const ProgressionSuggestionsOutputSchema = z.object({
  suggestions: z.array(ProgressionSuggestionSchema),
  globalRecommendation: z.string().optional(),
});

export type ProgressionSuggestionsInput = z.infer<typeof ProgressionSuggestionsInputSchema>;
// ProgressionSuggestionsOutput импортируется из workout-ai-mocks.ts

/**
 * Генерация предложений по прогрессии с помощью AI (Gemini через Genkit).
 * @param {ProgressionSuggestionsInput} input - Входные данные.
 * @returns {Promise<z.infer<typeof ProgressionSuggestionsOutputSchema>>} - Обещание, которое разрешается с предложениями.
 * @throws {Error} - Если генерация с помощью AI не удалась.
 */
async function generateProgressionSuggestionsWithAI(
  input: ProgressionSuggestionsInput
): Promise<z.infer<typeof ProgressionSuggestionsOutputSchema>> {
  const exerciseHistorySummary = Object.entries(input.exerciseHistory).slice(0, 10).map(([id, history]) => {
    const sessions = history.sessions;
    const lastSession = sessions[sessions.length - 1];
    return `Упражнение ${id}: ${sessions.length} сессий, последняя: ${lastSession.sets.length} подходов @ ${lastSession.sets[0]?.weight || 'N/A'}кг, RPE ${lastSession.avgRPE.toFixed(1)}`;
  }).join('\n');

  const prompt = ai.definePrompt({
    name: 'progressionSuggestionsPrompt',
    input: { schema: ProgressionSuggestionsInputSchema },
    output: { schema: ProgressionSuggestionsOutputSchema },
    prompt: `Вы — AI-система для автоматической прогрессии нагрузки в силовых тренировках.

ПРИНЦИПЫ ПРОГРЕССИВНОЙ ПЕРЕГРУЗКИ:
1. Если все подходы выполнены с RPE ≤ 7.5: увеличьте вес на 2.5-5%
2. Если все подходы выполнены с RPE 8-9: сохраняйте текущий вес
3. Если не все подходы выполнены ИЛИ RPE > 9: уменьшите вес на 5-10%
4. Приоритет: Безопасность > Прогрессия

ПРАВИЛА ОЦЕНКИ УВЕРЕННОСТИ:
- 90-100: ≥5 недавних сессий, стабильные закономерности
- 70-89: 3-4 сессии, умеренная изменчивость
- <70: недостаточно данных, высокая изменчивость

ФОРМАТ ОБОСНОВАНИЯ:
"Последние N сессий: [краткая статистика]. [Рекомендация], потому что [обоснование]."

Пример: "Последние 5 сессий: 3x10 @ 100кг, RPE 7-7.5. Увеличьте до 102.5кг, потому что вы последовательно выполняете все подходы с запасом."

ПРОГРАММА: ${input.program.name} (${input.program.id})

ИСТОРИЯ УПРАЖНЕНИЙ:
${exerciseHistorySummary}

Сгенерируйте конкретные предложения по прогрессии для каждого упражнения с достаточным количеством данных.
Верните структурированный JSON-ответ, соответствующий схеме.`,
  });

  try {
    const result = await prompt({
      program: input.program,
      recentWorkouts: input.recentWorkouts,
      exerciseHistory: input.exerciseHistory,
    });
    
    // Извлечение использования токенов, если доступно
    const tokensUsed = (result as any)?.usage?.totalTokens || (result as any)?.tokensUsed || 0;
    if (tokensUsed > 0) {
      (result as any).tokensUsed = tokensUsed;
    }

    // Genkit возвращает обертку; используйте .output для типизированного результата
    // @ts-expect-error - Проблема с оберткой типов Genkit
    return result.output ?? result;
  } catch (error) {
    console.error('[progression-suggestions] Ошибка генерации AI:', error);
    throw error;
  }
}

/**
 * Основная функция для получения предложений по прогрессии с логикой отката.
 * @param {Program} program - Программа тренировок.
 * @param {WorkoutLog[]} recentWorkouts - Недавние тренировки.
 * @param {Record<string, { sessions: Array<{ date: string; sets: Array<{ reps: number; weight?: number; rpe?: number }>; avgRPE: number; totalVolume: number }> }>} exerciseHistory - История выполнения упражнений.
 * @returns {Promise<ProgressionSuggestionsOutput>} - Обещание, которое разрешается с предложениями.
 */
export async function getProgressionSuggestions(
  program: Program,
  recentWorkouts: WorkoutLog[],
  exerciseHistory: Record<string, { sessions: Array<{ date: string; sets: Array<{ reps: number; weight?: number; rpe?: number }>; avgRPE: number; totalVolume: number }> }>
): Promise<ProgressionSuggestionsOutput> {
  // Проверка, включен ли режим мок-данных
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[progression-suggestions] Используется мок-генератор (NEXT_PUBLIC_AI_MOCK=1)');
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }

  // Проверка наличия API-ключа
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[progression-suggestions] Не найден GOOGLE_GENAI_API_KEY, используется мок');
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }

  try {
    // Подготовка входных данных
    const input: ProgressionSuggestionsInput = {
      program: {
        id: program.id,
        name: program.name,
        workouts: program.workouts.map(w => ({ workoutId: w.workoutId })),
      },
      recentWorkouts: recentWorkouts.map(log => ({
        date: log.date,
        cycles: log.cycles.map(cycle => ({
          exercises: cycle.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe,
              completed: set.completed,
            })),
          })),
        })),
      })),
      exerciseHistory,
    };

    // Попытка генерации AI с логикой повторных попыток (3 попытки с экспоненциальной задержкой)
    let lastError: Error | null = null;
    let tokensUsed = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateProgressionSuggestionsWithAI(input);
        // Отслеживание использования токенов
        tokensUsed = (result as any).tokensUsed || 0;
        if (tokensUsed > 0) {
          (result as any).tokensUsed = tokensUsed;
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Экспоненциальная задержка: 100мс, 200мс, 400мс
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // Если все повторные попытки не увенчались успехом, вернуться к мок-данным
    console.error('[progression-suggestions] Генерация AI не удалась после повторных попыток, используется мок:', lastError);
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  } catch (error) {
    // Любая другая ошибка, вернуться к мок-данным
    console.error('[progression-suggestions] Непредвиденная ошибка, используется мок:', error);
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }
}
