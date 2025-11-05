import { addDays, differenceInCalendarDays, isWithinInterval } from 'date-fns';
import type { Day, HabitLegacy, Habit } from './types';
import type { HabitV2, HabitSchedule, HabitIntervalType, HabitLog, HabitStreak } from './types';
import { isHabitV2 } from './habits-guards';

/**
 * @fileoverview Вспомогательные функции для работы с привычками, включая преобразование, проверку и аналитику.
 */

const dayMap: Record<Day, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

/**
 * Преобразует устаревшую привычку в формат HabitV2.
 * @param {HabitLegacy} legacy - Устаревшая привычка.
 * @returns {HabitV2} - Привычка в формате V2.
 */
export function toHabitV2(legacy: HabitLegacy): HabitV2 {
  const schedule: HabitSchedule | undefined = legacy.days && legacy.days.length > 0
    ? { intervalType: 'days_of_week', days: legacy.days }
    : undefined;

  return {
    id: legacy.id,
    name: legacy.name,
    categoryId: legacy.categoryId,
    type: 'boolean',
    schedule,
    archived: false,
    authorId: legacy.authorId,
  };
}

function isWithinTimeWindow(now: Date, timeWindow?: { start: string; end: string }): boolean {
  if (!timeWindow) return true;
  const [sh, sm] = timeWindow.start.split(':').map(Number);
  const [eh, em] = timeWindow.end.split(':').map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins >= startMins) return minutes >= startMins && minutes <= endMins;
  // окно через полночь
  return minutes >= startMins || minutes <= endMins;
}

/**
 * Проверяет, должна ли привычка выполняться сегодня.
 * @param {Habit} habit - Привычка.
 * @param {Date} [date=new Date()] - Дата для проверки.
 * @returns {boolean} - true, если привычка должна выполняться.
 */
export function isHabitDueToday(habit: Habit, date: Date = new Date()): boolean {
  const h: HabitV2 = isHabitV2(habit) ? habit : toHabitV2(habit);

  // диапазон дат
  if (h.schedule?.startDate || h.schedule?.endDate) {
    const start = h.schedule?.startDate ? new Date(h.schedule.startDate) : undefined;
    const end = h.schedule?.endDate ? new Date(h.schedule.endDate) : undefined;
    if (start && end && !isWithinInterval(date, { start, end })) return false;
    if (start && !end && date < start) return false;
    if (!start && end && date > end) return false;
  }

  const intervalType: HabitIntervalType | undefined = h.schedule?.intervalType;
  if (!intervalType) {
    // устаревшее поведение: выполняется каждый день, если дни не указаны
    if (!isHabitV2(habit)) {
      if (!habit.days || habit.days.length === 0) return true;
      const weekday = date.toLocaleString('ru-RU', { weekday: 'long' }) as Day;
      return habit.days.includes(weekday);
    }
    return true;
  }

  if (intervalType === 'days_of_week') {
    const weekday = date.toLocaleString('ru-RU', { weekday: 'long' }) as Day;
    return !h.schedule?.days || h.schedule.days.length === 0 || h.schedule.days.includes(weekday);
  }

  if (intervalType === 'every_n_days') {
    const start = h.schedule?.startDate ? new Date(h.schedule.startDate) : undefined;
    if (!start || !h.schedule?.everyNDays) return true;
    const diff = differenceInCalendarDays(date, start);
    return diff >= 0 && diff % h.schedule.everyNDays === 0;
  }

  if (intervalType === 'n_per_week') {
    // базовая аппроксимация: если указаны preferredDays, выполняется в эти дни; иначе предполагается каждый день как кандидат
    if (h.schedule?.preferredDays && h.schedule.preferredDays.length > 0) {
      const weekday = date.toLocaleString('ru-RU', { weekday: 'long' }) as Day;
      return h.schedule.preferredDays.includes(weekday);
    }
    return true;
  }

  // custom/cron - до реализации считать, что выполняется всегда
  return true;
}

