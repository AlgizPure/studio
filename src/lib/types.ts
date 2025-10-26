
import type { LucideIcon } from "lucide-react";

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type Exercise = {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Bio-dynamics' | 'TRX' | 'Bodyweight' | 'Static';
  description: string;
  image: string;
  custom?: boolean;
  time?: string;
  days?: Day[];
};

export type Workout = {
  id: string;
  name:string;
  exercises: { exerciseId: string; sets?: number; reps?: number; duration?: string }[];
};

export type Habit = {
  id: string;
  name: string;
  icon: LucideIcon;
  goal?: string; // e.g., "3 lessons", "10 minutes"
  completed: boolean;
  days?: Day[];
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
  name: string;
  email: string;
  avatarUrl: string;
};
