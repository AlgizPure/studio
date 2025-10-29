'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, addDoc, doc } from 'firebase/firestore';
import type { Program, Workout } from '@/lib/types';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export default function ProgramDetailPage({ params }: { params: { programId: string } }) {
  const resolvedParams = React.use(params);
  const { programId } = resolvedParams;
  const { user } = useUser();
  const firestore = useFirestore();

  const programRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/programs/${programId}`) : null),
    [user, firestore, programId]
  );
  const { data: program, isLoading: programLoading } = useDoc<Program>(programRef);

  const workoutsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/programs/${programId}/workouts`) : null),
    [user, firestore, programId]
  );
  const { data: workouts, isLoading: workoutsLoading } = useCollection<Workout>(workoutsRef);

  const handleAddWorkout = async (newWorkoutData: Omit<Workout, 'id'>) => {
    if (!user || !firestore || !workoutsRef) return;

    addDoc(workoutsRef, newWorkoutData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: workoutsRef.path,
        requestResourceData: newWorkoutData,
      }));
    });
  };

  const isLoading = programLoading || workoutsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between mt-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Loading program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{program.description}</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Workouts</h2>
          {!(program as any).isTemplate && <AddWorkoutToProgramDialog onWorkoutAdd={handleAddWorkout} />}
        </div>
        
        <>
          {(workouts || []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>This program doesn't have any workouts yet.</p>
              {!(program as any).isTemplate && <p className="text-sm">Click "Add Workout" to get started.</p>}
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {(workouts || []).map(workout => (
                <div key={workout.id} className="p-4 border rounded-lg shadow-sm glass">
                  <h3 className="font-semibold">{workout.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {workout.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      </div>
    </div>
  );
}
