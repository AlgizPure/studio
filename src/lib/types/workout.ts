import type { Cycle } from './program';
import type { Day } from './common';

export type Workout = {
  id: string;
  name:string;
  description: string;
  level?: number;
  exercises?: { exerciseId: string; sets?: number; reps?: number; duration?: string }[];
};

// Расширенная структура Workout (совместима с существующей)
export type WorkoutExtended = Omit<Workout, 'exercises'> & {
  targetMuscles?: string[]; // ['chest', 'triceps', 'shoulders']
  estimatedDuration?: number; // минуты (вычисляется: сумма plannedDuration всех упражнений)
  cycles?: Cycle[]; // НОВОЕ: массив циклов

  // Статус и расписание для самодостаточных тренировок
  status: 'active' | 'inactive'; // активная = в расписании
  isStandalone?: boolean; // галочка "самостоятельная"
  standaloneSchedule?: {
    days: Day[];
    startTime?: string; // 'HH:MM' - появляется при isStandalone = true
  };
  isHabit?: boolean; // галочка "привычка" - попадает в список привычек
};
