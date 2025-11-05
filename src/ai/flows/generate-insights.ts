'use server';
/**
 * @fileoverview Генерация инсайтов с помощью AI (Genkit + Gemini).
 * Использует мок-генератор, если NEXT_PUBLIC_AI_MOCK=1 или отсутствует API-ключ.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { HabitLog, HabitInsight, AnalysisSystem } from '@/lib/types';
import { generateInsightsFromLogsMock } from '@/lib/insights';

/**
 * Схема Zod для объекта инсайта по привычке.
 * @property {string} id - Уникальный идентификатор.
 * @property {string} date - Дата в формате ГГГГ-ММ-ДД.
 * @property {string} systemId - Идентификатор системы анализа.
 * @property {('warning'|'recommendation'|'achievement')} type - Тип инсайта.
 * @property {number} priority - Приоритет от 1 до 5.
 * @property {string} title - Заголовок.
 * @property {string} description - Описание.
 * @property {Record<string, any>} [data] - Дополнительные данные.
 * @property {string} createdAt - Дата создания в формате ISO.
 */
const HabitInsightSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  systemId: z.string(),
  type: z.enum(['warning', 'recommendation', 'achievement']),
  priority: z.number().min(1).max(5),
  title: z.string(),
  description: z.string(),
  data: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

/**
 * Схема Zod для входных данных флоу генерации инсайтов.
 * @property {Array<object>} logs - Массив логов привычек.
 * @property {Array<object>} activeSystems - Массив активных систем анализа.
 */
const GenerateInsightsInputSchema = z.object({
  logs: z.array(z.object({
    id: z.string(),
    habitId: z.string(),
    date: z.string(),
    status: z.enum(['done', 'partial', 'skipped', 'missed']),
    value: z.number().optional(),
    durationMin: z.number().optional(),
    contextData: z.record(z.any()).optional(),
  })),
  activeSystems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    habitParameters: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).optional(),
  })),
});

/**
 * Схема Zod для выходных данных флоу генерации инсайтов.
 * @property {Array<HabitInsight>} insights - Массив сгенерированных инсайтов.
 * @property {string} [summary] - Краткое резюме.
 */
const GenerateInsightsOutputSchema = z.object({
  insights: z.array(HabitInsightSchema),
  summary: z.string().optional(),
});

export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

/**
 * Внутренняя функция для генерации инсайтов с помощью AI (Gemini через Genkit).
 * @param {GenerateInsightsInput} input - Входные данные для генерации.
 * @returns {Promise<GenerateInsightsOutput>} - Обещание, которое разрешается сгенерированными инсайтами.
 * @throws {Error} - Если генерация с помощью AI не удалась.
 */
async function generateInsightsWithAI(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  const systemsList = input.activeSystems.map(s => 
    `- ${s.name} (ID: ${s.id}): ${s.description || 'Нет описания'}`
  ).join('\n');
  
  const logsSummary = input.logs.slice(0, 100).map(l => {
    const context = l.contextData ? JSON.stringify(l.contextData) : '';
    return `Дата: ${l.date}, Статус: ${l.status}${context ? `, Контекст: ${context}` : ''}`;
  }).join('\n');

  const prompt = ai.definePrompt({
    name: 'generateInsightsPrompt',
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `Вы — AI-лайф-коуч, анализирующий логи привычек для генерации действенных инсайтов.

Активные системы анализа:
${systemsList}

Последние логи (пример):
${logsSummary}

Инструкции:
1. Проанализируйте логи на предмет закономерностей, дисбалансов или возможностей.
2. Для каждой активной системы проверьте наличие предупреждений, рекомендаций или достижений.
3. Генерируйте инсайты на основе:
   - Колесо жизни: ищите области (<40% выполнения).
   - Иерархия Маслоу: ищите нестабильность базовых потребностей (<60% выполнения).
4. Каждый инсайт должен иметь тип, приоритет (1-5), заголовок и описание.
5. Ограничьтесь 5 самыми важными инсайтами.
Верните структурированный JSON-ответ.`,
  });

  try {
    const result = await prompt(input);
    // @ts-expect-error - Проблема с оберткой типов Genkit
    return result.output ?? result;
  } catch (error) {
    console.error('[generate-insights] Ошибка генерации AI:', error);
    throw error;
  }
}

/**
 * Основная функция для генерации инсайтов с отказоустойчивостью.
 * @param {HabitLog[]} logs - Массив логов привычек.
 * @param {AnalysisSystem[]} activeSystems - Массив активных систем анализа.
 * @returns {Promise<HabitInsight[]>} - Массив сгенерированных инсайтов.
 */
export async function generateInsights(
  logs: HabitLog[],
  activeSystems: AnalysisSystem[]
): Promise<HabitInsight[]> {
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[generate-insights] Используется мок-генератор (NEXT_PUBLIC_AI_MOCK=1)');
    return generateInsightsFromLogsMock(logs);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[generate-insights] GOOGLE_GENAI_API_KEY не найден, используется мок');
    return generateInsightsFromLogsMock(logs);
  }

  try {
    const input: GenerateInsightsInput = {
      logs: logs.map(l => ({ ...l, id: l.id || 'unknown' })),
      activeSystems: activeSystems.map(s => ({
        ...s,
        habitParameters: (s.habitParameters || []).map(p => ({
          ...p,
          name: (p as any).name ?? p.label ?? p.id,
        })),
      })),
    };

    // Логика повторных попыток
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateInsightsWithAI(input);
        return (result.insights || []).map(ins => ({
          ...ins,
          id: (ins as any).id || crypto.randomUUID(),
          createdAt: (ins as any).createdAt || new Date().toISOString(),
          priority: (Math.max(1, Math.min(5, (ins as any).priority ?? 3)) as 1 | 2 | 3 | 4 | 5),
        })) as HabitInsight[];
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt));
      }
    }

    console.error('[generate-insights] Генерация AI не удалась после повторных попыток, используется мок:', lastError);
    return generateInsightsFromLogsMock(logs);
  } catch (error) {
    console.error('[generate-insights] Непредвиденная ошибка, используется мок:', error);
    return generateInsightsFromLogsMock(logs);
  }
}
