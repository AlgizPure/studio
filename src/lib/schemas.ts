/**
 * Shared Zod schemas and builders for form validation
 * Provides reusable validation patterns across the application
 */

import { z } from 'zod';

// ============================================================================
// BASE VALIDATORS
// ============================================================================

/**
 * Required string field with custom error message
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

/**
 * Optional string field (can be empty or undefined)
 */
export const optionalString = () =>
  z.string().optional();

/**
 * Required positive number
 */
export const requiredPositiveNumber = (fieldName: string) =>
  z.number().positive(`${fieldName} must be positive`);

/**
 * Optional positive number
 */
export const optionalPositiveNumber = () =>
  z.number().positive().optional();

/**
 * Email validation
 */
export const emailField = () =>
  z.string().email('Invalid email address');

/**
 * URL validation
 */
export const urlField = () =>
  z.string().url('Invalid URL');

/**
 * Date string validation (YYYY-MM-DD)
 */
export const dateString = () =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

/**
 * Time string validation (HH:MM)
 */
export const timeString = () =>
  z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

/**
 * Base entity schema - fields common to all entities
 */
export const baseEntitySchema = z.object({
  name: requiredString('Name'),
  description: optionalString(),
});

/**
 * Entity with category - extends base with categoryId
 */
export const categorizedEntitySchema = baseEntitySchema.extend({
  categoryId: requiredString('Category'),
});

/**
 * Entity with tags
 */
export const taggedEntitySchema = baseEntitySchema.extend({
  tags: z.array(z.string()).optional(),
});

/**
 * Entity with timestamps
 */
export const timestampedEntitySchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Full entity schema (name, description, category, tags, timestamps)
 */
export const fullEntitySchema = baseEntitySchema
  .extend({
    categoryId: requiredString('Category'),
    tags: z.array(z.string()).optional(),
  })
  .merge(timestampedEntitySchema);

// ============================================================================
// FORM-SPECIFIC SCHEMAS
// ============================================================================

/**
 * Habit form schema
 * For add-habit-dialog and edit-habit forms
 */
export const habitFormSchema = categorizedEntitySchema.extend({
  target: z.object({
    type: z.enum(['boolean', 'quantity', 'duration', 'range']),
    value: optionalPositiveNumber(),
    unit: optionalString(),
    min: optionalPositiveNumber(),
    max: optionalPositiveNumber(),
  }).optional(),
  schedule: z.object({
    intervalType: z.enum(['days_of_week', 'every_n_days', 'n_per_week', 'custom']),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    everyNDays: z.number().positive().optional(),
    nPerWeek: z.number().positive().optional(),
  }).optional(),
  reminders: z.array(z.object({
    time: timeString(),
    enabled: z.boolean(),
  })).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  archived: z.boolean().optional(),
  priority: z.number().min(1).max(5).optional(),
});

/**
 * Exercise form schema
 * For add-exercise-dialog
 */
export const exerciseFormSchema = categorizedEntitySchema.extend({
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  instructions: optionalString(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Program form schema
 * For add-program-dialog
 */
export const programFormSchema = baseEntitySchema.extend({
  goal: requiredString('Goal'),
  durationType: z.enum(['fixed', 'ongoing']),
  duration: z.object({
    weeks: z.number().positive().optional(),
    days: z.number().positive().optional(),
  }).optional(),
  workouts: z.array(z.object({
    workoutId: z.string(),
    week: z.number().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Workout form schema
 * For workout builder
 */
export const workoutFormSchema = baseEntitySchema.extend({
  targetMuscles: z.array(z.string()).optional(),
  estimatedDuration: z.number().positive().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  equipment: z.array(z.string()).optional(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Safe parse with error formatting
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    ),
  };
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = safeParse(schema, data);

  if (!result.success) {
    const errorMessage = context
      ? `${context}: ${result.errors.join(', ')}`
      : result.errors.join(', ');
    throw new Error(errorMessage);
  }

  return result.data;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const schemas = {
  // Base
  baseEntity: baseEntitySchema,
  categorizedEntity: categorizedEntitySchema,
  taggedEntity: taggedEntitySchema,
  timestampedEntity: timestampedEntitySchema,
  fullEntity: fullEntitySchema,

  // Forms
  habitForm: habitFormSchema,
  exerciseForm: exerciseFormSchema,
  programForm: programFormSchema,
  workoutForm: workoutFormSchema,
};

export const validators = {
  requiredString,
  optionalString,
  requiredPositiveNumber,
  optionalPositiveNumber,
  emailField,
  urlField,
  dateString,
  timeString,
};

export const helpers = {
  safeParse,
  validateOrThrow,
};
