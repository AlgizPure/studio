/**
 * Client-side reminder scheduling logic
 * Manages local notification scheduling and escalation
 */

import type { Habit, Reminder } from './types';
import { isHabitDueToday } from './habits';
import { scheduleLocalNotification } from '@/firebase/messaging';

export type ReminderStatus = 'pending' | 'shown' | 'snoozed' | 'dismissed';

export interface ScheduledReminder {
  id: string;
  habitId: string;
  habitName: string;
  time: string; // HH:MM
  escalationLevel: number; // 0 = first, 1 = second, 2 = final
  status: ReminderStatus;
  scheduledFor: Date;
  untilDone?: boolean;
}

/**
 * Calculate minutes until a given time today
 */
function minutesUntilTime(timeStr: string): number {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  
  if (target < now) {
    // Time has passed today
    return -1;
  }
  
  return Math.floor((target.getTime() - now.getTime()) / 60000);
}

/**
 * Get all reminders for today
 */
export function getTodaysReminders(habits: Habit[]): ScheduledReminder[] {
  const reminders: ScheduledReminder[] = [];
  const now = new Date();

  for (const habit of habits) {
    if (!isHabitDueToday(habit, now)) continue;
    
    const habitReminders = 'reminders' in habit ? habit.reminders : undefined;
    if (!habitReminders || habitReminders.length === 0) continue;

    for (const reminder of habitReminders) {
      for (const time of reminder.times || []) {
        const minutesUntil = minutesUntilTime(time);
        if (minutesUntil < 0) continue; // Already passed

        const scheduledFor = new Date(now);
        const [hours, minutes] = time.split(':').map(Number);
        scheduledFor.setHours(hours, minutes, 0, 0);

        reminders.push({
          id: `${habit.id}-${reminder.id}-${time}`,
          habitId: habit.id,
          habitName: habit.name,
          time,
          escalationLevel: 0,
          status: 'pending',
          scheduledFor,
          untilDone: reminder.untilDone,
        });
      }
    }
  }

  return reminders.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}

/**
 * Schedule escalating reminders
 * First reminder at scheduled time, then +30min, +60min if not completed
 */
export function scheduleEscalatingReminders(
  reminder: ScheduledReminder,
  isCompleted: boolean
): void {
  if (isCompleted) {
    console.log(`[Reminders] Habit ${reminder.habitName} completed, cancelling reminders`);
    return;
  }

  const now = new Date();
  const delayMs = reminder.scheduledFor.getTime() - now.getTime();

  if (delayMs < 0) return; // Already passed

  // First reminder
  scheduleLocalNotification(
    '⏰ Habit Reminder',
    `Time for: ${reminder.habitName}`,
    delayMs
  );

  // Escalation 1: +30 minutes
  if (reminder.untilDone || reminder.escalationLevel < 1) {
    scheduleLocalNotification(
      '⏰⏰ Reminder',
      `Don't forget: ${reminder.habitName}`,
      delayMs + 30 * 60000
    );
  }

  // Escalation 2: +60 minutes (final)
  if (reminder.untilDone || reminder.escalationLevel < 2) {
    scheduleLocalNotification(
      '⏰⏰⏰ Final Reminder',
      `Last call: ${reminder.habitName}. Your streak is at risk!`,
      delayMs + 60 * 60000
    );
  }
}

/**
 * Snooze a reminder by N minutes
 */
export function snoozeReminder(reminder: ScheduledReminder, delayMinutes: number): void {
  const now = new Date();
  const snoozeUntil = new Date(now.getTime() + delayMinutes * 60000);
  
  scheduleLocalNotification(
    '⏰ Snoozed Reminder',
    `Time for: ${reminder.habitName}`,
    delayMinutes * 60000
  );

  console.log(`[Reminders] Snoozed ${reminder.habitName} for ${delayMinutes} minutes`);
}

/**
 * Smart reminder time adjustment
 * Analyzes when user actually completes habit vs reminder time
 */
export function analyzeReminderEffectiveness(
  habitName: string,
  reminderTime: string,
  actualCompletionTimes: string[] // HH:MM format
): { shouldAdjust: boolean; suggestedTime?: string } {
  if (actualCompletionTimes.length < 5) {
    return { shouldAdjust: false }; // Not enough data
  }

  // Calculate average completion time
  const avgMinutes = actualCompletionTimes.reduce((sum, time) => {
    const [h, m] = time.split(':').map(Number);
    return sum + h * 60 + m;
  }, 0) / actualCompletionTimes.length;

  const [reminderH, reminderM] = reminderTime.split(':').map(Number);
  const reminderMinutes = reminderH * 60 + reminderM;

  const diffMinutes = Math.abs(avgMinutes - reminderMinutes);

  if (diffMinutes > 30) {
    // Significant difference, suggest adjustment
    const suggestedH = Math.floor(avgMinutes / 60);
    const suggestedM = Math.round(avgMinutes % 60);
    const suggestedTime = `${String(suggestedH).padStart(2, '0')}:${String(suggestedM).padStart(2, '0')}`;

    return {
      shouldAdjust: true,
      suggestedTime,
    };
  }

  return { shouldAdjust: false };
}

/**
 * Get next reminder time for a habit
 */
export function getNextReminder(habit: Habit): Date | null {
  if (!isHabitDueToday(habit)) return null;
  
  const habitReminders = 'reminders' in habit ? habit.reminders : undefined;
  if (!habitReminders || habitReminders.length === 0) return null;

  const now = new Date();
  let nextTime: Date | null = null;

  for (const reminder of habitReminders) {
    for (const time of reminder.times || []) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hours, minutes, 0, 0);

      if (scheduled > now && (!nextTime || scheduled < nextTime)) {
        nextTime = scheduled;
      }
    }
  }

  return nextTime;
}

