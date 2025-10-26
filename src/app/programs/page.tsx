'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, where } from 'firebase/firestore';
import { AddProgramDialog } from '@/components/add-program-dialog';
import { ProgramCard } from '@/components/program-card';
import type { Program } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProgramsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/programs`) : null),
    [user, firestore]
  );
  const { data: userPrograms, loading: userProgramsLoading } = useCollection<Program>(userProgramsQuery);

  const templateProgramsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'programs'), where('isTemplate', '==', true)) : null),
    [firestore]
  );
  const { data: templatePrograms, loading: templateProgramsLoading } = useCollection<Program>(templateProgramsQuery);

  const handleAddProgram = async (newProgramData: Omit<Program, 'id' | 'authorId' | 'isTemplate'>) => {
    if (!user || !firestore) return;
    const programsCollection = collection(firestore, `users/${user.uid}/programs`);
    await addDoc(programsCollection, {
      ...newProgramData,
      authorId: user.uid,
      isTemplate: false,
    });
  };

  const isLoading = userProgramsLoading || templateProgramsLoading;

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
        {isLoading ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {(userPrograms || []).map(program => (
                <ProgramCard key={program.id} program={program} />
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
        <h2 className="text-2xl font-headline font-semibold tracking-tight my-4">Templates</h2>
        {isLoading ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(templatePrograms || []).map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
