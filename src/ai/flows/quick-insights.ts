'use server';
/**
 * @fileoverview Быстрые инсайты для аналитики тренировок с помощью ИИ с использованием Genkit + Gemini.
 * Переключается на мок-генератор, если NEXT_PUBLIC_AI_MOCK=1 или отсутствует ключ API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { WorkoutLog, Program } from '@/lib/types';
import { generateQuickInsightsMock } from '@/lib/workout-ai-mocks';
import type { QuickInsightsOutput } from '@/lib/workout-ai-mocks';

/**
 * Схема для быстрого инсайта.
 */
const QuickInsightSchema = z.object({
  type: z.enum(['positive', 'warning', 'recommendation']),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  description: z.string(),
  actionable: z.boolean(),
  relatedProgram: z.string().optional(),
});

/**
 * Схема для входных данных быстрых инсайтов.
 */
const QuickInsightsInputSchema = z.object({
  workoutLogs: z.array(z.object({
    id: z.string(),
    date: z.string(),
    duration: z.number().optional(),
    totalVolume: z.number().optional(),
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
  activePrograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
  })),
  userGoal: z.string().optional(),
  timeframe: z.enum(['2weeks', '4weeks']),
});

/**
 * Схема для выходных данных быстрых инсайтов.
 */
const QuickInsightsOutputSchema = z.object({
  insights: z.array(QuickInsightSchema),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Тип для входных данных быстрых инсайтов.
 */
export type QuickInsightsInput = z.infer<typeof QuickInsightsInputSchema>;
// QuickInsightsOutput импортируется из workout-ai-mocks.ts

/**
 * Генерация быстрых инсайтов с помощью ИИ с использованием Gemini через Genkit.
 * @param input - Входные данные для генерации быстрых инсайтов.
 * @returns - Объект, содержащий быстрые инсайты, сводку и уверенность.
 */
async function generateQuickInsightsWithAI(input: QuickInsightsInput): Promise<z.infer<typeof QuickInsightsOutputSchema>> {
  const workoutsSummary = input.workoutLogs.slice(0, 50).map(log => {
    const volume = log.totalVolume || 0;
    const duration = log.duration || 0;
    return `Дата: ${log.date}, Объем: ${Math.round(volume)}кг, Продолжительность: ${duration}мин`;
  }).join('\n');

  const programsList = input.activePrograms.map(p => `- ${p.name} (${p.status})`).join('\n');

  const prompt = ai.definePrompt({
    name: 'quickInsightsPrompt',
    input: { schema: QuickInsightsInputSchema },
    output: { schema: QuickInsightsOutputSchema },
    prompt: `Вы - элитный тренер по силовой и кондиционной подготовке с опытом работы более 15 лет.

СПЕЦИАЛИЗАЦИЯ:
- Программирование на основе фактических данных
- Стратегии прогрессивной перегрузки
- Тренировки на основе RPE
- Периодизация и восстановление
- Профилактика травм

СТИЛЬ ОТВЕТА:
- Краткий и действенный (максимум 2-3 предложения)
- Конкретные цифры и даты
- Избегайте общих фраз
- Сосредоточьтесь на следующих 1-2 неделях

АНАЛИЗ:
1. Тренды объема (увеличение/уменьшение/плато)
2. Паттерны RPE (перетренированность/недотренированность)
3. Прогрессивная перегрузка (есть ли прогрессия?)
4. Восстановление (пропущенные тренировки, индикаторы усталости)
5. Специфика упражнений (сильные/слабые стороны)

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
Временной интервал: ${input.timeframe}
Цель: ${input.userGoal || 'Не указана'}

Последние тренировки:
${workoutsSummary}

Активные программы:
${programsList || 'Нет'}

Сгенерируйте 3-5 инсайтов с:
- тип: 'positive' (что идет хорошо + почему), 'warning' (тревожные сигналы + последствия), 'recommendation' (что изменить + как + когда)
- приоритет: 1 (самый высокий) до 3 (самый низкий)
- actionable: true, если пользователь может действовать немедленно

Верните структурированный JSON-ответ, соответствующий схеме.`,
  });

  try {
    const result = await prompt({
      workoutLogs: input.workoutLogs,
      activePrograms: input.activePrograms,
      userGoal: input.userGoal,
      timeframe: input.timeframe,
    });
    
    // Извлечение использования токенов, если доступно
    const tokensUsed = (result as any)?.usage?.totalTokens || (result as any)?.tokensUsed || 0;
    if (tokensUsed > 0) {
      (result as any).tokensUsed = tokensUsed;
    }
    
    // Genkit возвращает обертку; используйте .output для типизированного результата
    // @ts-expect-error genkit type wrapper
    return result.output ?? result;
  } catch (error) {
    console.error('[quick-insights] Ошибка генерации ИИ:', error);
    throw error;
  }
}

/**
 * Основная функция генерации инсайтов с логикой отката.
 * @param workoutLogs - Логи тренировок.
 * @param programs - Программы тренировок.
 * @param userGoal - Цель пользователя.
 * @param timeframe - Временной интервал.
 * @returns - Объект, содержащий быстрые инсайты.
 */
export async function getQuickInsights(
  workoutLogs: WorkoutLog[],
  programs: Program[],
  userGoal?: string,
  timeframe: '2weeks' | '4weeks' = '2weeks'
): Promise<QuickInsightsOutput> {
  // Проверка, включен ли режим мок
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[quick-insights] Используется мок-генератор (NEXT_PUBLIC_AI_MOCK=1)');
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }

  // Проверка, доступен ли ключ API
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[quick-insights] Не найден GOOGLE_GENAI_API_KEY, переключение на мок');
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }

  try {
    // Подготовка входных данных
    const input: QuickInsightsInput = {
      workoutLogs: workoutLogs.map(log => ({
        id: log.id,
        date: log.date,
        duration: log.duration,
        totalVolume: log.totalVolume,
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
      activePrograms: programs.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
      userGoal,
      timeframe,
    };

    // Попытка генерации ИИ с логикой повторных попыток (3 попытки с экспоненциальной задержкой)
    let lastError: Error | null = null;
    let tokensUsed = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateQuickInsightsWithAI(input);
        // Отслеживание использования токенов
        tokensUsed = (result as any).tokensUsed || 0;
        if (tokensUsed > 0) {
          (result as any).tokensUsed = tokensUsed;
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Экспоненциальная задержка: 100 мс, 200 мс, 400 мс
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // Если все повторные попытки не увенчались успехом, переключиться на мок
    console.error('[quick-insights] Генерация ИИ не удалась после повторных попыток, переключение на мок:', lastError);
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  } catch (error) {
    // Любая другая ошибка, переключиться на мок
    console.error('[quick-insights] Непредвиденная ошибка, переключение на мок:', error);
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }
}
