'use client';
import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { ExerciseCard } from '@/components/exercise-card';
import { Input } from '@/components/ui/input';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Exercise, ExerciseCategory } from '@/lib/types';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Страница библиотеки упражнений, которая позволяет пользователям просматривать, создавать,
 * обновлять и удалять упражнения и категории.
 * @returns {JSX.Element} Компонент страницы библиотеки.
 */
export default function LibraryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises, isLoading: exercisesLoading } = useCollection<Exercise>(exercisesQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null),
    [user, firestore]
  );
  const { data: exerciseCategories, isLoading: categoriesLoading } = useCollection<ExerciseCategory>(categoriesQuery);


  const [searchTerm, setSearchTerm] = useState('');
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  /**
   * Добавляет новое упражнение в Firestore.
   * @param {Omit<Exercise, 'id' | 'authorId'>} newExercise - Новое упражнение для добавления.
   */
  const handleAddExercise = (newExercise: Omit<Exercise, 'id' | 'authorId'>) => {
    if (!user || !firestore) return;
    const exercisesCollection = collection(firestore, `users/${user.uid}/exercises`);
    addDoc(exercisesCollection, { ...newExercise, authorId: user.uid }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: exercisesCollection.path,
        requestResourceData: newExercise,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  /**
   * Обновляет существующее упражнение в Firestore.
   * @param {Exercise} exercise - Упражнение для обновления.
   */
  const handleUpdateExercise = async (exercise: Exercise) => {
    if (!user || !firestore || !exercise.id) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exercise.id);
    const { id, ...exerciseData } = exercise;
    await updateDoc(exerciseDoc, exerciseData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: exerciseDoc.path,
        requestResourceData: exerciseData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }

  /**
   * Удаляет упражнение из Firestore.
   * @param {string} exerciseId - ID упражнения для удаления.
   */
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user || !firestore) return;
    const exerciseDoc = doc(firestore, `users/${user.uid}/exercises`, exerciseId);
    await deleteDoc(exerciseDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: exerciseDoc.path,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }

  /**
   * Добавляет новую категорию упражнений в Firestore.
   * @param {string} name - Название новой категории.
   */
  const handleAddCategory = (name: string) => {
    if (!user || !firestore) return;
    const categoriesCollection = collection(firestore, `users/${user.uid}/exerciseCategories`);
    addDoc(categoriesCollection, { name }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: categoriesCollection.path,
        requestResourceData: { name },
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };

  /**
   * Обновляет существующую категорию упражнений в Firestore.
   * @param {ExerciseCategory} category - Категория для обновления.
   */
  const handleUpdateCategory = (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, category.id);
    updateDoc(categoryDoc, { name: category.name }).catch(async (err) => {
       const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: categoryDoc.path,
        requestResourceData: { name: category.name },
      });
       errorEmitter.emit('permission-error', permissionError);
    });
  };

  /**
   * Удаляет категорию упражнений из Firestore.
   * @param {string} categoryId - ID категории для удаления.
   */
  const handleDeleteCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId);
    deleteDoc(categoryDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: categoryDoc.path,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
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
          <h1 className="text-3xl font-bold tracking-tight">
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
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
    <ManageCategoriesDialog 
      open={isManageCategoriesOpen} 
      onOpenChange={setIsManageCategoriesOpen}
      categories={exerciseCategories || []}
      onAdd={handleAddCategory}
      onUpdate={handleUpdateCategory}
      onDelete={handleDeleteCategory}
      categoryType='Exercise'
    />
    </>
  );
}