/**
 * Проверяет, должна ли привычка выполняться сейчас.
 * @param {Habit} habit - Привычка.
 * @param {Date} [date=new Date()] - Дата для проверки.
 * @returns {boolean} - true, если привычка должна выполняться сейчас.
 */
export function isHabitDueNow(habit: Habit, date: Date = new Date()): boolean {
  const h: HabitV2 = isHabitV2(habit) ? habit : toHabitV2(habit);
  if (!isHabitDueToday(h, date)) return false;
  return isWithinTimeWindow(date, h.schedule?.timeWindow);
}

/**
 * Форматирует цель привычки в строку.
 * @param {Habit} habit - Привычка.
 * @returns {string | null} - Отформатированная цель или null.
 */
export function formatHabitTarget(habit: Habit): string | null {
  if (!isHabitV2(habit)) {
    // Устаревшая версия: используем поле goal
    return habit.goal || null;
  }
  const target = habit.target;
  if (!target) return null;
  if (target.type === 'quantity') {
    const v = target.value;
    const u = target.unit || '';
    if (typeof v === 'number') return `${v}${u ? ' ' + u : ''}`;
  }
  if (target.type === 'duration') {
    const v = target.value;
    const u = target.unit || 'мин';
    if (typeof v === 'number') return `${v} ${u}`;
  }
  return null;
}

// ===============================
// Вспомогательные функции аналитики (чистые)
// ===============================

/**
 * Вычисляет процент выполнения.
 * @param {HabitLog[]} logs - Массив логов привычек.
 * @param {Date} from - Начальная дата.
 * @param {Date} to - Конечная дата.
 * @returns {number} - Процент выполнения.
 */
export function computeCompletionRate(logs: HabitLog[], from: Date, to: Date): number {
  const inRange = logs.filter(l => {
    const d = new Date(l.date);
    return d >= from && d <= to;
  });
  if (inRange.length === 0) return 0;
  const completed = inRange.filter(l => l.status === 'done').length;
  return (completed / inRange.length) * 100;
}

/**
 * Вычисляет оценку постоянства.
 * @param {HabitLog[]} logs - Массив логов привычек.
 * @param {Date} from - Начальная дата.
 * @param {Date} to - Конечная дата.
 * @returns {number} - Оценка постоянства (0-100).
 */
export function computeConsistencyScore(logs: HabitLog[], from: Date, to: Date): number {
  // Постоянство: меньшая дисперсия по дням недели означает большее постоянство. Возвращает 0..100, где 100 - очень постоянно.
  const byWeekday: Record<number, { total: number; done: number }> = { 0:{total:0,done:0},1:{total:0,done:0},2:{total:0,done:0},3:{total:0,done:0},4:{total:0,done:0},5:{total:0,done:0},6:{total:0,done:0} };
  const inRange = logs.filter(l => {
    const d = new Date(l.date);
    return d >= from && d <= to;
  });
  if (inRange.length === 0) return 0;
  inRange.forEach(l => {
    const d = new Date(l.date);
    const wd = d.getDay();
    byWeekday[wd].total += 1;
    if (l.status === 'done') byWeekday[wd].done += 1;
  });
  const rates: number[] = [];
  for (let wd = 0; wd < 7; wd++) {
    const bucket = byWeekday[wd];
    if (bucket.total > 0) rates.push(bucket.done / bucket.total);
  }
  if (rates.length === 0) return 0;
  const avg = rates.reduce((a,b)=>a+b,0) / rates.length;
  const variance = rates.reduce((s,v)=> s + Math.pow(v - avg, 2), 0) / rates.length;
  const std = Math.sqrt(variance); // обычно в диапазоне 0..1
  // Отображаем std (0..0.5+) обратно в 0..100, с ограничением
  const mapped = Math.max(0, Math.min(100, (1 - Math.min(std, 0.5) / 0.5) * 100));
  return mapped;
}

/**
 * Вычисляет оценку силы привычки.
 * @param {object} params - Параметры для вычисления.
 * @param {number} params.currentStreak - Текущая серия (дни).
 * @param {number} params.longestStreak - Самая длинная серия (дни).
 * @param {number} params.completionRate90d - Процент выполнения за 90 дней (0-100).
 * @param {number} params.consistencyScore - Оценка постоянства (0-100).
 * @returns {number} - Оценка силы привычки (0-100).
 */
