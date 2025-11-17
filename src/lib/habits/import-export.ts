import type { Habit } from '@/lib/types';
import { z } from 'zod';
import { subDays } from 'date-fns';

/**
 * Import/Export utilities for Habits (Backup & Sharing)
 *
 * Supports:
 * - Export habits to JSON (with last 90 days of data)
 * - Import habits from JSON (with validation and merge strategy)
 * - Schema validation using Zod
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.10 - Import/Export (Stage 6)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */

// Zod schema for habit validation
const HabitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(['daily', 'weekly', 'count', 'duration']),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  targetCount: z.number().optional(),
  targetDuration: z.number().optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  completed: z.boolean(),
  currentStreak: z.number().optional(),
  bestStreak: z.number().optional(),
  order: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const HabitsExportSchema = z.object({
  version: z.literal('1.0'),
  exportDate: z.string().datetime(),
  appName: z.literal('Zenith Trainer'),
  habits: z.array(HabitSchema),
  metadata: z.object({
    totalHabits: z.number(),
    exportPeriodDays: z.number(),
  }),
});

export type HabitsExport = z.infer<typeof HabitsExportSchema>;

/**
 * Export habits to JSON format
 */
export function exportHabitsToJSON(
  habits: Habit[],
  options: { periodDays?: number } = {}
): HabitsExport {
  const { periodDays = 90 } = options;

  const exportData: HabitsExport = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Zenith Trainer',
    habits: habits.map(h => ({
      id: h.id,
      userId: h.userId,
      name: h.name,
      type: h.type,
      description: h.description,
      icon: h.icon,
      color: h.color,
      targetCount: h.targetCount,
      targetDuration: h.targetDuration,
      weekdays: h.weekdays,
      completed: h.completed,
      currentStreak: h.currentStreak,
      bestStreak: h.bestStreak,
      order: h.order,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    })),
    metadata: {
      totalHabits: habits.length,
      exportPeriodDays: periodDays,
    },
  };

  return exportData;
}

/**
 * Validate imported JSON data
 */
export function validateHabitsImport(data: unknown): {
  valid: boolean;
  data?: HabitsExport;
  error?: string;
} {
  try {
    const parsed = HabitsExportSchema.parse(data);
    return { valid: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }
    return { valid: false, error: 'Invalid format' };
  }
}

/**
 * Import habits from JSON
 *
 * Merge strategy:
 * - Add habits that don't exist (by name)
 * - Skip habits that already exist
 * - Update userId to current user
 * - Generate new IDs for imported habits
 */
export function importHabitsFromJSON(
  importData: HabitsExport,
  existingHabits: Habit[],
  currentUserId: string
): {
  habitsToAdd: Omit<Habit, 'id'>[];
  skipped: string[];
  summary: string;
} {
  const existingNames = new Set(existingHabits.map(h => h.name.toLowerCase()));
  const habitsToAdd: Omit<Habit, 'id'>[] = [];
  const skipped: string[] = [];

  importData.habits.forEach(habit => {
    const nameLower = habit.name.toLowerCase();

    // Skip if already exists
    if (existingNames.has(nameLower)) {
      skipped.push(habit.name);
      return;
    }

    // Add habit with new userId and current timestamps
    habitsToAdd.push({
      userId: currentUserId,
      name: habit.name,
      type: habit.type,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      targetCount: habit.targetCount,
      targetDuration: habit.targetDuration,
      weekdays: habit.weekdays,
      completed: false, // Reset completion status
      currentStreak: 0, // Reset streaks
      bestStreak: 0,
      order: habit.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const summary = `Imported ${habitsToAdd.length} habit(s). Skipped ${skipped.length} duplicate(s).`;

  return { habitsToAdd, skipped, summary };
}

/**
 * Download JSON export as file
 */
export function downloadJSON(data: HabitsExport, filename?: string): void {
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `zenith-habits-${date}.json`;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded file as JSON
 */
export async function parseJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
