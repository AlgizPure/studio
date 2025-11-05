/**
 * @fileoverview Валидаторы Zod для сущностей, связанных с привычками.
 * Обеспечивает проверку во время выполнения перед записью в Firestore.
 */

import { z } from 'zod';
import type { HabitLogStatus } from './types';

// ===============================
// Валидация HabitLog
// ===============================

export const habitLogStatusSchema = z.enum(['done', 'partial', 'skipped', 'missed']);

export const habitLogSchema = z.object({
  id: z.string().optional(), // Генерируется автоматически, если отсутствует
  habitId: z.string().min(1, 'ID привычки обязателен'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате ГГГГ-ММ-ДД'),
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
    // Количественные привычки должны иметь значение ИЛИ процент
    if (data.status === 'done' && !data.value && !data.percentage && !data.durationMin) {
      return false;
    }
    // Привычки по продолжительности должны иметь durationMin ИЛИ процент
    if (data.status === 'done' && !data.durationMin && !data.percentage && !data.value) {
      return false;
    }
    // Нельзя иметь одновременно и значение, и durationMin
    if (data.value !== undefined && data.durationMin !== undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'Неверный лог: для статуса "done" должно быть значение или durationMin, и не может быть и того, и другого',
  }
);

// ===============================
// Валидация DailyReflection
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате ГГГГ-ММ-ДД'),
  rawText: z.string().min(1, 'Необработанный текст обязателен'),
  parsedEntries: z.array(parsedEntrySchema),
  manualCorrections: z.boolean(),
  correctedEntries: z.array(z.any()).optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  processedAt: z.string().datetime().optional(),
});

// ===============================
// Валидация HabitV2
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
    message: 'Целевое значение/диапазон должны быть действительными для типа привычки',
  }
);

export const habitV2Schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Название обязательно'),
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
  // Совместимость с устаревшей версией
  completed: z.boolean().optional(),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  pomodoro: z.object({
    cycles: z.number().positive(),
  }).optional(),
});

// ===============================
// Вспомогательные функции валидации
// ===============================

/**
 * Проверяет и создает HabitLog с правильными значениями по умолчанию.
 * Выбрасывает ZodError, если валидация не удалась.
 * @param {unknown} data - Данные для валидации.
 * @returns {z.infer<typeof habitLogSchema>} - Проверенные и созданные данные.
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
    // Убеждаемся, что дата действительна
    date: parsed.date,
    // Убеждаемся, что статус действителен
    status: parsed.status,
  };
}

/**
 * Проверяет DailyReflection.
 * @param {unknown} data - Данные для валидации.
 * @returns {z.infer<typeof dailyReflectionSchema>} - Проверенные данные.
 */
export function validateDailyReflection(data: unknown): z.infer<typeof dailyReflectionSchema> {
  return dailyReflectionSchema.parse(data);
}

/**
 * Проверяет HabitV2.
 * @param {unknown} data - Данные для валидации.
 * @returns {z.infer<typeof habitV2Schema>} - Проверенные данные.
 */
export function validateHabitV2(data: unknown): z.infer<typeof habitV2Schema> {
  return habitV2Schema.parse(data);
}
