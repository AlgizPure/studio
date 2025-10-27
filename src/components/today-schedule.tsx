'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Exercise, Habit, Day, ExerciseLog } from '@/lib/types';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { isToday, formatISO } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { LogExerciseDialog } from './log-exercise-dialog';
import { Skeleton } from './ui/skeleton';

export function TodaySchedule() {
  const [today, setToday] = useState<Day | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  
  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises, isLoading: exercisesLoading } = useCollection<Exercise>(exercisesQuery);
  
  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const exerciseLogsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseLogs`) : null),
    [user, firestore]
  );
  const { data: exerciseLogs, isLoading: logsLoading } = useCollection<ExerciseLog>(exerciseLogsQuery);


  useEffect(() => {
    const todayString = new Date().toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(todayString);
  }, []);
  
  const handleHabitToggle = (habit: Habit) => {
    if (!user || !firestore || !habit.id) return;
    const newCompletedStatus = !habit.completed;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = { completed: newCompletedStatus };
    updateDoc(habitDoc, updatedData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleExerciseToggle = (exercise: Exercise) => {
      if (!user || !firestore || !exercise.id) return;
      const isCompletedToday = exercise.lastCompleted && isToday(new Date(exercise.lastCompleted));
      const newLastCompleted = isCompletedToday ? null : new Date().toISOString();

      const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
      const updatedData = {
          lastCompleted: newLastCompleted,
      };
      
      updateDoc(exerciseDoc, updatedData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          operation: 'update',
          path: exerciseDoc.path,
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleLogExercise = (exercise: Exercise, values: { [key: string]: number }) => {
    if (!user || !firestore || !exercise.id) return;
    const logsCollection = collection(firestore, `users/${user.uid}/exerciseLogs`);
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
    const todayStr = formatISO(new Date(), { representation: 'date' });
    
    addDoc(logsCollection, {
      exerciseId: exercise.id,
      userId: user.uid,
      date: todayStr,
      values,
    }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: logsCollection.path,
        requestResourceData: { exerciseId: exercise.id, date: todayStr, values },
      });
       errorEmitter.emit('permission-error', permissionError);
    });

    updateDoc(exerciseDoc, { lastCompleted: new Date().toISOString() }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: exerciseDoc.path,
        requestResourceData: { lastCompleted: new Date().toISOString() },
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };

  const dailyHabits = (habits || []).filter(habit => habit.days?.includes(today as Day));
  const dailyExercises = (exercises || []).filter(ex => ex.days?.includes(today as Day));

  const allItems = [
    ...dailyHabits.map(habit => ({
      id: habit.id,
      time: 'Any time',
      activityType: 'Habit' as const,
      activityName: habit.name,
      duration: habit.goal || '',
      icon: Target,
      raw: habit,
      completed: !!habit.completed,
      onToggle: () => handleHabitToggle(habit),
      hasParameters: false,
    })),
    ...dailyExercises.map(ex => {
       const hasParams = !!ex.parameters && ex.parameters.length > 0;
       const isCompleted = ex.lastCompleted ? isToday(new Date(ex.lastCompleted)) : false;
       return {
        id: ex.id,
        time: ex.time || 'Any time',
        activityType: 'Workout' as const,
        activityName: ex.name,
        duration: 'Exercise',
        icon: Dumbbell,
        raw: ex,
        completed: isCompleted,
        onToggle: () => handleExerciseToggle(ex),
        hasParameters: hasParams,
      }
    })
  ].sort((a, b) => {
    const aTime = (a.time || '99:99').split(' ')[0];
    const bTime = (b.time || '99:99').split(' ')[0];
    if (aTime < bTime) return -1;
    if (aTime > bTime) return 1;
    return 0;
  });

  const isLoading = exercisesLoading || habitsLoading || logsLoading;


  if (isLoading || !today) {
    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle>Today's Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Today's Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item) => {
              const Icon = item.icon as LucideIcon;
              const itemId = `today-${item.id}`;
              return (
                <div key={item.id} className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  {item.activityType === 'Workout' && item.hasParameters ? (
                     <LogExerciseDialog
                        exercise={item.raw as Exercise}
                        onLog={handleLogExercise}
                        isCompleted={item.completed}
                      />
                  ) : (
                    <Checkbox 
                        id={itemId} 
                        className="mr-4" 
                        checked={item.completed}
                        onCheckedChange={() => item.onToggle()}
                    />
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={itemId} className="font-semibold cursor-pointer">{item.activityName}</Label>
                    <p className="text-sm text-muted-foreground">{item.time} &middot; {item.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Rest day. Well deserved!</p>
        )}
      </CardContent>
    </Card>
  );
}
