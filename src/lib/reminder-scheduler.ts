/**
 * @fileoverview Логика планирования напоминаний на стороне клиента.
 * Управляет планированием локальных уведомлений и эскалацией.
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
  escalationLevel: number; // 0 = первое, 1 = второе, 2 = последнее
  status: ReminderStatus;
  scheduledFor: Date;
  untilDone?: boolean;
}

/**
 * Вычисляет количество минут до заданного времени сегодня.
 * @param {string} timeStr - Время в формате "HH:MM".
 * @returns {number} - Количество минут до заданного времени, или -1, если время уже прошло.
 */
function minutesUntilTime(timeStr: string): number {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  
  if (target < now) {
    // Время сегодня уже прошло
    return -1;
  }
  
  return Math.floor((target.getTime() - now.getTime()) / 60000);
}

/**
 * Получает все напоминания на сегодня.
 * @param {Habit[]} habits - Массив привычек.
 * @returns {ScheduledReminder[]} - Массив запланированных напоминаний.
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
        if (minutesUntil < 0) continue; // Уже прошло

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
 * Планирует эскалирующие напоминания.
 * Первое напоминание в запланированное время, затем +30 мин, +60 мин, если не выполнено.
 * @param {ScheduledReminder} reminder - Запланированное напоминание.
 * @param {boolean} isCompleted - Выполнена ли привычка.
 */
export function scheduleEscalatingReminders(
  reminder: ScheduledReminder,
  isCompleted: boolean
): void {
  if (isCompleted) {
    console.log(`[Напоминания] Привычка ${reminder.habitName} выполнена, отмена напоминаний`);
    return;
  }

  const now = new Date();
  const delayMs = reminder.scheduledFor.getTime() - now.getTime();

  if (delayMs < 0) return; // Уже прошло

  // Первое напоминание
  scheduleLocalNotification(
    '⏰ Напоминание о привычке',
    `Время для: ${reminder.habitName}`,
    delayMs
  );

  // Эскалация 1: +30 минут
  if (reminder.untilDone || reminder.escalationLevel < 1) {
    scheduleLocalNotification(
      '⏰⏰ Напоминание',
      `Не забудьте: ${reminder.habitName}`,
      delayMs + 30 * 60000
    );
  }

  // Эскалация 2: +60 минут (финальное)
  if (reminder.untilDone || reminder.escalationLevel < 2) {
    scheduleLocalNotification(
      '⏰⏰⏰ Последнее напоминание',
      `Последний вызов: ${reminder.habitName}. Ваша серия под угрозой!`,
      delayMs + 60 * 60000
    );
  }
}

/**
 * Откладывает напоминание на N минут.
 * @param {ScheduledReminder} reminder - Запланированное напоминание.
 * @param {number} delayMinutes - Задержка в минутах.
 */
export function snoozeReminder(reminder: ScheduledReminder, delayMinutes: number): void {
  const now = new Date();
  const snoozeUntil = new Date(now.getTime() + delayMinutes * 60000);
  
  scheduleLocalNotification(
    '⏰ Отложенное напоминание',
    `Время для: ${reminder.habitName}`,
    delayMinutes * 60000
  );

  console.log(`[Напоминания] Отложено ${reminder.habitName} на ${delayMinutes} минут`);
}

/**
 * Умная корректировка времени напоминания.
 * Анализирует, когда пользователь фактически выполняет привычку по сравнению со временем напоминания.
 * @param {string} habitName - Название привычки.
 * @param {string} reminderTime - Время напоминания.
 * @param {string[]} actualCompletionTimes - Фактическое время выполнения в формате "HH:MM".
 * @returns {{ shouldAdjust: boolean; suggestedTime?: string }} - Объект с результатом анализа.
 */
export function analyzeReminderEffectiveness(
  habitName: string,
  reminderTime: string,
  actualCompletionTimes: string[] // HH:MM format
): { shouldAdjust: boolean; suggestedTime?: string } {
  if (actualCompletionTimes.length < 5) {
    return { shouldAdjust: false }; // Недостаточно данных
  }

  // Вычисляем среднее время выполнения
  const avgMinutes = actualCompletionTimes.reduce((sum, time) => {
    const [h, m] = time.split(':').map(Number);
    return sum + h * 60 + m;
  }, 0) / actualCompletionTimes.length;

  const [reminderH, reminderM] = reminderTime.split(':').map(Number);
  const reminderMinutes = reminderH * 60 + reminderM;

  const diffMinutes = Math.abs(avgMinutes - reminderMinutes);

  if (diffMinutes > 30) {
    // Значительная разница, предлагаем корректировку
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
 * Получает следующее время напоминания для привычки.
 * @param {Habit} habit - Привычка.
 * @returns {Date | null} - Следующее время напоминания или null.
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
