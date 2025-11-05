'use client';
import { useState, useMemo } from 'react';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { useUserCollection } from '@/hooks/use-user-collection';
import { WorkoutCard } from '@/components/workout-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkoutBuilder } from '@/components/workout-builder/workout-builder';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { WorkoutExtended } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { calculateWorkoutEstimatedDuration } from '@/lib/utils/workout-duration';
import { useToast } from '@/hooks/use-toast';

export default function WorkoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { data: workouts, isLoading: workoutsLoading } = useUserCollection<WorkoutExtended>('workouts');
  const { data: exercises } = useUserCollection('exercises');

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Omit<WorkoutExtended, 'id'> | null>(null);

  const handleWorkoutSave = async (workoutData: Omit<WorkoutExtended, 'id'>) => {
    if (!user || !firestore) return;

    // Рассчитываем estimatedDuration если есть упражнения
    let estimatedDuration = workoutData.estimatedDuration;
    if (exercises && workoutData.cycles) {
      const exercisesMap = new Map(
        exercises.map((ex: any) => [ex.id, ex])
      );
      estimatedDuration = calculateWorkoutEstimatedDuration(
        workoutData as WorkoutExtended,
        exercisesMap
      );
    }

    const workoutToSave: Omit<WorkoutExtended, 'id'> = {
      ...workoutData,
      status: 'inactive', // новые тренировки по умолчанию неактивны
      estimatedDuration,
    };

    const workoutsCollection = collection(firestore, `users/${user.uid}/workouts`);
    await addDoc(workoutsCollection, { ...workoutToSave, authorId: user.uid }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: workoutsCollection.path,
        requestResourceData: workoutToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    toast({
      title: 'Workout Created',
      description: 'Workout has been added to your library.',
    });

    setNewWorkout(null);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateWorkout = async (workout: WorkoutExtended) => {
    if (!user || !firestore || !workout.id) return;
    
    // Пересчитываем estimatedDuration
    let estimatedDuration = workout.estimatedDuration;
    if (exercises && workout.cycles) {
      const exercisesMap = new Map(
        exercises.map((ex: any) => [ex.id, ex])
      );
      estimatedDuration = calculateWorkoutEstimatedDuration(workout, exercisesMap);
    }

    const workoutDoc = doc(firestore, `users/${user.uid}/workouts`, workout.id);
    const { id, ...workoutData } = workout;
    await updateDoc(workoutDoc, { ...workoutData, estimatedDuration }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: workoutDoc.path,
        requestResourceData: workoutData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user || !firestore) return;
    const workoutDoc = doc(firestore, `users/${user.uid}/workouts`, workoutId);
    await deleteDoc(workoutDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: workoutDoc.path,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDuplicateWorkout = async (workout: WorkoutExtended) => {
    if (!user || !firestore) return;
    const workoutsCollection = collection(firestore, `users/${user.uid}/workouts`);
    const { id, ...workoutData } = workout;
    await addDoc(workoutsCollection, { ...workoutData, authorId: user.uid }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: workoutsCollection.path,
        requestResourceData: workoutData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    toast({
      title: 'Workout Duplicated',
      description: 'Workout has been duplicated.',
    });
  };

  const filteredWorkouts = useMemo(() =>
    (workouts || []).filter(w =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [workouts, searchTerm]);

  const isLoading = workoutsLoading;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Workouts Library
            </h1>
            <p className="text-muted-foreground">
              Browse, create, and manage your workouts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search workouts..." 
              className="w-full md:w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout.id} 
                workout={workout} 
                onUpdate={handleUpdateWorkout}
                onDelete={handleDeleteWorkout}
                onDuplicate={handleDuplicateWorkout}
              />
            ))}
            {filteredWorkouts.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>No workouts found. Create your first workout!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Workout Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle>Create New Workout</DialogTitle>
            <DialogDescription>
              Build your workout by adding cycles and exercises.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6" style={{ minHeight: 0 }}>
            <WorkoutBuilder
              workout={newWorkout || undefined}
              onSave={handleWorkoutSave}
              onCancel={() => {
                setNewWorkout(null);
                setIsCreateDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

