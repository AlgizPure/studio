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
import { PlusSquare } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useState, useMemo } from 'react';
import type { Exercise, Habit, ExerciseCategory, HabitCategory, Day } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { addDays, format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function PlanTomorrowDialog() {
    const { user } = useUser();
    const firestore = useFirestore();

    const exercisesQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
      [user, firestore]
    );
    const { data: exercises } = useCollection<Exercise>(exercisesQuery);
    
    const habitsQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
      [user, firestore]
    );
    const { data: habits } = useCollection<Habit>(habitsQuery);
    
    const exerciseCatQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null),
      [user, firestore]
    );
    const { data: exerciseCategories } = useCollection<ExerciseCategory>(exerciseCatQuery);
    
    const habitCatQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
      [user, firestore]
    );
    const { data: habitCategories } = useCollection<HabitCategory>(habitCatQuery);
    
    const tomorrow = useMemo(() => {
        const tomorrowDate = addDays(new Date(), 1);
        return format(tomorrowDate, 'EEEE') as Day;
    }, []);

    const isExerciseScheduled = (exercise: Exercise) => (exercise.days || []).includes(tomorrow);
    const isHabitScheduled = (habit: Habit) => (habit.days || []).includes(tomorrow);

    const { scheduledExercises, unscheduledExercises } = useMemo(() => {
        const scheduled = (exercises || []).filter(isExerciseScheduled);
        const unscheduled = (exercises || []).filter(ex => !isExerciseScheduled(ex));
        return { scheduledExercises: scheduled, unscheduledExercises: unscheduled };
    }, [exercises, tomorrow]);

    const { scheduledHabits, unscheduledHabits } = useMemo(() => {
        const scheduled = (habits || []).filter(isHabitScheduled);
        const unscheduled = (habits || []).filter(h => !isHabitScheduled(h));
        return { scheduledHabits: scheduled, unscheduledHabits: unscheduled };
    }, [habits, tomorrow]);


    const handleExerciseToggle = (exercise: Exercise) => {
        if (!user || !firestore || !exercise.id) return;
        const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);

        const currentDays = exercise.days || [];
        const isScheduled = currentDays.includes(tomorrow);
        
        const updatedDays = isScheduled 
            ? currentDays.filter(day => day !== tomorrow)
            : [...currentDays, tomorrow];
        
        const updatedData = { days: updatedDays };
        updateDoc(exerciseDoc, updatedData).catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            operation: 'update',
            path: exerciseDoc.path,
            requestResourceData: updatedData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }

    const handleHabitToggle = (habit: Habit) => {
        if (!user || !firestore || !habit.id) return;
        const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);

        const currentDays = habit.days || [];
        const isScheduled = currentDays.includes(tomorrow);
        
        const updatedDays = isScheduled 
            ? currentDays.filter(day => day !== tomorrow)
            : [...currentDays, tomorrow];

        const updatedData = { days: updatedDays };
        updateDoc(habitDoc, updatedData).catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            operation: 'update',
            path: habitDoc.path,
            requestResourceData: updatedData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }


  return (
    <>
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusSquare className="mr-2 h-4 w-4" />
          Plan for Tomorrow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Plan for Tomorrow ({tomorrow})</DialogTitle>
          <DialogDescription>
            Select your exercises and habits for tomorrow. Your changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Exercises</h3>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                {scheduledExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                    <Checkbox 
                        id={`ex-${exercise.id}`} 
                        className="mr-4" 
                        checked={true}
                        onCheckedChange={() => handleExerciseToggle(exercise)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`ex-${exercise.id}`} className="font-medium cursor-pointer">{exercise.name}</Label>
                      <p className="text-xs text-muted-foreground">{(exerciseCategories || []).find(c => c.id === exercise.categoryId)?.name}</p>
                    </div>
                  </div>
                ))}
                 {scheduledExercises.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nothing scheduled yet.</p>}
                <Separator className="my-4" />
                <p className="text-sm font-medium text-muted-foreground">Unscheduled</p>
                {unscheduledExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center p-3 rounded-lg border bg-card/50 opacity-70 hover:opacity-100 transition-opacity">
                    <Checkbox 
                        id={`ex-add-${exercise.id}`} 
                        className="mr-4" 
                        checked={false}
                        onCheckedChange={() => handleExerciseToggle(exercise)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`ex-add-${exercise.id}`} className="font-medium cursor-pointer">{exercise.name}</Label>
                      <p className="text-xs text-muted-foreground">{(exerciseCategories || []).find(c => c.id === exercise.categoryId)?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Habits</h3>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                 <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                {scheduledHabits.map((habit) => (
                   <div key={habit.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                    <Checkbox 
                        id={`hb-${habit.id}`} 
                        className="mr-4" 
                        checked={true}
                        onCheckedChange={() => handleHabitToggle(habit)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`hb-${habit.id}`} className="font-medium cursor-pointer">{habit.name}</Label>
                      <p className="text-xs text-muted-foreground">{habit.goal}</p>
                    </div>
                  </div>
                ))}
                {scheduledHabits.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nothing scheduled yet.</p>}
                <Separator className="my-4" />
                <p className="text-sm font-medium text-muted-foreground">Unscheduled</p>
                 {unscheduledHabits.map((habit) => (
                   <div key={habit.id} className="flex items-center p-3 rounded-lg border bg-card/50 opacity-70 hover:opacity-100 transition-opacity">
                    <Checkbox 
                        id={`hb-add-${habit.id}`} 
                        className="mr-4" 
                        checked={false}
                        onCheckedChange={() => handleHabitToggle(habit)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`hb-add-${habit.id}`} className="font-medium cursor-pointer">{habit.name}</Label>
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
    </>
  );
}