export function calculateHabitStrengthScore(params: {
  currentStreak: number;
  longestStreak: number;
  completionRate90d: number;
  consistencyScore: number;
}): number {
  const currentStreakFactor = Math.min(params.currentStreak / 30, 1);
  const longestStreakFactor = Math.min(params.longestStreak / 100, 1);
  const completionFactor = Math.max(0, Math.min(params.completionRate90d / 100, 1));
  const consistencyFactor = Math.max(0, Math.min(params.consistencyScore / 100, 1));

  const score = (
    0.3 * currentStreakFactor +
    0.4 * completionFactor +
    0.2 * consistencyFactor +
    0.1 * longestStreakFactor
  ) * 100;
  return Math.round(score);
}

// ===============================
// Вспомогательные функции для серий (чистые)
// ===============================

/**
 * Вычисляет серию из логов.
 * @param {HabitLog[]} logs - Массив логов привычек.
 * @returns {{ current: number; longest: number; lastCompletedDate?: string }} - Текущая и самая длинная серии.
 */
export function computeStreakFromLogs(logs: HabitLog[]): { current: number; longest: number; lastCompletedDate?: string } {
  const sorted = [...logs].filter(l => !!l.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let current = 0;
  let longest = 0;
  let lastCompletedDate: string | undefined;
  let prevDate: Date | undefined;
  for (const l of sorted) {
    if (l.status === 'done') {
      const d = new Date(l.date);
      if (!prevDate) {
        current = 1;
      } else {
        const diff = differenceInCalendarDays(d, prevDate);
        if (diff === 1) {
          current += 1;
        } else if (diff > 1) {
          current = 1;
        }
      }
      prevDate = new Date(l.date);
      lastCompletedDate = l.date;
      if (current > longest) longest = current;
    }
  }
  return { current, longest, lastCompletedDate };
}

/**
 * Обновляет серию на основе нового лога.
 * @param {HabitStreak | undefined} streak - Текущая серия.
 * @param {HabitLog} log - Новый лог.
 * @returns {HabitStreak} - Обновленная серия.
 */
export function updateStreakOnLog(streak: HabitStreak | undefined, log: HabitLog): HabitStreak {
  const s: HabitStreak = streak || { habitId: log.habitId, current: 0, longest: 0 };
  if (log.status === 'done') {
    const today = new Date(log.date);
    const last = s.lastCompletedDate ? new Date(s.lastCompletedDate) : undefined;
    if (!last) {
      s.current = 1;
    } else {
      const diff = differenceInCalendarDays(today, last);
      if (diff === 1) s.current += 1;
      else if (diff > 1) s.current = 1;
    }
    s.lastCompletedDate = log.date;
    if (s.current > s.longest) s.longest = s.current;
  } else if (log.status === 'skipped') {
    // пропуск без токена может прервать серию извне; здесь не уменьшаем
  }
  return { ...s };
}

/**
 * Применяет токен пропуска к серии.
 * @param {HabitStreak} streak - Текущая серия.
 * @param {number} availableTokens - Доступные токены.
 * @returns {{ updated: HabitStreak; tokensLeft: number }} - Обновленная серия и оставшиеся токены.
 */
export function applySkipToken(streak: HabitStreak, availableTokens: number): { updated: HabitStreak; tokensLeft: number } {
  if (availableTokens <= 0) return { updated: streak, tokensLeft: 0 };
  const tokensLeft = availableTokens - 1;
  // Намеренно сохраняем streak.current неизменным
  return { updated: { ...streak }, tokensLeft };
}

/**
 * Замораживает серию до указанной даты.
 * @param {HabitStreak} streak - Текущая серия.
 * @param {string} untilDateISO - Дата в формате ISO.
 * @returns {HabitStreak} - Обновленная серия.
 */
export function freezeStreak(streak: HabitStreak, untilDateISO: string): HabitStreak {
  return { ...streak, frozenUntil: untilDateISO };
}
