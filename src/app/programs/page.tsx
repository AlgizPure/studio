'use client';

import { useState } from 'react';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { ProgramCard } from '@/components/program-card';
import type { Program } from '@/lib/types';

// Mock data, to be replaced with Firestore data
const initialPrograms: Program[] = [
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

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);

  const handleAddProgram = (newProgram: Program) => {
    setPrograms(prev => [...prev, newProgram]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Workout Programs
          </h1>
          <p className="text-muted-foreground">
            Manage your programs or start a new one from a template.
          </p>
        </div>
        <AddProgramDialog onProgramAdd={handleAddProgram} />
      </div>

      <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">My Programs</h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {programs.filter(p => !p.isTemplate).map(program => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
        {programs.filter(p => !p.isTemplate).length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>You haven't created any programs yet.</p>
                <p className="text-sm">Click "Add Program" to get started.</p>
            </div>
        )}
      </div>

       <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Templates</h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {programs.filter(p => p.isTemplate).map(program => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </div>
  );
}
