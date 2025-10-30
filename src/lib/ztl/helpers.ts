import { addDays, formatISO, isAfter, isBefore } from 'date-fns';
import type { Program } from '@/lib/ztl/types';

export function programToZTL(program: Program) {
  // Minimal conversion from app Program to ZTL-like shape
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
      days: ['monday', 'wednesday', 'friday'], // fallback; real mapping depends on ProgramWorkout.schedule
    },
    workouts: [],
  };
}

/**
 * Генерирует список запланированных тренировок на N дней вперёд из программы.
 * Учитывает schedule.intervalType (days_of_week, every_n_days), startDate, duration. 
 * Если есть "phases", отмечает текущую фазу (будущее: переключение фаз).
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

  // Gather all program workouts with their schedule
  let allScheduled: Array<{date: string; workoutName: string; exercises: string[]; plannedVolume?: number; phase?: string}> = [];

  for (const programWorkout of program.workouts || []) {
    // Get schedule
    const sched = programWorkout.schedule;
    if (!sched) continue;
    // Find the template Workout for details
    const tmpl = null; // TODO: you could look up actual Workout by workoutId if available.
    const workoutName = (tmpl && tmpl.name) || programWorkout.workoutId || 'Workout';
    // TODO: phase-aware logic can go here
    let current = new Date(startDate);
    let dayIndexes = Array.isArray(sched.intervalValue) ? sched.intervalValue.map(d => (typeof d === 'string' ? d.toLowerCase() : d)) : [];

    if (sched.intervalType === 'days_of_week' && Array.isArray(sched.intervalValue)) {
      // Map like ['monday','wednesday']
      while (isBefore(current, endDate)) {
        // Weekday as string (monday, tuesday...)
        const weekday = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (dayIndexes.includes(weekday)) {
          const dISO = formatISO(current, { representation: 'date' });
          allScheduled.push({ date: dISO, workoutName, exercises: ['...'], plannedVolume: undefined });
        }
        current = addDays(current, 1);
      }
    } else if (sched.intervalType === 'every_n_days' && typeof sched.intervalValue === 'number') {
      // Start from startDate, add every N days
      while (isBefore(current, endDate)) {
        const dISO = formatISO(current, { representation: 'date' });
        allScheduled.push({ date: dISO, workoutName, exercises: ['...'], plannedVolume: undefined });
        current = addDays(current, sched.intervalValue);
      }
    }
    // Additional types (custom) can be added here
  }
  // Sort by date, concat, take N unique entries
  allScheduled.sort((a, b) => a.date.localeCompare(b.date));
  // Remove duplicates (same date): merge by concatenating workout names/exercises (optional enhancement).
  const uniqueByDate: Record<string, typeof allScheduled[0]> = {};
  for (const w of allScheduled) {
    if (!uniqueByDate[w.date]) {
      uniqueByDate[w.date] = w;
    } else {
      // Merge workouts on same day
      uniqueByDate[w.date].workoutName += ' / ' + w.workoutName;
    }
  }
  let arr = Object.values(uniqueByDate);
  // Only take in future window
  arr = arr.filter(e => isAfter(new Date(e.date), new Date()) || formatISO(new Date(), { representation:'date' }) === e.date ).slice(0, daysForward);
  return arr.map(r => ({
    ...r,
    status: 'Upcoming' as const
  }));
}

export function calculateCurrentWeek(program: Program) {
  const start = new Date(program.startDate);
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
}

export function formatVolume(n?: number) {
  if (!n && n !== 0) return '';
  return `${Math.round(n)} kg`;
}

export function formatDuration(min?: number) {
  if (!min && min !== 0) return '';
  return `${min} min`;
}



