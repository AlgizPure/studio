
'use client';

import { useState } from 'react';
import { DailySchedule } from '@/components/daily-schedule';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Exercise, Habit } from '@/lib/types';
import { exercises as initialExercises, habits as initialHabits } from '@/lib/data';
import { HabitList } from '@/components/habit-list';

export default function SchedulePage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const handleAddExercise = (newExercise: Exercise) => {
    setExercises((prev) => [...prev, newExercise]);
  };

  const handleUpdateExercise = (updatedExercise: Exercise) => {
    setExercises((prev) => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter(ex => ex.id !== exerciseId));
  }

  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter(h => h.id !== habitId));
  }


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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="lg:col-span-6">
          <DailySchedule 
            exercises={exercises} 
            habits={habits} 
            onExerciseAdd={handleAddExercise} 
            onHabitAdd={handleAddHabit}
            onExerciseUpdate={handleUpdateExercise}
            onHabitUpdate={handleUpdateHabit}
            onExerciseDelete={handleDeleteExercise}
            onHabitDelete={handleDeleteHabit}
            />
        </div>
        <div className="lg:col-span-4">
          <HabitList 
            habits={habits} 
            onHabitAdd={handleAddHabit}
            onHabitUpdate={handleUpdateHabit}
            onHabitDelete={handleDeleteHabit}
            setHabits={setHabits} />
        </div>
      </div>
    </div>
  );
}

    