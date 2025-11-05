'use server';
/**
 * @fileoverview Парсер ежедневных заметок с помощью AI (Genkit + Gemini).
 * Использует мок-парсер, если NEXT_PUBLIC_AI_MOCK=1 или отсутствует API-ключ.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { parseReflectionMock } from '@/lib/reflection';

/**
 * Схема Zod для разобранной записи из заметки.
 * @property {string} habitId - Идентификатор привычки.
 * @property {string} habitName - Название привычки.
 * @property {number} [extractedValue] - Извлеченное числовое значение.
 * @property {number} [extractedDuration] - Извлеченная продолжительность в минутах.
 * @property {string} [extractedNote] - Извлеченная заметка.
 * @property {('low'|'neutral'|'high')} [mood] - Настроение.
 * @property {('low'|'neutral'|'high')} [energy] - Энергия.
 * @property {number} confidence - Уверенность в точности разбора (0-1).
 * @property {HabitLogStatus} suggestedStatus - Предлагаемый статус выполнения привычки.
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
 * Схема Zod для входных данных флоу парсинга заметок.
 * @property {string} rawText - Необработанный текст заметки.
 * @property {Array<object>} habits - Массив привычек пользователя.
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
 * Схема Zod для выходных данных флоу парсинга заметок.
 * @property {Array<ParsedEntry>} entries - Массив разобранных записей.
 * @property {string} [summary] - Краткое резюме.
 */
const ParseReflectionOutputSchema = z.object({
  entries: z.array(ParsedEntrySchema),
  summary: z.string().optional(),
});

export type ParseReflectionInput = z.infer<typeof ParseReflectionInputSchema>;
export type ParseReflectionOutput = z.infer<typeof ParseReflectionOutputSchema>;
export type ParsedEntry = z.infer<typeof ParsedEntrySchema>;

/**
 * Внутренняя функция для парсинга заметок с помощью AI (Gemini через Genkit).
 * @param {ParseReflectionInput} input - Входные данные для парсинга.
 * @returns {Promise<ParseReflectionOutput>} - Обещание, которое разрешается с разобранными данными.
 * @throws {Error} - Если парсинг с помощью AI не удался.
 */
async function parseReflectionWithAI(input: ParseReflectionInput): Promise<ParseReflectionOutput> {
  const habitsList = input.habits.map(h => `- ${h.name} (ID: ${h.id}, Тип: ${h.type || 'boolean'})`).join('\n');
  
  const prompt = ai.definePrompt({
    name: 'parseReflectionPrompt',
    input: { schema: ParseReflectionInputSchema },
    output: { schema: ParseReflectionOutputSchema },
    prompt: `Вы — AI-ассистент, который разбирает текст ежедневной заметки для извлечения информации о выполнении привычек.

Привычки пользователя:
${habitsList}

Инструкции:
1. Проанализируйте текст заметки и определите упоминания привычек.
2. Для каждой упомянутой привычки извлеките статус (done/partial/skipped/missed), числовые значения, настроение/энергию и заметки.
3. Установите уверенность (confidence) от 0.0 до 1.0.
4. Если статус не ясен, используйте 'partial' с низкой уверенностью.

Текст заметки:
{{{rawText}}}

Верните структурированный JSON-ответ.`,
  });

  try {
    const result = await prompt(input);
    // @ts-expect-error - Проблема с оберткой типов Genkit
    return result.output ?? result;
  } catch (error) {
    console.error('[parse-reflection] Ошибка парсинга AI:', error);
    throw error;
  }
}

/**
 * Основная функция для парсинга ежедневных заметок с отказоустойчивостью.
 * @param {string} rawText - Необработанный текст заметки.
 * @param {Habit[]} habits - Массив привычек пользователя.
 * @returns {Promise<ParsedEntry[]>} - Массив разобранных записей.
 */
export async function parseDailyReflection(
  rawText: string,
  habits: Habit[]
): Promise<ParsedEntry[]> {
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[parse-reflection] Используется мок-парсер (NEXT_PUBLIC_AI_MOCK=1)');
    return parseReflectionMock(rawText, habits);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[parse-reflection] GOOGLE_GENAI_API_KEY не найден, используется мок');
    return parseReflectionMock(rawText, habits);
  }

  try {
    const input: ParseReflectionInput = {
      rawText,
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        type: 'type' in h ? (h.type as 'boolean' | 'quantity' | 'duration' | 'range') : undefined,
      })),
    };

    // Логика повторных попыток
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await parseReflectionWithAI(input);
        return result.entries;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt));
      }
    }

    console.error('[parse-reflection] Парсинг AI не удался после повторных попыток, используется мок:', lastError);
    return parseReflectionMock(rawText, habits);
  } catch (error) {
    console.error('[parse-reflection] Непредвиденная ошибка, используется мок:', error);
    return parseReflectionMock(rawText, habits);
  }
}
