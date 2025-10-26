'use client';

import { useState } from 'react';
import { DailySchedule } from '@/components/daily-schedule';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Exercise, Habit } from '@/lib/types';
import { exercises as initialExercises, habits as initialHabits } from '@/lib/data';

export default function SchedulePage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const handleAddExercise = (newExercise: Exercise) => {
    setExercises((prev) => [...prev, newExercise]);
  };

  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prev) => [...prev, newHabit]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Weekly Schedule
          </h1>
          <p className="text-muted-foreground">
            Your plan for the entire week.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <AddHabitDialog onHabitAdd={handleAddHabit} />
            <AddExerciseDialog onExerciseAdd={handleAddExercise} />
        </div>
      </div>
      <DailySchedule exercises={exercises} habits={habits} />
    </div>
  );
}
