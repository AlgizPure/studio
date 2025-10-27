'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import type { Program, Workout, ProgramWorkout } from '@/lib/types';
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

  const programWorkoutsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/programs/${programId}/workouts`) : null),
    [user, firestore, programId]
  );
  const { data: programWorkouts, isLoading: programWorkoutsLoading } = useCollection<ProgramWorkout>(programWorkoutsQuery);

  const handleAddWorkout = async (newWorkoutData: Omit<Workout, 'id'>) => {
    if (!user || !firestore || !programWorkoutsQuery) return;

    // A workout in a program is just a ProgramWorkout
    const newProgramWorkout: Omit<ProgramWorkout, 'id'> = {
      ...newWorkoutData,
      schedule: {
        type: 'repeating',
        days: ['Monday', 'Wednesday', 'Friday'],
      },
    };

    addDoc(programWorkoutsQuery, newProgramWorkout).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: programWorkoutsQuery.path,
        requestResourceData: newProgramWorkout,
      }));
    });
  };

  const isLoading = programLoading || programWorkoutsLoading;

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
          {!program.isTemplate && <AddWorkoutToProgramDialog onWorkoutAdd={handleAddWorkout} />}
        </div>
        
        <>
          {(programWorkouts || []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>This program doesn't have any workouts yet.</p>
              {!program.isTemplate && <p className="text-sm">Click "Add Workout" to get started.</p>}
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {programWorkouts?.map(pw => (
                <div key={pw.id} className="p-4 border rounded-lg shadow-sm glass">
                  <h3 className="font-semibold">{pw.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pw.schedule.days?.join(', ') || 'No schedule set'}
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
