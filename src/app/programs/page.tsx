'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramCard } from '@/components/programs/program-card';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { ImportProgramDialog } from '@/components/import-program-dialog';
import { mockPrograms } from '@/lib/mock-programs';
import { useState } from 'react';
import type { Program, ProgramWorkout } from '@/lib/types';
import { DialogTrigger } from '@/components/ui/dialog';

// Types for patch operations
type PatchOperation =
  | { op: 'add-program'; program: any }  // Keep any for now since import format varies
  | { op: 'update-program'; program_id: string; program: Partial<Program> }
  | { op: 'remove-exercise'; program_id: string; workout_id: string; exercise_id: string };

type Patch = {
  patch: PatchOperation[];
};

type ProgramWorkoutWithExercises = ProgramWorkout & {
  exercises?: Array<{ exerciseId: string }>;
};

// Collision detection/diff/patch utilities:
function diffPrograms(oldProg: Program | null, newProg: Program) {
  if (!oldProg) return 'Program is new.';
  const oldJSON = JSON.stringify(oldProg, null, 2);
  const newJSON = JSON.stringify(newProg, null, 2);
  if (oldJSON === newJSON) return 'No changes.';
  return `Old:\n${oldJSON}\n\nNew:\n${newJSON}`;
}

function applyPatch(programs: Program[], patch: Patch): Program[] {
  let next = [...programs];
  for (const op of patch.patch || []) {
    if (op.op === 'add-program' && op.program) {
      if (!next.some(p => p.id === op.program.meta.id)) {
        next.push({
          ...op.program,
          id: op.program.meta.id,
          name: op.program.meta.name,
          workouts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user_1',
        });
      }
    }
    if (op.op === 'update-program' && op.program_id) {
      const idx = next.findIndex(p => p.id === op.program_id);
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...op.program };
      }
    }
    if (op.op === 'remove-exercise' && op.program_id && op.workout_id && op.exercise_id) {
      const idx = next.findIndex(p => p.id === op.program_id);
      if (idx >= 0 && Array.isArray(next[idx].workouts)) {
        next[idx].workouts = next[idx].workouts.map(w => {
          const workoutWithExercises = w as ProgramWorkoutWithExercises;
          return w.workoutId === op.workout_id
            ? {
                ...w,
                exercises: Array.isArray(workoutWithExercises.exercises)
                  ? workoutWithExercises.exercises.filter(e => e.exerciseId !== op.exercise_id)
                  : [],
              }
            : w;
        });
      }
    }
    // Could add update-exercise...
  }
  return next;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

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
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>Import Program</Button>
          <Button onClick={openNewProgramDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Button>
        </div>
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

      <ImportProgramDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={async (data: unknown) => {
          // Type guard for import data
          if (!data || typeof data !== 'object') return;

          const importData = data as { kind?: string; value?: any };

          if (importData.kind === 'program' && importData.value) {
            const newId = importData.value.meta?.id ?? importData.value.id;
            const duplicate = programs.find(p => p.id === newId);
            if (duplicate) {
              const diff = diffPrograms(duplicate, importData.value);
              const overwrite = window.confirm(`Программа с ID "${newId}" уже существует. Перезаписать?\n\nDiff:\n${diff}`);
              if (!overwrite) return;
              setPrograms(prev => prev.map(p =>
                p.id === newId
                  ? {
                      ...p,
                      name: importData.value.meta.name,
                      workouts: [],
                      updatedAt: new Date().toISOString(),
                      // ...other fields if needed from ZTL
                    }
                  : p
              ));
              alert('Программа успешно обновлена!');
            } else {
              setPrograms(prev => [
                ...prev,
                {
                  id: newId,
                  name: importData.value.meta.name,
                  description: undefined,
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: undefined,
                  durationType: 'fixed',
                  status: 'active',
                  goal: importData.value.meta.goal,
                  tags: Array.isArray(importData.value.meta.tags) ? importData.value.meta.tags : [],
                  workouts: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  userId: 'user_1',
                  isTemplate: false,
                },
              ]);
              alert('Программа успешно импортирована!');
            }
          } else if (importData.kind === 'patch' && importData.value) {
            setPrograms(p => applyPatch(p, importData.value));
            alert('Изменения по патчу применены.');
          }
        }}
      />
    </div>
  );
}
