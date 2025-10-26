
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusSquare, GripVertical } from 'lucide-react';
import { habits as initialHabits, exercises as initialExercises } from '@/lib/data';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { AddExerciseDialog } from './add-exercise-dialog';
import { AddHabitDialog } from './add-habit-dialog';
import { useState }from 'react';
import type { Exercise, Habit } from '@/lib/types';


export function PlanTomorrowDialog() {
    const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
    const [habits, setHabits] = useState<Habit[]>(initialHabits);

    const handleAddExercise = (newExercise: Exercise) => {
        setExercises(prev => [...prev, newExercise]);
    };
    
    const handleAddHabit = (newHabit: Habit) => {
        setHabits(prev => [...prev, newHabit]);
    };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusSquare className="mr-2 h-4 w-4" />
          Plan for Tomorrow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Plan for Tomorrow</DialogTitle>
          <DialogDescription>
            Select your exercises and habits for tomorrow. Your changes will be saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center pr-4">
              <h3 className="font-semibold text-lg">Exercises</h3>
               <AddExerciseDialog onExerciseAdd={handleAddExercise} />
            </div>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                     <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab" />
                    <Checkbox id={`ex-${exercise.id}`} className="mr-4" />
                    <div className="flex-1">
                      <Label htmlFor={`ex-${exercise.id}`} className="font-medium cursor-pointer">{exercise.name}</Label>
                      <p className="text-xs text-muted-foreground">{exercise.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center pr-4">
                <h3 className="font-semibold text-lg">Habits</h3>
                <AddHabitDialog onHabitAdd={handleAddHabit} />
            </div>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                {habits.map((habit) => (
                   <div key={habit.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                     <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab" />
                    <Checkbox id={`hb-${habit.id}`} className="mr-4" />
                    <div className="flex-1">
                      <Label htmlFor={`hb-${habit.id}`} className="font-medium cursor-pointer">{habit.name}</Label>
                      <p className="text-xs text-muted-foreground">{habit.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
