'use client';

import { notFound } from 'next/navigation';
import { useDoc, useCollection, useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Program, Workout, ProgramWorkout } from '@/lib/types';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramDetailPage({ params }: { params: { programId: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const programPath = user ? `users/${user.uid}/programs/${params.programId}` : null;
  const workoutsPath = user ? `users/${user.uid}/programs/${params.programId}/workouts` : null;

  const { data: program, loading: programLoading } = useDoc<Program>(programPath);
  const { data: programWorkouts, loading: workoutsLoading } = useCollection<ProgramWorkout>(workoutsPath);
  
  const handleAddWorkout = async (newWorkout: Omit<Workout, 'id'>) => {
    if (!workoutsPath || !firestore) return;
    const workoutsCollection = collection(firestore, workoutsPath);
    // This should be a ProgramWorkout, not a Workout
    const newProgramWorkout: Omit<ProgramWorkout, 'id'> = {
      workoutId: '', // This needs to be properly handled
      // ... schedule data
    };
    // await addDoc(workoutsCollection, newWorkout);
    console.log("Adding workout to program, logic to be implemented", newWorkout);
  };

  if (programLoading) {
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
          {!program.isTemplate && <AddWorkoutToProgramDialog programId={program.id} onWorkoutAdd={handleAddWorkout} />}
        </div>
        
        {workoutsLoading ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Loading workouts...</p>
            </div>
        ) : (
            <>
                {(programWorkouts || []).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>This program doesn't have any workouts yet.</p>
                        {!program.isTemplate && <p className="text-sm">Click "Add Workout" to get started.</p>}
                    </div>
                ) : (
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {/* We need to fetch workout details based on workoutId */}
                        {(programWorkouts || []).map(pw => <div key={pw.id} className="p-4 border rounded-lg shadow-sm"><h3>Workout: {pw.workoutId}</h3></div>)}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}
