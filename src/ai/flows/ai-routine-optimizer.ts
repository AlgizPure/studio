'use server';
/**
 * @fileoverview Поток на базе AI для оптимизации распорядка дня.
 *
 * - aiRoutineOptimizer - Функция, которая обрабатывает процесс оптимизации распорядка.
 * - AIRoutineOptimizerInput - Тип входных данных для функции aiRoutineOptimizer.
 * - AIRoutineOptimizerOutput - Тип возвращаемых данных для функции aiRoutineOptimizer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Схема входных данных для оптимизатора распорядка AI.
 * @property {string} goals - Цели пользователя в фитнесе, например, скорость, рельеф мышц, потеря жира.
 * @property {string} availability - Доступность пользователя по расписанию, включая дни и время, доступные для тренировок.
 * @property {string} preferredExercises - Предпочтительные типы упражнений пользователя, например, силовые тренировки, биодинамика, бег, статические упражнения.
 * @property {string} [customExercises] - Список пользовательских упражнений, предоставленных пользователем, включая название и описание.
 */
const AIRoutineOptimizerInputSchema = z.object({
  goals: z
    .string()
    .describe(
      'Цели пользователя в фитнесе, например, скорость, рельеф мышц, потеря жира.'
    ),
  availability: z
    .string()
    .describe(
      'Доступность пользователя по расписанию, включая дни и время, доступные для тренировок.'
    ),
  preferredExercises: z
    .string()
    .describe(
      'Предпочтительные типы упражнений пользователя, например, силовые тренировки, биодинамика, бег, статические упражнения.'
    ),
  customExercises: z
    .string()
    .optional()
    .describe(
      'Список пользовательских упражнений, предоставленных пользователем, включая название и описание.'
    ),
});
export type AIRoutineOptimizerInput = z.infer<typeof AIRoutineOptimizerInputSchema>;

/**
 * Схема для запланированного занятия.
 * @property {('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')} day - День недели.
 * @property {string} time - Время для занятия в формате ЧЧ:мм.
 * @property {string} activityName - Название упражнения или привычки.
 * @property {('Workout'|'Habit')} activityType - Тип занятия.
 */
const ScheduledActivitySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe("Время для занятия в формате ЧЧ:мм."),
  activityName: z.string().describe("Название упражнения или привычки."),
  activityType: z.enum(['Workout', 'Habit']).describe("Тип занятия."),
});

/**
 * Схема выходных данных для оптимизатора распорядка AI.
 * @property {string} textualDescription - Дружелюбное текстовое описание предложенного еженедельного расписания упражнений.
 * @property {Array<ScheduledActivity>} structuredSchedule - Структурированный массив всех предложенных занятий на неделю.
 */
const AIRoutineOptimizerOutputSchema = z.object({
  textualDescription: z
    .string()
    .describe(
      'Дружелюбное текстовое описание предложенного еженедельного расписания упражнений.'
    ),
  structuredSchedule: z.array(ScheduledActivitySchema).describe("Структурированный массив всех предложенных занятий на неделю."),
});
export type AIRoutineOptimizerOutput = z.infer<typeof AIRoutineOptimizerOutputSchema>;
export type ScheduledActivity = z.infer<typeof ScheduledActivitySchema>;

/**
 * Оптимизирует распорядок пользователя с помощью AI.
 * @param {AIRoutineOptimizerInput} input - Входные данные для оптимизатора.
 * @returns {Promise<AIRoutineOptimizerOutput>} - Обещание, которое разрешается с оптимизированным распорядком.
 */
export async function aiRoutineOptimizer(input: AIRoutineOptimizerInput): Promise<AIRoutineOptimizerOutput> {
  return aiRoutineOptimizerFlow(input);
}

/**
 * Промпт для AI, который генерирует расписание упражнений.
 */
const prompt = ai.definePrompt({
  name: 'aiRoutineOptimizerPrompt',
  input: {schema: AIRoutineOptimizerInputSchema},
  output: {schema: AIRoutineOptimizerOutputSchema},
  prompt: `Вы — AI-фитнес-ассистент, который генерирует расписание упражнений на основе предпочтений, расписания и целей.

  Создайте хорошо структурированное еженедельное расписание упражнений, учитывая указанные пользователем фитнес-цели, доступность по расписанию, предпочтительные типы упражнений и любые пользовательские упражнения.

  Ваш ответ ДОЛЖЕН включать как разговорное, дружелюбное текстовое описание расписания, так и структурированный JSON-массив каждого занятия.
  
  Для structuredSchedule:
  - Каждый элемент должен иметь день, конкретное время в формате ЧЧ:мм, название занятия (activityName) и тип занятия (activityType) ('Workout' или 'Habit').
  - Основывайте 'activityName' на предпочтительных и пользовательских упражнениях пользователя. Если упражнение звучит как тренировка, классифицируйте его как 'Workout'. Если оно звучит как ежедневная рутина (например, 'Утренняя пробежка', 'Медитация'), классифицируйте его как 'Habit'.

  Предпочтения пользователя:
  - Фитнес-цели: {{{goals}}}
  - Доступность по расписанию: {{{availability}}}
  - Предпочтительные упражнения: {{{preferredExercises}}}
  - Пользовательские упражнения: {{{customExercises}}}
  `,
});

/**
 * Поток Genkit для оптимизации распорядка с помощью AI.
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
