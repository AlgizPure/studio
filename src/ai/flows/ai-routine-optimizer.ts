'use server';
/**
 * @fileOverview Поток оптимизатора тренировок на базе ИИ.
 *
 * - aiRoutineOptimizer - Функция, которая обрабатывает процесс оптимизации тренировок.
 * - AIRoutineOptimizerInput - Входной тип для функции aiRoutineOptimizer.
 * - AIRoutineOptimizerOutput - Возвращаемый тип для функции aiRoutineOptimizer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Схема для входных данных оптимизатора тренировок.
 */
const AIRoutineOptimizerInputSchema = z.object({
  /**
   * Цели пользователя в фитнесе, например, скорость, рельефность мышц, потеря жира.
   */
  goals: z
    .string()
    .describe(
      'Цели пользователя в фитнесе, например, скорость, рельефность мышц, потеря жира.'
    ),
  /**
   * Доступность пользователя по расписанию, включая дни и время, доступные для тренировок.
   */
  availability: z
    .string()
    .describe(
      'Доступность пользователя по расписанию, включая дни и время, доступные для тренировок.'
    ),
  /**
   * Предпочтительные типы упражнений пользователя, например, силовые тренировки, биодинамика, бег, статические упражнения.
   */
  preferredExercises: z
    .string()
    .describe(
      'Предпочтительные типы упражнений пользователя, например, силовые тренировки, биодинамика, бег, статические упражнения.'
    ),
  /**
   * Список пользовательских упражнений, предоставленных пользователем, включая название и описание.
   */
  customExercises: z
    .string()
    .optional()
    .describe(
      'Список пользовательских упражнений, предоставленных пользователем, включая название и описание.'
    ),
});
/**
 * Тип для входных данных оптимизатора тренировок.
 */
export type AIRoutineOptimizerInput = z.infer<typeof AIRoutineOptimizerInputSchema>;

/**
 * Схема для запланированной активности.
 */
const ScheduledActivitySchema = z.object({
  /**
   * День недели.
   */
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  /**
   * Время для активности в формате ЧЧ:мм.
   */
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe("Время для активности в формате ЧЧ:мм."),
  /**
   * Название упражнения или привычки.
   */
  activityName: z.string().describe("Название упражнения или привычки."),
  /**
   * Тип активности.
   */
  activityType: z.enum(['Workout', 'Habit']).describe("Тип активности."),
});

/**
 * Схема для выходных данных оптимизатора тренировок.
 */
const AIRoutineOptimizerOutputSchema = z.object({
  /**
   * Удобное для пользователя текстовое описание предложенного еженедельного расписания упражнений.
   */
  textualDescription: z
    .string()
    .describe(
      'Удобное для пользователя текстовое описание предложенного еженедельного расписания упражнений.'
    ),
  /**
   * Структурированный массив всех предложенных активностей на неделю.
   */
  structuredSchedule: z.array(ScheduledActivitySchema).describe("Структурированный массив всех предложенных активностей на неделю."),
});
/**
 * Тип для выходных данных оптимизатора тренировок.
 */
export type AIRoutineOptimizerOutput = z.infer<typeof AIRoutineOptimizerOutputSchema>;
/**
 * Тип для запланированной активности.
 */
export type ScheduledActivity = z.infer<typeof ScheduledActivitySchema>;

/**
 * Оптимизирует программу тренировок с помощью ИИ на основе предоставленных пользователем входных данных.
 * @param input - Входные данные для оптимизатора тренировок.
 * @returns Объект, содержащий текстовое описание и структурированное расписание.
 */
export async function aiRoutineOptimizer(input: AIRoutineOptimizerInput): Promise<AIRoutineOptimizerOutput> {
  return aiRoutineOptimizerFlow(input);
}

/**
 * Промпт для ИИ-ассистента по фитнесу.
 */
const prompt = ai.definePrompt({
  name: 'aiRoutineOptimizerPrompt',
  input: {schema: AIRoutineOptimizerInputSchema},
  output: {schema: AIRoutineOptimizerOutputSchema},
  prompt: `Вы - ИИ-ассистент по фитнесу, который генерирует расписание упражнений на основе предпочтений, расписания и целей.

  Создайте хорошо структурированное еженедельное расписание упражнений, учитывая указанные пользователем цели в фитнесе, доступность по расписанию, предпочтительные типы упражнений и любые предоставленные пользовательские упражнения.

  Ваш ответ ДОЛЖЕН включать как разговорное, удобное для пользователя текстовое описание расписания, ТАК И структурированный JSON-массив каждой отдельной активности.
  
  Для structuredSchedule:
  - Каждый элемент должен иметь день, конкретное время в формате ЧЧ:мм, название активности и тип активности ('Тренировка' или 'Привычка').
  - Основывайте 'activityName' на предпочтительных и пользовательских упражнениях пользователя. Если упражнение звучит как тренировка, классифицируйте его как 'Тренировка'. Если оно звучит как ежедневная рутина (например, 'Утренняя пробежка', 'Медитация'), классифицируйте его как 'Привычка'.

  Предпочтения пользователя:
  - Цели в фитнесе: {{{goals}}}
  - Доступность по расписанию: {{{availability}}}
  - Предпочтительные упражнения: {{{preferredExercises}}}
  - Пользовательские упражнения: {{{customExercises}}}
  `,
});

/**
 * Поток Genkit для оптимизатора тренировок.
 */
const aiRoutineOptimizerFlow = ai.defineFlow(
  {
    name: 'aiRoutineOptimizerFlow',
    inputSchema: AIRoutineOptimizerInputSchema,
    outputSchema: AIRoutineOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
