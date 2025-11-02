'use server';
/**
 * @fileoverview Парсер ежедневных размышлений с помощью ИИ с использованием Genkit + Gemini.
 * Переключается на мок-парсер, если NEXT_PUBLIC_AI_MOCK=1 или отсутствует ключ API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { parseReflectionMock } from '@/lib/reflection';

/**
 * Схема для разобранной записи.
 */
const ParsedEntrySchema = z.object({
  habitId: z.string(),
  habitName: z.string(),
  extractedValue: z.number().positive().optional(),
  extractedDuration: z.number().positive().optional(),
  extractedNote: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
  energy: z.enum(['low', 'neutral', 'high']).optional(),
  confidence: z.number().min(0).max(1),
  suggestedStatus: z.enum(['done', 'partial', 'skipped', 'missed']),
});

/**
 * Схема для входных данных парсинга размышлений.
 */
const ParseReflectionInputSchema = z.object({
  rawText: z.string().min(1),
  habits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['boolean', 'quantity', 'duration', 'range']).optional(),
  })),
});

/**
 * Схема для выходных данных парсинга размышлений.
 */
const ParseReflectionOutputSchema = z.object({
  entries: z.array(ParsedEntrySchema),
  summary: z.string().optional(),
});

/**
 * Тип для входных данных парсинга размышлений.
 */
export type ParseReflectionInput = z.infer<typeof ParseReflectionInputSchema>;
/**
 * Тип для выходных данных парсинга размышлений.
 */
export type ParseReflectionOutput = z.infer<typeof ParseReflectionOutputSchema>;
/**
 * Тип для разобранной записи.
 */
export type ParsedEntry = z.infer<typeof ParsedEntrySchema>;

/**
 * Реальный парсинг с помощью ИИ с использованием Gemini через Genkit.
 * @param input - Входные данные для парсинга размышлений.
 * @returns - Объект, содержащий разобранные записи и сводку.
 */
async function parseReflectionWithAI(input: ParseReflectionInput): Promise<ParseReflectionOutput> {
  const habitsList = input.habits.map(h => `- ${h.name} (ID: ${h.id}, Тип: ${h.type || 'boolean'})`).join('\n');
  
  const prompt = ai.definePrompt({
    name: 'parseReflectionPrompt',
    input: { schema: ParseReflectionInputSchema },
    output: { schema: ParseReflectionOutputSchema },
    prompt: `Вы - ИИ-ассистент, который разбирает текст ежедневных размышлений для извлечения информации о выполнении привычек.

Привычки пользователя:
${habitsList}

Инструкции:
1. Проанализируйте текст размышлений и выявите упоминания привычек (по названию или описанию).
2. Для каждой упомянутой привычки извлеките:
   - статус выполнения (done/partial/skipped/missed)
   - числовые значения, если они упоминаются (количество или продолжительность в минутах)
   - настроение/энергию, если они упоминаются
   - любые соответствующие примечания
3. Установите уверенность в зависимости от того, насколько четко упоминается привычка (0.0-1.0).
4. Если привычка упоминается, но статус не ясен, по умолчанию установите 'partial' с более низкой уверенностью.

Текст размышлений:
{{{rawText}}}

Верните структурированный JSON-ответ с массивом записей, соответствующим схеме.`,
  });

  try {
    const result = await prompt({ 
      rawText: input.rawText,
      habits: input.habits,
    });
    // Genkit возвращает обертку; используйте .output для типизированного результата
    // @ts-expect-error genkit type wrapper
    return result.output ?? result;
  } catch (error) {
    console.error('[parse-reflection] Ошибка парсинга ИИ:', error);
    throw error;
  }
}

/**
 * Основная функция парсинга с логикой отката.
 * @param rawText - Необработанный текст ежедневных размышлений.
 * @param habits - Массив привычек пользователя.
 * @returns - Массив разобранных записей.
 */
export async function parseDailyReflection(
  rawText: string,
  habits: Habit[]
): Promise<ParsedEntry[]> {
  // Проверка, включен ли режим мок
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[parse-reflection] Используется мок-парсер (NEXT_PUBLIC_AI_MOCK=1)');
    return parseReflectionMock(rawText, habits);
  }

  // Проверка, доступен ли ключ API
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[parse-reflection] Не найден GOOGLE_GENAI_API_KEY, переключение на мок');
    return parseReflectionMock(rawText, habits);
  }

  try {
    // Подготовка входных данных
    const input: ParseReflectionInput = {
      rawText,
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        type: 'type' in h ? (h.type as 'boolean' | 'quantity' | 'duration' | 'range') : undefined,
      })),
    };

    // Попытка парсинга ИИ с логикой повторных попыток
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await parseReflectionWithAI(input);
        return result.entries;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Экспоненциальная задержка: 100 мс, 200 мс, 400 мс
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // Если все повторные попытки не увенчались успехом, переключиться на мок
    console.error('[parse-reflection] Парсинг ИИ не удался после повторных попыток, переключение на мок:', lastError);
    return parseReflectionMock(rawText, habits);
  } catch (error) {
    // Любая другая ошибка, переключиться на мок
    console.error('[parse-reflection] Непредвиденная ошибка, переключение на мок:', error);
    return parseReflectionMock(rawText, habits);
  }
}

