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
import { ManageExerciseCategoriesDialog } from '@/components/manage-exercise-categories-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Data fetching from Firestore
  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises, loading: exercisesLoading } = useCollection<Exercise>(exercisesQuery);

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits, loading: habitsLoading } = useCollection<Habit>(habitsQuery);

  const habitCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, loading: habitCatLoading } = useCollection<HabitCategory>(habitCatQuery);
  
  const exerciseCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null),
    [user, firestore]
  );
  const { data: exerciseCategories, loading: exerciseCatLoading } = useCollection<ExerciseCategory>(exerciseCatQuery);


  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);
  
  const isLoading = exercisesLoading || habitsLoading || habitCatLoading || exerciseCatLoading;

  // Exercise CRUD
  const handleAddExercise = async (exerciseData: Omit<Exercise, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const exercisesCollection = collection(firestore, `users/${user.uid}/exercises`);
    await addDoc(exercisesCollection, { ...exerciseData, authorId: user.uid });
  };

  const handleUpdateExercise = async (exercise: Exercise) => {
    if (!user || !firestore || !exercise.id) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
    const { id, ...exerciseData } = exercise;
    await updateDoc(exerciseDoc, exerciseData);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user || !firestore) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exerciseId);
    await deleteDoc(exerciseDoc);
  };
  
  // Habit CRUD
  const handleAddHabit = async (habitData: Omit<Habit, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    await addDoc(habitsCollection, { ...habitData, authorId: user.uid });
  };

  const handleUpdateHabit = async (habit: Habit) => {
     if (!user || !firestore || !habit.id) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const { id, ...habitData } = habit;
    await updateDoc(habitDoc, habitData);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user || !firestore) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habitId);
    await deleteDoc(habitDoc);
  };
  
  // Category CRUD
  const handleAddHabitCategory = async (name: string) => {
    if (!user || !firestore) return;
    await addDoc(collection(firestore, `users/${user.uid}/habitCategories`), { name });
  };
  const handleUpdateHabitCategory = async (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    await updateDoc(doc(firestore, `users/${user.uid}/habitCategories`, category.id), { name: category.name });
  };
  const handleDeleteHabitCategory = async (categoryId: string) => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, `users/${user.uid}/habitCategories`, categoryId));
  };
  
  const handleAddExerciseCategory = async (name: string) => {
    if (!user || !firestore) return;
    await addDoc(collection(firestore, `users/${user.uid}/exerciseCategories`), { name });
  };
  const handleUpdateExerciseCategory = async (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    await updateDoc(doc(firestore, `users/${user.uid}/exerciseCategories`, category.id), { name: category.name });
  };
  const handleDeleteExerciseCategory = async (categoryId: string) => {
     if (!user || !firestore) return;
    await deleteDoc(doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId));
  };

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
      />
      <ManageExerciseCategoriesDialog 
        open={isManageExerciseCategoriesOpen} 
        onOpenChange={setIsManageExerciseCategoriesOpen}
        categories={exerciseCategories || []}
        onAdd={handleAddExerciseCategory}
        onUpdate={handleUpdateExerciseCategory}
        onDelete={handleDeleteExerciseCategory}
      />
    </>
  );
}
