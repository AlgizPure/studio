// src/lib/habits/import-export.ts
// Function 13.10: Habit Import/Export (Backup)
// JSON backup export and import with validation

import { collection, getDocs, addDoc, doc, updateDoc, query, where, type Firestore } from 'firebase/firestore';
import { z } from 'zod';
import type { Habit, HabitLog, HabitV2, HabitLegacy } from '@/lib/types';
import { subDays } from 'date-fns';

/**
 * Zod schemas for validation
 */
const HabitTargetSchema = z.object({
  type: z.enum(['boolean', 'quantity', 'duration', 'range']),
  unit: z.string().optional(),
  value: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  progressive: z
    .object({
      enabled: z.boolean(),
      step: z.number(),
      interval: z.number(),
      maxValue: z.number().optional(),
    })
    .optional(),
});

const HabitScheduleSchema = z.object({
  intervalType: z.enum(['days_of_week', 'every_n_days', 'n_per_week', 'custom']),
  days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  everyNDays: z.number().optional(),
  nPerWeek: z.number().optional(),
  preferredDays: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  timeWindow: z.object({ start: z.string(), end: z.string() }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const ReminderSchema = z.object({
  id: z.string(),
  times: z.array(z.string()),
  smart: z.boolean().optional(),
  snooze: z.boolean().optional(),
  untilDone: z.boolean().optional(),
});

const HabitV2Schema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: z.enum(['boolean', 'quantity', 'duration', 'range']),
  target: HabitTargetSchema.optional(),
  schedule: HabitScheduleSchema.optional(),
  reminders: z.array(ReminderSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  stackingRule: z
    .object({
      triggerId: z.string(),
      position: z.enum(['before', 'after']),
      delay: z.number().optional(),
    })
    .optional(),
  allowSkip: z.boolean().optional(),
  graceDays: z.number().optional(),
  priority: z.enum([1, 2, 3, 4, 5]).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  contextParams: z.record(z.record(z.unknown())).optional(),
  archived: z.boolean().optional(),
  authorId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  schemaVersion: z.literal(2).optional(),
  // Legacy compatibility fields
  completed: z.boolean().optional(),
  goal: z.string().optional(),
  days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  pomodoro: z.object({ cycles: z.number() }).optional(),
});

const HabitLegacySchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  goal: z.string().optional(),
  completed: z.boolean().optional(),
  days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  pomodoro: z.object({ cycles: z.number() }).optional(),
  authorId: z.string().optional(),
  schemaVersion: z.literal(1).optional(),
});

const HabitSchema = z.union([HabitV2Schema, HabitLegacySchema]);

const HabitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  status: z.enum(['done', 'partial', 'skipped', 'missed']),
  value: z.number().optional(),
  durationMin: z.number().optional(),
  percentage: z.number().optional(),
  note: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
  energy: z.enum(['low', 'neutral', 'high']).optional(),
  contextData: z.record(z.record(z.unknown())).optional(),
  extractedFrom: z.enum(['reflection', 'manual', 'auto']).optional(),
  aiConfidence: z.number().optional(),
  manuallyEdited: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const HabitsBackupSchema = z.object({
  version: z.literal('2.0'),
  exportDate: z.string(),
  habits: z.array(HabitSchema),
  logs: z.array(HabitLogSchema),
  metadata: z.object({
    totalHabits: z.number(),
    totalLogs: z.number(),
    dateRange: z.object({
      from: z.string(),
      to: z.string(),
    }),
  }),
});

export type HabitsBackup = z.infer<typeof HabitsBackupSchema>;

/**
 * Export habits to JSON backup (last 90 days of logs)
 */
