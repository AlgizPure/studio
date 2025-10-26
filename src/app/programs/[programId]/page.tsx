'use client';

import { notFound } from 'next/navigation';
import { useDoc, useCollection, useUser, useFirestore } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import type { Program, Workout, ProgramWorkout } from '@/lib/types';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramDetailPage({ params }: { params: { programId: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const programPath = user ? `users/${user.uid}/programs/${params.programId}` : null;
  const workoutsPath = user ? `users/${user.uid}/workouts` : null;
  const programWorkoutsPath = user ? `users/${user.uid}/programs/${params.programId}/workouts` : null;

  const { data: program, loading: programLoading } = useDoc<Program>(programPath);
  const { data: programWorkouts, loading: programWorkoutsLoading } = useCollection<ProgramWorkout>(programWorkoutsPath);
  const { data: allWorkouts, loading: allWorkoutsLoading } = useCollection<Workout>(workoutsPath);

  const handleAddWorkout = async (newWorkoutData: Omit<Workout, 'id'>) => {
    if (!user || !firestore || !programWorkoutsPath) return;

    // 1. Create the workout document in the user's top-level workouts collection
    const workoutsCollection = collection(firestore, `users/${user.uid}/workouts`);
    const workoutDocRef = await addDoc(workoutsCollection, newWorkoutData);

    // 2. Create the ProgramWorkout document to link it to the program
    const programWorkoutsCollection = collection(firestore, programWorkoutsPath);
    const newProgramWorkout: Omit<ProgramWorkout, 'id'> = {
      workoutId: workoutDocRef.id,
      // Default schedule, can be edited later
      schedule: {
        type: 'repeating',
        days: ['Monday', 'Wednesday', 'Friday'],
      },
    };
    await addDoc(programWorkoutsCollection, newProgramWorkout);
  };
  
  const programWorkoutDetails = programWorkouts?.map(pw => {
      const workout = allWorkouts?.find(w => w.id === pw.workoutId);
      return {
          ...pw,
          workoutName: workout?.name || 'Loading workout...',
          workoutDescription: workout?.description || ''
      }
  });


  const isLoading = programLoading || programWorkoutsLoading || allWorkoutsLoading;

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
    )
  }

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">{program.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{program.description}</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-semibold tracking-tight">Workouts</h2>
          {!program.isTemplate && <AddWorkoutToProgramDialog onWorkoutAdd={handleAddWorkout} />}
        </div>
        
        <>
            {(programWorkoutDetails || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>This program doesn't have any workouts yet.</p>
                    {!program.isTemplate && <p className="text-sm">Click "Add Workout" to get started.</p>}
                </div>
            ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {programWorkoutDetails?.map(pw => (
                        <div key={pw.id} className="p-4 border rounded-lg shadow-sm glass">
                            <h3 className="font-semibold">{pw.workoutName}</h3>
                            <p className="text-sm text-muted-foreground">{pw.schedule.days?.join(', ')}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
      </div>
    </div>
  );
}
