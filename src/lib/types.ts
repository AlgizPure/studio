import type { LucideIcon } from "lucide-react";

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type ExerciseParameter = {
  id: string; // e.g., 'distance'
  name: string; // e.g., 'Distance'
  unit: string; // e.g., 'km'
  defaultValue: number;
}

export type ExerciseCategory = {
  id: string;
  name: string;
  authorId?: string;
}

export type Exercise = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  image: string;
  custom?: boolean;
  time?: string;
  days?: Day[];
  authorId?: string;
  lastCompleted?: string; // ISO date string
  distance?: number; // in kilometers
  parameters?: ExerciseParameter[];
};

export type ExerciseLog = {
    id: string;
    exerciseId: string;
    userId: string;
    date: string; // ISO date string YYYY-MM-DD
    values: {
      [parameterId: string]: number;
    }
}

export type Workout = {
  id: string;
  name:string;
  description: string;
  level?: number;
  exercises?: { exerciseId: string; sets?: number; reps?: number; duration?: string }[];
};

export type HabitCategory = {
  id: string;
  name: string;
  authorId?: string;
}

export type Habit = {
  id: string;
  name: string;
  categoryId: string;
  goal?: string; // e.g., "3 lessons", "10 minutes"
  completed?: boolean;
  days?: Day[];
  pomodoro?: {
    cycles: number;
  };
  authorId?: string;
};

export type ScheduleItem = {
  id: string;
  time: string; // e.g., '06:00'
  activityType: 'Workout' | 'Run' | 'Habit';
  activityName: string;
  duration: string; // e.g., '45min'
  icon: LucideIcon;
};

export type DailySchedule = {
  day: Day;
  items: ScheduleItem[];
}

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  currentStreak?: number;
  lastActiveDate?: string | null; // ISO date string (e.g., '2024-07-26')
};

export type Program = {
    id: string;
    name: string;
    description: string;
    isTemplate: boolean;
    authorId?: string;
}

export interface ProgramWorkout extends Workout {
    schedule: {
        type: 'repeating' | 'fixed_times';
        days?: Day[];
        repeatCount?: number;
        endDate?: string;
    }
}
