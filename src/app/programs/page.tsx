'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, where, writeBatch, doc, getDoc, getDocs } from 'firebase/firestore';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { ProgramCard } from '@/components/program-card';
import type { Program, Workout } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { seedProgramTemplates } from '../actions';
import { Button } from '@/components/ui/button';

export default function ProgramsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  console.log('[programs/page.tsx] Rendering ProgramsPage.');

  const userProgramsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/programs`) : null),
    [user, firestore]
  );
  const { data: userPrograms, loading: userProgramsLoading } = useCollection<Program>(userProgramsQuery);

  const templateProgramsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'programs'), where('isTemplate', '==', true)) : null),
    [user, firestore]
  );
  const { data: templatePrograms, loading: templateProgramsLoading } = useCollection<Program>(templateProgramsQuery);

  const handleAddProgram = (newProgramData: Omit<Program, 'id' | 'authorId' | 'isTemplate'>) => {
    if (!user || !firestore) return;
    console.log('[programs/page.tsx] handleAddProgram called with:', newProgramData);
    const programsCollection = collection(firestore, `users/${user.uid}/programs`);
    const dataToSave = {
      ...newProgramData,
      authorId: user.uid,
      isTemplate: false,
    };
    addDoc(programsCollection, dataToSave).catch(err => {
      console.error('[programs/page.tsx] Error adding program:', err);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: programsCollection.path,
        requestResourceData: dataToSave,
      }));
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
    console.log('[programs/page.tsx] handleAddTemplate called for template:', templateProgram.name);

    try {
        console.log(`[programs/page.tsx] 1. Getting template program doc: programs/${templateProgram.id}`);
        // 1. Get the template program
        const templateProgramRef = doc(firestore, `programs/${templateProgram.id}`);
        const templateProgramSnap = await getDoc(templateProgramRef);

        if (!templateProgramSnap.exists()) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch the program template.',
            });
            console.error('[programs/page.tsx] Template program not found in Firestore.');
            return;
        }
        const programData = templateProgramSnap.data() as Program;
        
        console.log(`[programs/page.tsx] 2. Getting workouts from subcollection: programs/${templateProgram.id}/workouts`);
        // 2. Get the workouts from the template's subcollection
        const templateWorkoutsRef = collection(templateProgramRef, 'workouts');
        const templateWorkoutsSnap = await getDocs(templateWorkoutsRef);
        
        const workouts: Omit<Workout, 'id'>[] = [];
        if (!templateWorkoutsSnap.empty) {
          templateWorkoutsSnap.forEach(workoutDoc => {
            workouts.push(workoutDoc.data() as Omit<Workout, 'id'>);
          });
        }
        console.log(`[programs/page.tsx] Found ${workouts.length} workouts in template.`);
      
        console.log("[programs/page.tsx] 3. Preparing batch write for user's collections.");
        // 3. Write all data to the user's collections in a batch
        const batch = writeBatch(firestore);
        
        const newProgramRef = doc(collection(firestore, `users/${user.uid}/programs`));
        batch.set(newProgramRef, {
            ...programData,
            authorId: user.uid,
            isTemplate: false, // It's no longer a template for the user
        });
        console.log(`[programs/page.tsx] Batch: setting new program at ${newProgramRef.path}`);


        if (workouts) {
            workouts.forEach(workout => {
                // Create a new workout in the user's main workouts collection
                const newWorkoutRef = doc(collection(firestore, `users/${user.uid}/workouts`));
                batch.set(newWorkoutRef, workout);
                console.log(`[programs/page.tsx] Batch: setting new workout at ${newWorkoutRef.path}`);


                // Link this new workout to the user's new program
                const programWorkoutRef = doc(collection(newProgramRef, 'workouts'));
                batch.set(programWorkoutRef, {
                    workoutId: newWorkoutRef.id,
                    schedule: { type: 'repeating', days: ['Monday'] } // Default schedule
                });
                console.log(`[programs/page.tsx] Batch: setting program workout link at ${programWorkoutRef.path}`);

            });
        }

        await batch.commit();
        console.log(`[programs/page.tsx] Batch commit successful. Navigating to /programs/${newProgramRef.id}`);


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
      // Optionally emit a permission error if that's the likely cause
      if (e.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            operation: 'write',
            path: `users/${user.uid}/programs`,
            requestResourceData: templateProgram,
        }));
      }
    }
  };

  const handleSeed = async () => {
    console.log('[programs/page.tsx] handleSeed called.');
    const result = await seedProgramTemplates();
    if(result.success) {
      toast({ title: "Seeding Complete", description: result.message });
    } else {
      toast({ variant: 'destructive', title: "Seeding Failed", description: result.message });
    }
  }

  const isLoading = userProgramsLoading || templateProgramsLoading;
  console.log('[programs/page.tsx] Loading state:', { userProgramsLoading, templateProgramsLoading });

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
           {process.env.NODE_ENV === 'development' && (
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
