'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DailySchedule } from '@/components/daily-schedule';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Habit, HabitCategory, Program, WorkoutExtended } from '@/lib/types';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Data fetching from Firestore
  const programsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/programs`) : null),
    [user, firestore]
  );
  const { data: programs, isLoading: programsLoading } = useCollection<Program>(programsQuery);

  const workoutsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/workouts`) : null),
    [user, firestore]
  );
  const { data: workouts, isLoading: workoutsLoading } = useCollection<WorkoutExtended>(workoutsQuery);

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);

  const habitCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: habitCatLoading } = useCollection<HabitCategory>(habitCatQuery);
  
  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  
  const isLoading = programsLoading || workoutsLoading || habitsLoading || habitCatLoading;

  
  // Habit CRUD
  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    const dataToSave = { ...habitData, authorId: user.uid };
    addDoc(habitsCollection, dataToSave).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: habitsCollection.path,
        requestResourceData: dataToSave,
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateHabit = (habit: Habit) => {
     if (!user || !firestore || !habit.id) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const { id, ...habitData } = habit;
    updateDoc(habitDoc, habitData).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: habitData,
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!user || !firestore) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habitId);
    deleteDoc(habitDoc).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: habitDoc.path,
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  // Category CRUD
  const handleAddHabitCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/habitCategories`);
    addDoc(catCollection, { name }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };
  const handleUpdateHabitCategory = (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  const handleDeleteHabitCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, categoryId);
    deleteDoc(catDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Weekly Activities
            </h1>
            <p className="text-muted-foreground">
              Your plan for the entire week.
            </p>
          </div>
          <div className="flex items-center space-x-2">
              <AddHabitDialog 
                onHabitAdd={handleAddHabit} 
                categories={habitCategories || []}
                openManageCategories={() => setIsManageHabitCategoriesOpen(true)}
                trigger={<Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" />Habit</Button>}
                 />
          </div>
        </div>
        <div className="space-y-6">
          {isLoading ? (
            <Card className="glass">
              <CardHeader>
                  <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : (
            <DailySchedule
              programs={programs || undefined}
              workouts={workouts || undefined}
              habits={habits || []}
              habitCategories={habitCategories || []}
              openManageHabitCategories={() => setIsManageHabitCategoriesOpen(true)}
            />
          )}
        </div>
      </div>
      <ManageCategoriesDialog 
        open={isManageHabitCategoriesOpen} 
        onOpenChange={setIsManageHabitCategoriesOpen} 
        categories={habitCategories || []}
        onAdd={handleAddHabitCategory}
        onUpdate={handleUpdateHabitCategory}
        onDelete={handleDeleteHabitCategory}
        categoryType="Habit"
      />
    </>
  );
}
