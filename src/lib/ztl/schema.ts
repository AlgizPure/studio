import { z } from 'zod';

/**
 * @fileoverview Схемы Zod для валидации структуры ZTL (Zenith Training Language).
 * Определяет типы для упражнений, циклов, тренировок, прогрессии и программ.
 */

/**
 * @description Базовая схема для упражнения в ZTL.
 * Включает все возможные поля для силовых и кардио упражнений.
 */
const ZTLExerciseBase = z.object({
    id: z.string(),
    name: z.string(),
    sets: z.number().int().positive().optional(),
    target_reps: z.string().regex(/^\d+(-\d+)?$/).optional(),
    target_weight_kg: z.number().positive().optional(),
    target_rpe: z.number().min(1).max(10).optional(),
    target_duration_s: z.number().positive().optional(),
    target_intensity: z.enum(['zone1', 'zone2', 'zone3', 'zone4', 'zone5']).optional(),
    rest_s: z.number().int().nonnegative().optional(),
});

/**
 * @description Схема упражнения ZTL с валидацией.
 * Упражнение должно иметь либо силовые цели (вес, повторения, RPE),
 * либо цели на выносливость (длительность, интенсивность), но не оба типа одновременно.
 */
export const ZTLExercise = ZTLExerciseBase.refine(
    (e) =>
      // либо силовые цели, либо длительность/интенсивность
      ((e.target_weight_kg !== undefined || e.target_reps !== undefined || e.target_rpe !== undefined) &&
        e.target_duration_s === undefined &&
        e.target_intensity === undefined) ||
      ((e.target_weight_kg === undefined && e.target_reps === undefined && e.target_rpe === undefined) &&
        (e.target_duration_s !== undefined || e.target_intensity !== undefined)),
    {
      message: 'Specify either strength targets or duration/intensity, not both',
    }
  );

/**
 * @description Схема для цикла упражнений в ZTL.
 * Цикл может быть обычным, круговым, суперсетом или дроп-сетом.
 */
export const ZTLCycle = z.object({
  type: z.enum(['normal', 'circuit', 'superset', 'dropset']),
  repetitions: z.number().int().positive().optional(),
  rest_after: z.number().int().nonnegative().optional(),
  exercises: z.array(ZTLExercise).min(1),
});

/**
 * @description Схема для тренировки в ZTL.
 * Тренировка состоит из одного или нескольких циклов упражнений.
 */
export const ZTLWorkout = z.object({
  id: z.string(),
  name: z.string(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  estimated_duration_min: z.number().int().positive().optional(),
  cycles: z.array(ZTLCycle).min(1),
});

/**
 * @description Схема для правил прогрессии в ZTL.
 * Определяет, как должны изменяться параметры тренировок (например, вес) со временем.
 */
export const ZTLProgression = z.object({
  rules: z.array(
    z.object({
      when: z
        .object({
          all_sets_completed: z.boolean().optional(),
          avg_rpe: z.object({ lte: z.number().optional(), gte: z.number().optional() }).optional(),
        })
        .strict(),
      do: z.object({
        action: z.enum(['increase_weight', 'decrease_weight']),
        amount: z.string().regex(/^\d+(\.\d+)?%$|^\d+(\.\d+)?$/),
      }),
    })
  ),
  microcycle_weeks: z.number().int().positive().optional(),
  deload: z
    .object({
      week: z.number().int().positive(),
      volume_reduction: z.string().regex(/^\d+(\.\d+)?%$/),
    })
    .optional(),
});

/**
 * @description Основная схема для программы тренировок ZTL.
 * Включает метаданные, расписание, список тренировок и правила прогрессии.
 */
export const ZTLProgram = z.object({
  meta: z.object({
    version: z.literal('1.0'),
    id: z.string(),
    name: z.string(),
    author: z.string().optional(),
    goal: z.enum(['hypertrophy', 'strength', 'fat_loss', 'endurance', 'mobility']).optional(),
    duration: z.object({ weeks: z.number().int().positive() }).optional(),
    tags: z.array(z.string()).optional(),
  }),
  phases: z.array(z.object({ name: z.string(), weeks: z.string().regex(/^\d+(-\d+)?$/) })).optional(),
  schedule: z
    .object({
      pattern: z.enum(['days_of_week', 'every_n_days']),
      days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
      every_n_days: z.number().int().positive().optional(),
    })
    .refine(
      (s) =>
        (s.pattern === 'days_of_week' && !!s.days && s.days.length > 0) ||
        (s.pattern === 'every_n_days' && !!s.every_n_days),
      { message: 'Schedule must match pattern' }
    ),
  workouts: z.array(ZTLWorkout).min(1),
  progression: ZTLProgression.optional(),
});

/**
 * @description Схема для ZTL Patch.
 * Определяет набор операций для изменения существующей программы ZTL.
 */
export const ZTLPatch = z.object({
  patch: z.array(
    z.union([
      z.object({
        op: z.literal('update-exercise'),
        program_id: z.string(),
        workout_id: z.string(),
        exercise_id: z.string(),
        set_target: ZTLExerciseBase.partial().optional(),
      }),
      z.object({ op: z.literal('add-program'), program: ZTLProgram }),
      z.object({ op: z.literal('update-program'), program_id: z.string(), program: ZTLProgram.partial() }),
      z.object({ op: z.literal('remove-exercise'), program_id: z.string(), workout_id: z.string(), exercise_id: z.string() }),
    ])
  ),
});

/**
 * Валидирует данные на соответствие схеме ZTLProgram.
 * @param {unknown} data - Данные для валидации.
 * @returns {z.SafeParseReturnType<any, any>} Результат валидации.
 */
export function validateZTL(data: unknown) {
  return ZTLProgram.safeParse(data);
}

/**
 * Валидирует данные на соответствие схеме ZTLPatch.
 * @param {unknown} data - Данные для валидации.
 * @returns {z.SafeParseReturnType<any, any>} Результат валидации.
 */
export function validateZTLPatch(data: unknown) {
  return ZTLPatch.safeParse(data);
}
