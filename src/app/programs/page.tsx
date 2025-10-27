'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, where, writeBatch, doc, getDoc, getDocs } from 'firebase/firestore';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { ProgramCard } from '@/components/program-card';
import type { Program, Workout } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { seedProgramTemplates } from '../actions';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function ProgramsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  const userProgramsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/programs`), where('isTemplate', '==', false)) : null),
    [user, firestore]
  );
  const { data: userPrograms, isLoading: userProgramsLoading } = useCollection<Program>(userProgramsQuery);

  const templateProgramsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'programs'), where('isTemplate', '==', true)) : null),
    [firestore]
  );
  const { data: templatePrograms, isLoading: templateProgramsLoading } = useCollection<Program>(templateProgramsQuery);

  const handleAddProgram = (newProgramData: Omit<Program, 'id' | 'authorId' | 'isTemplate'>) => {
    if (!user || !firestore) return;
    const programsCollection = collection(firestore, `users/${user.uid}/programs`);
    const dataToSave = {
      ...newProgramData,
      authorId: user.uid,
      isTemplate: false,
    };
    addDoc(programsCollection, dataToSave).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: programsCollection.path,
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddTemplate = async (templateProgram: Program) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to add a program.',
      });
      return;
    }

    try {
        const templateProgramRef = doc(firestore, `programs/${templateProgram.id}`);
        const templateProgramSnap = await getDoc(templateProgramRef);

        if (!templateProgramSnap.exists()) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch the program template.',
            });
            return;
        }
        const { authorId, ...programDataToCopy } = templateProgramSnap.data() as Program;
        
        const templateWorkoutsRef = collection(templateProgramRef, 'workouts');
        const templateWorkoutsSnap = await getDocs(templateWorkoutsRef);
        
        const workoutsToCopy: Omit<Workout, 'id'>[] = [];
        if (!templateWorkoutsSnap.empty) {
          templateWorkoutsSnap.forEach(workoutDoc => {
            workoutsToCopy.push(workoutDoc.data() as Omit<Workout, 'id'>);
          });
        }
      
        const batch = writeBatch(firestore);
        
        const newProgramRef = doc(collection(firestore, `users/${user.uid}/programs`));
        const newProgramData = {
            ...programDataToCopy,
            authorId: user.uid,
            isTemplate: false,
        };
        batch.set(newProgramRef, newProgramData);

        if (workoutsToCopy.length > 0) {
            const newWorkoutsColRef = collection(newProgramRef, 'workouts');
            workoutsToCopy.forEach(workout => {
                const newWorkoutRef = doc(newWorkoutsColRef);
                batch.set(newWorkoutRef, workout);
            });
        }

        await batch.commit().catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/programs`,
                operation: 'write',
                requestResourceData: { program: newProgramData, workouts: workoutsToCopy }
            }));
            throw e;
        });

        toast({
            title: 'Program Added!',
            description: `${templateProgram.name} has been added to your programs.`,
        });
        router.push(`/programs/${newProgramRef.id}`);

    } catch (e: any) {
      console.error('[programs/page.tsx] Error in handleAddTemplate:', e);
      toast({
        variant: 'destructive',
        title: 'Error Adding Program',
        description: e.message || 'Could not copy the program template.',
      });
    }
  };

  const handleSeed = async () => {
    const result = await seedProgramTemplates();
    if(result.success) {
      toast({ title: "Seeding Complete", description: result.message });
    } else {
      toast({ variant: 'destructive', title: "Seeding Failed", description: result.message });
    }
  }

  const isLoading = userProgramsLoading || templateProgramsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workout Programs
          </h1>
          <p className="text-muted-foreground">
            Manage your programs or start a new one from a template.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {isDev && (
            <Button variant="outline" onClick={handleSeed}>Seed Templates</Button>
           )}
          <AddProgramDialog onProgramAdd={handleAddProgram} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">My Programs</h2>
        {isLoading ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {(userPrograms || []).map(program => (
                <ProgramCard key={program.id} program={program} onAddTemplate={handleAddTemplate} />
              ))}
            </div>
            {(userPrograms || []).length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>You haven't created any programs yet.</p>
                    <p className="text-sm">Click "Add Program" to get started.</p>
                </div>
            )}
          </>
        )}
      </div>

       <div>
        <h2 className="text-2xl font-semibold tracking-tight my-4">Templates</h2>
        {isLoading ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(templatePrograms || []).map(program => (
              <ProgramCard key={program.id} program={program} onAddTemplate={handleAddTemplate}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
