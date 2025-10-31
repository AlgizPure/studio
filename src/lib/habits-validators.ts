/**
 * Zod validators for habit-related entities.
 * Provides runtime validation before Firestore writes.
 */

import { z } from 'zod';
import type { HabitLogStatus } from './types';

// ===============================
// HabitLog validation
// ===============================

export const habitLogStatusSchema = z.enum(['done', 'partial', 'skipped', 'missed']);

export const habitLogSchema = z.object({
  id: z.string().optional(), // Auto-generated if missing
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  status: habitLogStatusSchema,
  value: z.number().positive().optional(),
  durationMin: z.number().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
  energy: z.enum(['low', 'neutral', 'high']).optional(),
  contextData: z.record(z.any()).optional(),
  extractedFrom: z.enum(['reflection', 'manual', 'auto']).optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  manuallyEdited: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Quantity habits should have value OR percentage
    if (data.status === 'done' && !data.value && !data.percentage && !data.durationMin) {
      return false;
    }
    // Duration habits should have durationMin OR percentage
    if (data.status === 'done' && !data.durationMin && !data.percentage && !data.value) {
      return false;
    }
    // Can't have both value and durationMin
    if (data.value !== undefined && data.durationMin !== undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'Invalid log: must have value or durationMin for done status, and cannot have both',
  }
);

// ===============================
// DailyReflection validation
// ===============================

export const parsedEntrySchema = z.object({
  habitId: z.string().min(1),
  habitName: z.string().optional(),
  extractedValue: z.number().positive().optional(),
  extractedDuration: z.number().positive().optional(),
  extractedNote: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
  energy: z.enum(['low', 'neutral', 'high']).optional(),
  confidence: z.number().min(0).max(1),
  suggestedStatus: habitLogStatusSchema,
});

export const dailyReflectionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  rawText: z.string().min(1, 'Raw text is required'),
  parsedEntries: z.array(parsedEntrySchema),
  manualCorrections: z.boolean(),
  correctedEntries: z.array(z.any()).optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  processedAt: z.string().datetime().optional(),
});

// ===============================
// HabitV2 validation
// ===============================

export const habitTypeSchema = z.enum(['boolean', 'quantity', 'duration', 'range']);

export const habitIntervalTypeSchema = z.enum(['days_of_week', 'every_n_days', 'n_per_week', 'custom']);

export const habitScheduleSchema = z.object({
  intervalType: habitIntervalTypeSchema,
  days: z.array(z.string()).optional(),
  everyNDays: z.number().positive().optional(),
  nPerWeek: z.number().min(1).max(7).optional(),
  preferredDays: z.array(z.string()).optional(),
  timeWindow: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const reminderSchema = z.object({
  id: z.string(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
  smart: z.boolean().optional(),
  snooze: z.boolean().optional(),
  untilDone: z.boolean().optional(),
});

export const habitTargetSchema = z.object({
  type: habitTypeSchema,
  unit: z.string().optional(),
  value: z.number().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  progressive: z.object({
    enabled: z.boolean(),
    step: z.number().positive(),
    interval: z.number().positive(),
    maxValue: z.number().positive().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.type === 'quantity' || data.type === 'duration') {
      return data.value !== undefined && data.value > 0;
    }
    if (data.type === 'range') {
      return data.min !== undefined && data.max !== undefined && data.min < data.max;
    }
    return true;
  },
  {
    message: 'Target value/range must be valid for the habit type',
  }
);

export const habitV2Schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: habitTypeSchema,
  target: habitTargetSchema.optional(),
  schedule: habitScheduleSchema.optional(),
  reminders: z.array(reminderSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  stackingRule: z.object({
    triggerId: z.string(),
    position: z.enum(['before', 'after']),
    delay: z.number().nonnegative().optional(),
  }).optional(),
  allowSkip: z.boolean().optional(),
  graceDays: z.number().nonnegative().optional(),
  priority: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  contextParams: z.record(z.any()).optional(),
  archived: z.boolean().optional(),
  authorId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  schemaVersion: z.literal(2).optional(),
  // Legacy compatibility
  completed: z.boolean().optional(),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  pomodoro: z.object({
    cycles: z.number().positive(),
  }).optional(),
});

// ===============================
// Validation helpers
// ===============================

/**
 * Validates and creates a HabitLog with proper defaults.
 * Throws ZodError if validation fails.
 */
export function validateAndCreateHabitLog(data: unknown): z.infer<typeof habitLogSchema> {
  const now = new Date().toISOString();
  const base = {
    createdAt: now,
    updatedAt: now,
    extractedFrom: 'manual' as const,
  };

  const parsed = habitLogSchema.parse(data);
  
  return {
    ...base,
    ...parsed,
    // Ensure date is valid
    date: parsed.date,
    // Ensure status is valid
    status: parsed.status,
  };
}

/**
 * Validates a DailyReflection.
 */
export function validateDailyReflection(data: unknown): z.infer<typeof dailyReflectionSchema> {
  return dailyReflectionSchema.parse(data);
}

/**
 * Validates a HabitV2.
 */
export function validateHabitV2(data: unknown): z.infer<typeof habitV2Schema> {
  return habitV2Schema.parse(data);
}

