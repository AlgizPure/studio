'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramCard } from '@/components/programs/program-card';
import { mockPrograms } from '@/lib/mock-programs';
import { useState } from 'react';
import type { Program } from '@/lib/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);

  const handleEdit = (programId: string) => {
    console.log('Edit program:', programId);
    // TODO: Откроет диалог редактирования
  };

  const handleDelete = (programId: string) => {
    console.log('Delete program:', programId);
    setPrograms(programs.filter(p => p.id !== programId));
  };

  const handleActivate = (programId: string) => {
    console.log('Activate program:', programId);
    setPrograms(programs.map(p => 
      p.id === programId ? { ...p, status: 'active' as const } : p
    ));
  };

  const handlePause = (programId: string) => {
    console.log('Pause program:', programId);
    setPrograms(programs.map(p => 
      p.id === programId ? { ...p, status: 'paused' as const } : p
    ));
  };

  const handleCreateNew = () => {
    console.log('Create new program');
    // TODO: Откроет диалог создания программы
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Training Programs
          </h1>
          <p className="text-muted-foreground">
            Create and manage your workout programs
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training program to get started
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onPause={handlePause}
            />
          ))}
        </div>
      )}
    </div>
  );
}
