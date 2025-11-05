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
 * Схема для инсайта по привычке.
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
 * Схема входных данных для генерации инсайтов.
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
 * Схема выходных данных для генерации инсайтов.
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
 * Генерация инсайтов с помощью AI (Gemini через Genkit).
 * @param {GenerateInsightsInput} input - Входные данные для генерации.
 * @returns {Promise<GenerateInsightsOutput>} - Обещание, которое разрешается сгенерированными инсайтами.
 * @throws {Error} - Если генерация с помощью AI не удалась.
 */
async function generateInsightsWithAI(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  const systemsList = input.activeSystems.map(s => 
    `- ${s.name} (ID: ${s.id}): ${s.description || 'Нет описания'}`
  ).join('\n');
  
  // Подготовка сводки логов
  const logsSummary = input.logs.slice(0, 100).map(l => {
    const date = l.date;
    const status = l.status;
    const context = l.contextData ? JSON.stringify(l.contextData) : '';
    return `Дата: ${date}, Статус: ${status}${context ? `, Контекст: ${context}` : ''}`;
  }).join('\n');

  const prompt = ai.definePrompt({
    name: 'generateInsightsPrompt',
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `Вы — AI-лайф-коуч, который анализирует логи выполнения привычек и генерирует действенные инсайты.

Активные системы анализа:
${systemsList}

Последние логи (пример):
${logsSummary}

Инструкции:
1. Проанализируйте логи и выявите закономерности, дисбалансы или возможности.
2. Для каждой активной системы проверьте, есть ли какие-либо предупреждения, рекомендации или достижения.
3. Генерируйте инсайты на основе:
   - Колесо жизни: проверьте, есть ли какие-либо жизненные области (здоровье, карьера, отношения, рост, финансы, отдых, окружение, духовность), которые постоянно слабы (<40% выполнения).
   - Иерархия Маслоу: проверьте, являются ли базовые потребности (физиологические, безопасность) нестабильными (<60% выполнения).
   - Любые другие активные системы: генерируйте инсайты на основе их конкретных параметров.
4. Каждый инсайт должен иметь:
   - type: 'warning' (срочные проблемы), 'recommendation' (предложения) или 'achievement' (положительные вехи)
   - priority: 1-5 (5 — самый срочный)
   - title: Короткий, действенный заголовок
   - description: Подробное объяснение с конкретными данными
   - data: Необязательные метрики/цифры для поддержки инсайта
5. Ограничьтесь 5 самыми важными инсайтами.

Верните структурированный JSON-ответ с массивом инсайтов, соответствующим схеме.`,
  });

  try {
    const result = await prompt({
      logs: input.logs,
      activeSystems: input.activeSystems,
    });
    // Genkit возвращает обертку; используйте .output для типизированного результата
    // @ts-expect-error - Проблема с оберткой типов Genkit
    return result.output ?? result;
  } catch (error) {
    console.error('[generate-insights] Ошибка генерации AI:', error);
    throw error;
  }
}

/**
 * Основная функция генерации инсайтов с логикой отката.
 * @param {HabitLog[]} logs - Массив логов привычек.
 * @param {AnalysisSystem[]} activeSystems - Массив активных систем анализа.
 * @returns {Promise<HabitInsight[]>} - Обещание, которое разрешается массивом сгенерированных инсайтов.
 */
export async function generateInsights(
  logs: HabitLog[],
  activeSystems: AnalysisSystem[]
): Promise<HabitInsight[]> {
  // Проверка, включен ли режим мок-данных
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[generate-insights] Используется мок-генератор (NEXT_PUBLIC_AI_MOCK=1)');
    return generateInsightsFromLogsMock(logs);
  }

  // Проверка наличия API-ключа
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[generate-insights] Не найден GOOGLE_GENAI_API_KEY, используется мок');
    return generateInsightsFromLogsMock(logs);
  }

  try {
    // Подготовка входных данных
    const input: GenerateInsightsInput = {
      logs: logs.map(l => ({
        id: l.id,
        habitId: l.habitId,
        date: l.date,
        status: l.status,
        value: l.value,
        durationMin: l.durationMin,
        contextData: l.contextData,
      })),
      activeSystems: activeSystems.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        habitParameters: (s.habitParameters || []).map(p => ({
          id: p.id,
          name: (p as any).name ?? p.label ?? p.id,
          type: p.type,
        })),
      })),
    };

    // Попытка генерации AI с логикой повторных попыток
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateInsightsWithAI(input);
        // Добавление ID, если они отсутствуют, и приведение приоритета к объединению 1..5
        return result.insights.map(ins => ({
          ...ins,
          id: (ins as any).id || crypto.randomUUID(),
          createdAt: (ins as any).createdAt || new Date().toISOString(),
          priority: (Math.max(1, Math.min(5, (ins as any).priority ?? 3)) as 1 | 2 | 3 | 4 | 5),
        })) as HabitInsight[];
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // Если все повторные попытки не увенчались успехом, вернуться к мок-данным
    console.error('[generate-insights] Генерация AI не удалась после повторных попыток, используется мок:', lastError);
    return generateInsightsFromLogsMock(logs);
  } catch (error) {
    // Любая другая ошибка, вернуться к мок-данным
    console.error('[generate-insights] Непредвиденная ошибка, используется мок:', error);
    return generateInsightsFromLogsMock(logs);
  }
}
