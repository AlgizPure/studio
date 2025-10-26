'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Program, Workout } from '@/lib/types';
import { Badge } from './ui/badge';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { getTemplateProgramData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { writeBatch, doc, collection } from 'firebase/firestore';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTemplate = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to add a program.',
      });
      return;
    }

    setIsAdding(true);
    const result = await getTemplateProgramData(program.id);

    if (!result.success || !result.programData) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to fetch the program template.',
      });
      setIsAdding(false);
      return;
    }

    try {
        const batch = writeBatch(firestore);

        // 1. Create a new program for the user
        const userProgramsRef = collection(firestore, `users/${user.uid}/programs`);
        const newUserProgramRef = doc(userProgramsRef);
        batch.set(newUserProgramRef, {
            ...result.programData,
            isTemplate: false,
            authorId: user.uid,
        });

        // 2. Add each workout to the new user program's subcollection
        if (result.workouts && result.workouts.length > 0) {
            const newUserProgramWorkoutsRef = collection(newUserProgramRef, 'workouts');
            result.workouts.forEach(workoutData => {
                const newWorkoutRef = doc(newUserProgramWorkoutsRef);
                batch.set(newWorkoutRef, workoutData);
            });
        }
        
        await batch.commit();

        toast({
            title: 'Program Added!',
            description: `${program.name} has been added to your programs.`,
        });
        router.push(`/programs/${newUserProgramRef.id}`);

    } catch (error) {
        console.error('Error adding template program to user:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred while adding the program.',
        });
    } finally {
        setIsAdding(false);
    }
  };


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-2xl">{program.name}</CardTitle>
            {program.isTemplate && <Badge variant="secondary">Template</Badge>}
        </div>
        <CardDescription className="h-10 text-ellipsis overflow-hidden">{program.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* We can add more details here later, like workout count */}
        <div className="text-sm text-muted-foreground">
            <p>3 Workouts / Week</p>
            <p>6 Weeks</p>
        </div>
      </CardContent>
      <CardFooter>
        {program.isTemplate ? (
            <Button className="w-full" onClick={handleAddTemplate} disabled={isAdding}>
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? 'Adding...' : 'Add to My Programs'}
            </Button>
        ) : (
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/programs/${program.id}`}>View Program</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
