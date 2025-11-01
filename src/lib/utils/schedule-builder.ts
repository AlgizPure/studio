import type { Program, ProgramWorkout, WorkoutExtended, Day } from '@/lib/types';
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';

export interface ScheduledWorkoutItem {
  workoutId: string;
  programId?: string;
  startTime?: string; // 'HH:MM'
  status: 'active' | 'paused'; // paused если программа на паузе
  workoutName?: string;
}

/**
 * Проверяет, должна ли тренировка появиться в расписании на указанный день
 */
function shouldAppearOnDay(
  schedule: ProgramWorkout['schedule'],
  day: Day,
  programStartDate: string,
  targetDate: Date
): boolean {
  const { intervalType, intervalValue, startOffset } = schedule;
  
  if (intervalType === 'days_of_week') {
    if (!Array.isArray(intervalValue)) return false;
    return intervalValue.includes(day);
  }
  
  if (intervalType === 'every_n_days') {
    if (typeof intervalValue !== 'number') return false;
    const startDate = addDays(parseISO(programStartDate), startOffset);
    const diff = differenceInCalendarDays(targetDate, startDate);
    return diff >= 0 && diff % intervalValue === 0;
  }
  
  return false;
}

/**
 * Строит расписание тренировок на указанную дату
 * из активных программ и самодостаточных тренировок
 */
export function buildDailySchedule(
  programs: Program[],
  standaloneWorkouts: WorkoutExtended[],
  date: Date
): ScheduledWorkoutItem[] {
  const items: ScheduledWorkoutItem[] = [];
  // Получаем день недели в формате 'Monday', 'Tuesday', etc.
  const day = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
  
  // Тренировки из программ
  programs.forEach(program => {
    // Только активные или на паузе программы участвуют в расписании
    if (program.status !== 'active' && program.status !== 'paused') {
      return;
    }
    
    program.workouts.forEach((pw: ProgramWorkout) => {
      if (shouldAppearOnDay(pw.schedule, day, program.startDate, date)) {
        items.push({
          workoutId: pw.workoutId,
          programId: program.id,
          startTime: pw.schedule.startTime,
          status: program.status === 'paused' ? 'paused' : 'active',
        });
      }
    });
  });
  
  // Самодостаточные тренировки
  standaloneWorkouts
    .filter(w => 
      w.status === 'active' && 
      w.isStandalone && 
      w.standaloneSchedule?.days.includes(day)
    )
    .forEach(workout => {
      items.push({
        workoutId: workout.id,
        startTime: workout.standaloneSchedule?.startTime,
        status: 'active',
      });
    });
  
  // Сортировка по времени начала
  return items.sort((a, b) => {
    // Тренировки без времени идут в конец
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });
}

/**
 * Проверяет, является ли тренировка запланированной на указанную дату
 */
export function isWorkoutScheduledOnDate(
  workoutId: string,
  programs: Program[],
  standaloneWorkouts: WorkoutExtended[],
  date: Date
): boolean {
  const scheduled = buildDailySchedule(programs, standaloneWorkouts, date);
  return scheduled.some(item => item.workoutId === workoutId);
}

