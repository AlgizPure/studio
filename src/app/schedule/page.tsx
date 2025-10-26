
'use client';

import { useState } from 'react';
import { DailySchedule } from '@/components/daily-schedule';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Exercise, Habit } from '@/lib/types';
import { exercises as initialExercises, habits as initialHabits } from '@/lib/data';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SchedulePage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

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
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Weekly Activities
            </h1>
            <p className="text-muted-foreground">
              Your plan for the entire week.
            </p>
          </div>
          <div className="flex items-center space-x-2">
              <AddHabitDialog 
                onHabitAdd={handleAddHabit} 
                openManageCategories={() => setIsManageCategoriesOpen(true)}
                trigger={<Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" />Habit</Button>}
                 />
              <AddExerciseDialog 
                onExerciseAdd={handleAddExercise}
                trigger={<Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" />Exercise</Button>}
                />
          </div>
        </div>
        <div className="space-y-6">
          <DailySchedule 
            exercises={exercises} 
            habits={habits} 
            onExerciseAdd={handleAddExercise} 
            onHabitAdd={handleAddHabit}
            onExerciseUpdate={handleUpdateExercise}
            onHabitUpdate={handleUpdateHabit}
            onExerciseDelete={handleDeleteExercise}
            onHabitDelete={handleDeleteHabit}
            openManageCategories={() => setIsManageCategoriesOpen(true)}
          />
        </div>
      </div>
      <ManageCategoriesDialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen} />
    </>
  );
}
