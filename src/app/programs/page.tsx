'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramCard } from '@/components/programs/program-card';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { mockPrograms } from '@/lib/mock-programs';
import { useState } from 'react';
import type { Program } from '@/lib/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProgram = (programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workouts'>) => {
    const newProgram: Program = {
      ...programData,
      id: `prog_${Date.now()}`,
      workouts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user_1',
    };
    
    setPrograms([...programs, newProgram]);
  };

  const handleEdit = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDelete = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId));
  };

  const handleActivate = (programId: string) => {
    setPrograms(programs.map(p => 
      p.id === programId ? { ...p, status: 'active' as const } : p
    ));
  };

  const handlePause = (programId: string) => {
    setPrograms(programs.map(p => 
      p.id === programId ? { ...p, status: 'paused' as const } : p
    ));
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProgram(undefined);
  };
  
  const openNewProgramDialog = () => {
    setEditingProgram(undefined);
    setIsDialogOpen(true);
  }

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
        <Button onClick={openNewProgramDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>
      
       <AddProgramDialog 
          onProgramAdd={handleAddProgram}
          programToEdit={editingProgram}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />

      {programs.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training program to get started
            </p>
            <Button onClick={openNewProgramDialog}>
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
