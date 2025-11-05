/**
 * @fileoverview Type guards и вспомогательные функции для типобезопасности привычек.
 * Устраняет необходимость в приведении типов `as any` путем предоставления проверок типов во время выполнения.
 */

import type { Habit, HabitV2, HabitTarget, HabitSchedule, Reminder } from './types';

/**
 * Type guard: проверяет, является ли привычка HabitV2 (имеет поле 'type').
 * @param {Habit | HabitV2} habit - Привычка для проверки.
 * @returns {habit is HabitV2}
 */
export function isHabitV2(habit: Habit | HabitV2): habit is HabitV2 {
  return 'type' in habit && typeof (habit as HabitV2).type === 'string';
}

/**
 * Type guard: проверяет, имеет ли привычка количественную цель.
 * @param {HabitTarget} [target] - Цель для проверки.
 * @returns {target is HabitTarget & { type: 'quantity' }}
 */
export function isQuantityTarget(target?: HabitTarget): target is HabitTarget & { type: 'quantity' } {
  return target?.type === 'quantity';
}

/**
 * Type guard: проверяет, имеет ли привычка цель по продолжительности.
 * @param {HabitTarget} [target] - Цель для проверки.
 * @returns {target is HabitTarget & { type: 'duration' }}
 */
export function isDurationTarget(target?: HabitTarget): target is HabitTarget & { type: 'duration' } {
  return target?.type === 'duration';
}

/**
 * Type guard: проверяет, имеет ли привычка цель-диапазон.
 * @param {HabitTarget} [target] - Цель для проверки.
 * @returns {target is HabitTarget & { type: 'range' }}
 */
export function isRangeTarget(target?: HabitTarget): target is HabitTarget & { type: 'range' } {
  return target?.type === 'range';
}

/**
 * Безопасно получает теги из привычки (V2 или Legacy).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {string[]} - Массив тегов.
 */
export function getHabitTags(habit: Habit | HabitV2): string[] {
  if (isHabitV2(habit)) {
    return habit.tags || [];
  }
  // Устаревшие привычки не имеют тегов
  return [];
}

/**
 * Безопасно получает приоритет из привычки (V2 или Legacy).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {number | undefined} - Приоритет.
 */
export function getHabitPriority(habit: Habit | HabitV2): number | undefined {
  if (isHabitV2(habit)) {
    return habit.priority;
  }
  return undefined;
}

/**
 * Безопасно получает сложность из привычки (V2 или Legacy).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {'easy' | 'medium' | 'hard' | undefined} - Сложность.
 */
export function getHabitDifficulty(habit: Habit | HabitV2): 'easy' | 'medium' | 'hard' | undefined {
  if (isHabitV2(habit)) {
    return habit.difficulty;
  }
  return undefined;
}

/**
 * Безопасно получает цель из привычки (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {HabitTarget | undefined} - Цель.
 */
export function getHabitTarget(habit: Habit | HabitV2): HabitTarget | undefined {
  if (isHabitV2(habit)) {
    return habit.target;
  }
  return undefined;
}

/**
 * Безопасно получает напоминания из привычки (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {Reminder[]} - Массив напоминаний.
 */
export function getHabitReminders(habit: Habit | HabitV2): Reminder[] {
  if (isHabitV2(habit)) {
    return habit.reminders || [];
  }
  return [];
}

/**
 * Безопасно получает правило группировки из привычки (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {{ triggerId: string; position: 'before' | 'after'; delay?: number } | undefined} - Правило группировки.
 */
export function getHabitStackingRule(habit: Habit | HabitV2): { triggerId: string; position: 'before' | 'after'; delay?: number } | undefined {
  if (isHabitV2(habit)) {
    return habit.stackingRule as any;
  }
  return undefined;
}

/**
 * Безопасно получает расписание из привычки (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {HabitSchedule | undefined} - Расписание.
 */
export function getHabitSchedule(habit: Habit | HabitV2): HabitSchedule | undefined {
  if (isHabitV2(habit)) {
    return habit.schedule;
  }
  return undefined;
}

/**
 * Безопасно проверяет, является ли привычка количественного типа (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {boolean} - true, если привычка количественного типа.
 */
export function isQuantityHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'quantity';
  }
  return false;
}

/**
 * Безопасно проверяет, является ли привычка типа "продолжительность" (только V2).
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {boolean} - true, если привычка типа "продолжительность".
 */
export function isDurationHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'duration';
  }
  return false;
}

/**
 * Безопасно проверяет, является ли привычка логического типа (V2) или устаревшей.
 * @param {Habit | HabitV2} habit - Привычка.
 * @returns {boolean} - true, если привычка логического типа.
 */
export function isBooleanHabit(habit: Habit | HabitV2): boolean {
  if (isHabitV2(habit)) {
    return habit.type === 'boolean';
  }
  // Устаревшие привычки рассматриваются как логические
  return true;
}
