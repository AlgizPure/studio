'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, loading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, loading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const [today, setToday] = useState<Day | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  const handleToggleCompletion = (habit: Habit) => {
    if (!user || !firestore || !habit.id) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = { completed: !habit.completed };
    updateDoc(habitDoc, updatedData).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: updatedData,
      }));
    });
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    addDoc(habitsCollection, newHabit).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: habitsCollection.path,
        requestResourceData: newHabit,
      }));
    });
  };

  const handleAddCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/habitCategories`);
    addDoc(catCollection, { name }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      }));
    });
  };

  const handleUpdateCategory = (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      }));
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, categoryId);
    deleteDoc(catDoc).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
      }));
    });
  };

  const todaysHabits = useMemo(() => {
    if (!today || !trackedHabits) return [];
    return trackedHabits.filter(habit => {
      return !habit.days || habit.days.length === 0 || habit.days.includes(today);
    });
  }, [trackedHabits, today]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits]);
  
  const isLoading = habitsLoading || categoriesLoading;

  return (
      <>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Daily Habits</CardTitle>
            <AddHabitDialog onHabitAdd={handleAddHabit} openManageCategories={() => setIsManageCategoriesOpen(true)} categories={habitCategories || []} />
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sortedHabits.map((habit) => {
              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all",
                    habit.completed && "opacity-50"
                  )}
                >
                  <Checkbox 
                    id={habit.id} 
                    checked={!!habit.completed}
                    onCheckedChange={() => handleToggleCompletion(habit)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={habit.id} 
                      className={cn(
                        "font-medium cursor-pointer",
                        habit.completed && "line-through"
                      )}
                    >
                      {habit.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{habit.goal}</p>
                  </div>
                  {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={!!habit.completed} />}
                </div>
              );
            })}
             {!isLoading && sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <ManageCategoriesDialog 
            open={isManageCategoriesOpen} 
            onOpenChange={setIsManageCategoriesOpen} 
            categories={habitCategories || []}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            categoryType="Habit"
        />
    </>
  );
}
