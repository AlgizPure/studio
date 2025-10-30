import { z } from 'zod';

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

export const ZTLExercise = ZTLExerciseBase.refine(
    (e) =>
      // either strength targets or duration/intensity
      ((e.target_weight_kg !== undefined || e.target_reps !== undefined || e.target_rpe !== undefined) &&
        e.target_duration_s === undefined &&
        e.target_intensity === undefined) ||
      ((e.target_weight_kg === undefined && e.target_reps === undefined && e.target_rpe === undefined) &&
        (e.target_duration_s !== undefined || e.target_intensity !== undefined)),
    {
      message: 'Specify either strength targets or duration/intensity, not both',
    }
  );

export const ZTLCycle = z.object({
  type: z.enum(['normal', 'circuit', 'superset', 'dropset']),
  repetitions: z.number().int().positive().optional(),
  rest_after: z.number().int().nonnegative().optional(),
  exercises: z.array(ZTLExercise).min(1),
});

export const ZTLWorkout = z.object({
  id: z.string(),
  name: z.string(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  estimated_duration_min: z.number().int().positive().optional(),
  cycles: z.array(ZTLCycle).min(1),
});

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

export function validateZTL(data: unknown) {
  return ZTLProgram.safeParse(data);
}

export function validateZTLPatch(data: unknown) {
  return ZTLPatch.safeParse(data);
}



