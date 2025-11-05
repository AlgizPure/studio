import { addDays, formatISO, isAfter, isBefore } from 'date-fns';
import type { Program } from '@/lib/ztl/types';

/**
 * @fileoverview Вспомогательные функции для работы с ZTL (Zenith Training Language).
 * Включает преобразование программ, генерацию расписаний и форматирование данных.
 */

/**
 * Преобразует объект Program приложения в ZTL-подобную структуру.
 * @param {Program} program - Объект программы приложения.
 * @returns {object} ZTL-подобный объект с метаданными и базовым расписанием.
 */
export function programToZTL(program: Program) {
  // Минимальное преобразование из Program приложения в ZTL-подобную форму
  return {
    meta: {
      version: '1.0',
      id: program.id,
      name: program.name,
      author: undefined,
      goal: (program.goal as any) || undefined,
      duration: program.durationType === 'fixed' ? { weeks: Math.max(1, Math.ceil((program.workouts?.[0]?.schedule?.duration?.value || 8) / 1)) } : undefined,
      tags: program.tags,
    },
    schedule: {
      pattern: 'days_of_week' as const,
      days: ['monday', 'wednesday', 'friday'], // запасной вариант; реальное сопоставление зависит от ProgramWorkout.schedule
    },
    workouts: [],
  };
}

/**
 * Генерирует список запланированных тренировок на N дней вперёд из программы.
 * Учитывает schedule.intervalType (days_of_week, every_n_days), startDate, duration.
 * Если есть "phases", отмечает текущую фазу (будущее: переключение фаз).
 * @param {Program} program - Объект программы.
 * @param {number} daysForward - Количество дней для генерации расписания.
 * @returns {Array<object>} Массив объектов запланированных тренировок.
 */
export function generateScheduledWorkouts(program: Program, daysForward: number) {
  const results: Array<{
    date: string;
    workoutName: string;
    exercises: string[];
    plannedVolume?: number;
    phase?: string;
    status: 'Upcoming' | 'Planned';
  }> = [];
  if (!program.startDate) return results;
  const startDate = new Date(program.startDate);
  const endDate = program.endDate ? new Date(program.endDate) : addDays(startDate, daysForward);

  // Собрать все тренировки программы с их расписанием
  let allScheduled: Array<{date: string; workoutName: string; exercises: string[]; plannedVolume?: number; phase?: string}> = [];

  for (const programWorkout of program.workouts || []) {
    // Получить расписание
    const sched = programWorkout.schedule;
    if (!sched) continue;
    // Найти шаблон тренировки для деталей
    // В этой минимальной реализации используется workoutId как имя; при наличии интегрировать поиск
    const workoutName = programWorkout.workoutId || 'Workout';
    // TODO: здесь может быть логика, учитывающая фазы
    let current = new Date(startDate);
    let dayIndexes = Array.isArray(sched.intervalValue) ? sched.intervalValue.map(d => (typeof d === 'string' ? d.toLowerCase() : d)) : [];

    if (sched.intervalType === 'days_of_week' && Array.isArray(sched.intervalValue)) {
      // Сопоставление типа ['monday','wednesday']
      while (isBefore(current, endDate)) {
        // День недели как строка (monday, tuesday...)
        const weekday = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (dayIndexes.includes(weekday)) {
          const dISO = formatISO(current, { representation: 'date' });
          allScheduled.push({ date: dISO, workoutName, exercises: ['...'], plannedVolume: undefined });
        }
        current = addDays(current, 1);
      }
    } else if (sched.intervalType === 'every_n_days' && typeof sched.intervalValue === 'number') {
      // Начиная с startDate, добавлять каждые N дней
      while (isBefore(current, endDate)) {
        const dISO = formatISO(current, { representation: 'date' });
        allScheduled.push({ date: dISO, workoutName, exercises: ['...'], plannedVolume: undefined });
        current = addDays(current, sched.intervalValue);
      }
    }
    // Здесь можно добавить дополнительные типы (пользовательские)
  }
  // Сортировка по дате, объединение, выбор N уникальных записей
  allScheduled.sort((a, b) => a.date.localeCompare(b.date));
  // Удаление дубликатов (та же дата): объединение путем конкатенации названий/упражнений тренировок (опциональное улучшение).
  const uniqueByDate: Record<string, typeof allScheduled[0]> = {};
  for (const w of allScheduled) {
    if (!uniqueByDate[w.date]) {
      uniqueByDate[w.date] = w;
    } else {
      // Объединение тренировок в один день
      uniqueByDate[w.date].workoutName += ' / ' + w.workoutName;
    }
  }
  let arr = Object.values(uniqueByDate);
  // Выбирать только в будущем окне
  arr = arr.filter(e => isAfter(new Date(e.date), new Date()) || formatISO(new Date(), { representation:'date' }) === e.date ).slice(0, daysForward);
  return arr.map(r => ({
    ...r,
    status: 'Upcoming' as const
  }));
}

/**
 * Вычисляет текущую неделю выполнения программы.
 * @param {Program} program - Объект программы с датой начала.
 * @returns {number} Номер текущей недели (минимум 1).
 */
export function calculateCurrentWeek(program: Program) {
  const start = new Date(program.startDate);
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
}

/**
 * Форматирует числовое значение объема в строку с единицами измерения (кг).
 * @param {number} [n] - Числовое значение объема.
 * @returns {string} Отформатированная строка или пустая строка, если значение не предоставлено.
 */
export function formatVolume(n?: number) {
  if (!n && n !== 0) return '';
  return `${Math.round(n)} kg`;
}

/**
 * Форматирует числовое значение длительности в строку с единицами измерения (мин).
 * @param {number} [min] - Числовое значение длительности в минутах.
 * @returns {string} Отформатированная строка или пустая строка, если значение не предоставлено.
 */
export function formatDuration(min?: number) {
  if (!min && min !== 0) return '';
  return `${min} min`;
}
