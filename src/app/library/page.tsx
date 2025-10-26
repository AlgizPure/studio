'use client';
import { useState } from 'react';
import { useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ExerciseCard } from '@/components/exercise-card';
import { Input } from '@/components/ui/input';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Exercise, ExerciseCategory } from '@/lib/types';
import { ManageExerciseCategoriesDialog } from '@/components/manage-exercise-categories-dialog';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function LibraryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: exercises, loading: exercisesLoading } = useCollection<Exercise>(
    user ? `users/${user.uid}/exercises` : null
  );
  const { data: exerciseCategories, loading: categoriesLoading } = useCollection<ExerciseCategory>(
    user ? `users/${user.uid}/exerciseCategories` : null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const handleAddExercise = async (newExercise: Omit<Exercise, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const exercisesCollection = collection(firestore, `users/${user.uid}/exercises`);
    await addDoc(exercisesCollection, { ...newExercise, authorId: user.uid });
  };
  
  const handleUpdateExercise = async (exercise: Exercise) => {
    if (!user || !firestore || !exercise.id) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
    const { id, ...exerciseData } = exercise;
    await updateDoc(exerciseDoc, exerciseData);
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user || !firestore) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exerciseId);
    await deleteDoc(exerciseDoc);
  }

  const handleAddCategory = async (name: string) => {
    if (!user || !firestore) return;
    const categoriesCollection = collection(firestore, `users/${user.uid}/exerciseCategories`);
    await addDoc(categoriesCollection, { name });
  };

  const handleUpdateCategory = async (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, category.id);
    await updateDoc(categoryDoc, { name: category.name });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user || !firestore) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId);
    await deleteDoc(categoryDoc);
  };
  
  const filteredExercises = (exercises || []).filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const allCategory = { id: 'all', name: 'All' };
  const categories = [allCategory, ...(exerciseCategories || [])];
  
  const isLoading = exercisesLoading || categoriesLoading;

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Exercise Library
          </h1>
          <p className="text-muted-foreground">
            Browse, create, and manage your exercises.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Search exercises..." 
            className="w-full md:w-64" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddExerciseDialog 
            onExerciseAdd={handleAddExercise} 
            categories={exerciseCategories || []}
            openManageCategories={() => setIsManageCategoriesOpen(true)} 
          />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                {filteredExercises
                  .filter(ex => category.id === 'all' || ex.categoryId === category.id)
                  .map((exercise) => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise} 
                      categories={exerciseCategories || []} 
                      onUpdate={handleUpdateExercise}
                      onDelete={handleDeleteExercise}
                      openManageCategories={() => setIsManageCategoriesOpen(true)}
                    />
                  ))}
              </div>
              {filteredExercises.filter(ex => category.id === 'all' || ex.categoryId === category.id).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No exercises found in this category.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
    <ManageExerciseCategoriesDialog 
      open={isManageCategoriesOpen} 
      onOpenChange={setIsManageCategoriesOpen}
      categories={exerciseCategories || []}
      onAdd={handleAddCategory}
      onUpdate={handleUpdateCategory}
      onDelete={handleDeleteCategory}
    />
    </>
  );
}
