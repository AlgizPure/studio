/**
 * Type guards and helpers for habit type safety.
 * Eliminates need for `as any` casts by providing runtime type checks.
 */

import type { Habit, HabitV2, HabitTarget, HabitSchedule, Reminder } from './types';

/**
 * Type guard: checks if a habit is HabitV2 (has 'type' field)
 */
export function isHabitV2(habit: Habit | HabitV2): habit is HabitV2 {
  return 'type' in habit && typeof (habit as HabitV2).type === 'string';
}

/**
 * Type guard: checks if a habit has quantity target
 */
export function isQuantityTarget(target?: HabitTarget): target is HabitTarget & { type: 'quantity' } {
  return target?.type === 'quantity';
}

/**
 * Type guard: checks if a habit has duration target
 */
export function isDurationTarget(target?: HabitTarget): target is HabitTarget & { type: 'duration' } {
  return target?.type === 'duration';
}

/**
 * Type guard: checks if a habit has range target
 */
export function isRangeTarget(target?: HabitTarget): target is HabitTarget & { type: 'range' } {
  return target?.type === 'range';
}

/**
 * Safely get tags from habit (V2 or Legacy)
 */
export function getHabitTags(habit: Habit | HabitV2): string[] {
  if (isHabitV2(habit)) {
    return habit.tags || [];
  }
  // Legacy habits don't have tags
  return [];
}

/**
 * Safely get priority from habit (V2 or Legacy)
 */
export function getHabitPriority(habit: Habit | HabitV2): number | undefined {
  if (isHabitV2(habit)) {
    return habit.priority;
  }
  return undefined;
}

/**
 * Safely get difficulty from habit (V2 or Legacy)
 */
export function getHabitDifficulty(habit: Habit | HabitV2): 'easy' | 'medium' | 'hard' | undefined {
  if (isHabitV2(habit)) {
    return habit.difficulty;
  }
  return undefined;
}

/**
 * Safely get target from habit (V2 only)
 */
export function getHabitTarget(habit: Habit | HabitV2): HabitTarget | undefined {
  if (isHabitV2(habit)) {
    return habit.target;
  }
  return undefined;
}

/**
 * Safely get reminders from habit (V2 only)
 */
export function getHabitReminders(habit: Habit | HabitV2): Reminder[] {
  if (isHabitV2(habit)) {
    return habit.reminders || [];
  }
  return [];
}

/**
 * Safely get stacking rule from habit (V2 only)
 */
export function getHabitStackingRule(habit: Habit | HabitV2): { triggerId: string; position: 'before' | 'after'; delay?: number } | undefined {
  if (isHabitV2(habit)) {
    return habit.stackingRule as any;
  }
  return undefined;
}

/**
 * Safely get schedule from habit (V2 only)
 */
export function getHabitSchedule(habit: Habit | HabitV2): HabitSchedule | undefined {
  if (isHabitV2(habit)) {
    return habit.schedule;
  }
  return undefined;
}

/**
 * Safely check if habit is quantity type (V2 only)
 */
export function isQuantityHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'quantity';
  }
  return false;
}

/**
 * Safely check if habit is duration type (V2 only)
 */
export function isDurationHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'duration';
  }
  return false;
}

/**
 * Safely check if habit is boolean type (V2) or legacy
 */
export function isBooleanHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'boolean';
  }
  // Legacy habits are treated as boolean
  return true;
}