export async function exportHabitsJSON(opts: {
  firestore: Firestore;
  userId: string;
  daysBack?: number;
}): Promise<HabitsBackup> {
  const { firestore, userId, daysBack = 90 } = opts;

  // Fetch all habits
  const habitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const habits: Habit[] = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));

  // Fetch logs (last N days)
  const cutoffDate = subDays(new Date(), daysBack).toISOString().split('T')[0];
  const logsSnap = await getDocs(
    query(
      collection(firestore, `users/${userId}/habitLogs`),
      where('date', '>=', cutoffDate)
    )
  );
  const logs: HabitLog[] = logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  const backup: HabitsBackup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    habits,
    logs,
    metadata: {
      totalHabits: habits.length,
      totalLogs: logs.length,
      dateRange: {
        from: cutoffDate,
        to: new Date().toISOString().split('T')[0],
      },
    },
  };

  return backup;
}

/**
 * Download habits backup as JSON file
 */
export function downloadHabitsBackupJSON(backup: HabitsBackup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validation result
 */
export type ImportValidationResult =
  | { success: true; data: HabitsBackup }
  | { success: false; error: string; details?: string[] };

/**
 * Validate imported JSON backup
 */
export function validateHabitsBackup(json: unknown): ImportValidationResult {
  try {
    const parsed = HabitsBackupSchema.parse(json);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return {
        success: false,
        error: 'Invalid backup format',
        details,
      };
    }
    return {
      success: false,
      error: 'Failed to parse JSON',
    };
  }
}

/**
 * Import result
 */
export type ImportResult = {
  habitsAdded: number;
  habitsSkipped: number;
  logsAdded: number;
  logsSkipped: number;
  errors: string[];
};

/**
 * Import habits from JSON backup
 * Merge strategy: Add new habits (skip duplicates by name), add all logs
 */
export async function importHabitsJSON(opts: {
  firestore: Firestore;
  userId: string;
  backup: HabitsBackup;
}): Promise<ImportResult> {
  const { firestore, userId, backup } = opts;

  const result: ImportResult = {
    habitsAdded: 0,
    habitsSkipped: 0,
    logsAdded: 0,
    logsSkipped: 0,
    errors: [],
  };

  // Fetch existing habits to check for duplicates
  const existingHabitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const existingHabits: Habit[] = existingHabitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));
  const existingHabitNames = new Set(existingHabits.map(h => h.name.toLowerCase().trim()));

  // Import habits (skip duplicates by name)
  const habitIdMap = new Map<string, string>(); // oldId -> newId

  for (const habit of backup.habits) {
    const normalizedName = habit.name.toLowerCase().trim();

    if (existingHabitNames.has(normalizedName)) {
      result.habitsSkipped++;
      continue;
    }

    try {
      // Remove 'id' field before adding (Firestore will auto-generate)
      const { id: oldId, ...habitData } = habit;

      // Add authorId if missing
      if (!habitData.authorId) {
        (habitData as any).authorId = userId;
      }

      const docRef = await addDoc(collection(firestore, `users/${userId}/habits`), habitData);
      habitIdMap.set(oldId, docRef.id);
      result.habitsAdded++;
    } catch (error) {
      result.errors.push(`Failed to import habit "${habit.name}": ${error}`);
    }
  }

  // Fetch existing logs to check for duplicates
  const existingLogsSnap = await getDocs(collection(firestore, `users/${userId}/habitLogs`));
  const existingLogs: HabitLog[] = existingLogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));
  const existingLogKeys = new Set(
    existingLogs.map(l => `${l.habitId}:${l.date}`)
  );

  // Import logs (skip duplicates by habitId + date)
  for (const log of backup.logs) {
    // Map old habitId to new habitId
    const newHabitId = habitIdMap.get(log.habitId);
    if (!newHabitId) {
      // Habit was not imported (duplicate), skip log
      result.logsSkipped++;
      continue;
    }

    const logKey = `${newHabitId}:${log.date}`;
    if (existingLogKeys.has(logKey)) {
      result.logsSkipped++;
      continue;
    }

    try {
      // Remove 'id' field and update habitId
      const { id: oldId, habitId: oldHabitId, ...logData } = log;

      await addDoc(collection(firestore, `users/${userId}/habitLogs`), {
        ...logData,
        habitId: newHabitId,
      });

      result.logsAdded++;
    } catch (error) {
      result.errors.push(`Failed to import log for habit ${log.habitId} on ${log.date}: ${error}`);
    }
  }

  return result;
}
