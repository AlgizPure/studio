'use client';

import { useState } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DailySchedule } from '@/components/daily-schedule';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Exercise, Habit, HabitCategory, ExerciseCategory } from '@/lib/types';
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

  const habitCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: habitCatLoading } = useCollection<HabitCategory>(habitCatQuery);
  
  const exerciseCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null),
    [user, firestore]
  );
  const { data: exerciseCategories, isLoading: exerciseCatLoading } = useCollection<ExerciseCategory>(exerciseCatQuery);


  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);
  
  const isLoading = exercisesLoading || habitsLoading || habitCatLoading || exerciseCatLoading;

  // Exercise CRUD
  const handleAddExercise = (exerciseData: Omit<Exercise, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const exercisesCollection = collection(firestore, `users/${user.uid}/exercises`);
    const dataToSave = { ...exerciseData, authorId: user.uid };
    addDoc(exercisesCollection, dataToSave).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: exercisesCollection.path,
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateExercise = (exercise: Exercise) => {
    if (!user || !firestore || !exercise.id) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
    const { id, ...exerciseData } = exercise;
    updateDoc(exerciseDoc, exerciseData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: exerciseDoc.path,
        requestResourceData: exerciseData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!user || !firestore) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exerciseId);
    deleteDoc(exerciseDoc).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: exerciseDoc.path,
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };
  
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
  
  const handleAddExerciseCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/exerciseCategories`);
    addDoc(catCollection, { name }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };
  const handleUpdateExerciseCategory = (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  const handleDeleteExerciseCategory = (categoryId: string) => {
     if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId);
    deleteDoc(catDoc).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
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
              <AddExerciseDialog 
                onExerciseAdd={handleAddExercise}
                categories={exerciseCategories || []}
                openManageCategories={() => setIsManageExerciseCategoriesOpen(true)}
                trigger={<Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" />Exercise</Button>}
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
              exercises={exercises || []}
              habits={habits || []} 
              habitCategories={habitCategories || []}
              exerciseCategories={exerciseCategories || []}
              onExerciseAdd={handleAddExercise} 
              onHabitAdd={handleAddHabit}
              onExerciseUpdate={handleUpdateExercise}
              onHabitUpdate={handleUpdateHabit}
              onExerciseDelete={handleDeleteExercise}
              onHabitDelete={handleDeleteHabit}
              openManageHabitCategories={() => setIsManageHabitCategoriesOpen(true)}
              openManageExerciseCategories={() => setIsManageExerciseCategoriesOpen(true)}
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
      <ManageCategoriesDialog 
        open={isManageExerciseCategoriesOpen} 
        onOpenChange={setIsManageExerciseCategoriesOpen}
        categories={exerciseCategories || []}
        onAdd={handleAddExerciseCategory}
        onUpdate={handleUpdateExerciseCategory}
        onDelete={handleDeleteExerciseCategory}
        categoryType="Exercise"
      />
    </>
  );
}
