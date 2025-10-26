'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import type { Program, Workout } from '@/lib/types';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';

// Mock data, replace with Firestore call
const programs: Program[] = [
  {
    id: 'prog1',
    name: 'Strength Essentials',
    description: 'A 3-day split focusing on compound lifts to build foundational strength.',
    isTemplate: true,
  },
  {
    id: 'prog2',
    name: 'Marathon Prep',
    description: 'A 12-week program to get you ready for race day.',
    isTemplate: true,
  },
  {
    id: 'prog3',
    name: 'My Custom Plan',
    description: 'A personalized mix of strength and cardio for my goals.',
    isTemplate: false,
    authorId: 'user123',
  }
];

export default function ProgramDetailPage({ params }: { params: { programId: string } }) {
  const [program] = useState<Program | undefined>(programs.find(p => p.id === params.programId));
  // In the future, this will be a list of workouts for the program
  const [workouts, setWorkouts] = useState<any[]>([]);

  if (!program) {
    // In a real app, we'd fetch this from Firestore and show a loading state
    // For now, if it's not in our mock data, it's a 404
    notFound();
  }

  const handleAddWorkout = (newWorkout: Workout) => {
    // This function will eventually save the workout and its schedule to Firestore
    setWorkouts(prev => [...prev, newWorkout]);
    console.log('Added workout to program:', newWorkout);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">{program.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{program.description}</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-semibold tracking-tight">Workouts</h2>
          <AddWorkoutToProgramDialog programId={program.id} onWorkoutAdd={handleAddWorkout} />
        </div>
        
        {workouts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>This program doesn't have any workouts yet.</p>
            <p className="text-sm">Click "Add Workout" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Workout cards will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
