'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Play } from 'lucide-react';
import { mockPrograms } from '@/lib/mock-programs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';
import type { WorkoutExtended, ProgramWorkout, Program, WorkoutLog } from '@/lib/types';
import Link from 'next/link';
import { WorkoutExecutionMode } from '@/components/workout-execution/workout-execution-mode';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProgramDetailPage({ 
  params 
}: { 
  params: { programId: string };
}) {
  const { programId } = params;
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // In a real app, this would also fetch detailed workout objects
  const [program, setProgram] = useState<Program | undefined>(
    mockPrograms.find(p => p.id === programId)
  );
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [executingWorkout, setExecutingWorkout] = useState<WorkoutExtended | null>(null);

  const handleWorkoutComplete = async (log: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user || !firestore) {
      toast({
        title: 'Error',
        description: 'User not authenticated. Cannot save log.',
        variant: 'destructive',
      });
      return;
    }
  
    try {
      const workoutLogsRef = collection(firestore, `users/${user.uid}/workoutLogs`);
      await addDoc(workoutLogsRef, {
        ...log,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  
      toast({
        title: 'Workout Completed!',
        description: 'Your workout has been logged successfully.',
      });
  
      setExecutingWorkout(null);
    } catch (error) {
      console.error("Failed to save workout log:", error);
      toast({
        title: 'Error',
        description: 'Failed to save workout log. Please try again.',
        variant: 'destructive',
      });
    }
  };
  

  if (!program) {
    notFound();
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleWorkoutAdd = (workout: WorkoutExtended, schedule: ProgramWorkout['schedule']) => {
    const programWorkout: ProgramWorkout = {
      workoutId: workout.id,
      schedule,
      completed: 0,
      skipped: 0,
    };
    
    if (!(program as any).detailedWorkouts) {
      (program as any).detailedWorkouts = [];
    }
    (program as any).detailedWorkouts.push(workout);


    setProgram({
      ...program,
      workouts: [...program.workouts, programWorkout],
    });
  };
  
  const handleStartWorkout = (workout: WorkoutExtended) => {
    setExecutingWorkout(workout);
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/programs')}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
            <Badge>{program.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {formatDate(program.startDate)} - {program.durationType === 'fixed' ? formatDate(program.endDate) : 'Ongoing'}
          </p>
        </div>
      </div>

      {/* Description */}
      {program.description && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{program.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tags & Goal */}
      <div className="grid md:grid-cols-2 gap-4">
        {program.tags.length > 0 && (
          <Card className="glass flex-1">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {program.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {program.goal && (
          <Card className="glass flex-1">
            <CardHeader>
              <CardTitle>Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{program.goal}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workouts Section */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workouts</CardTitle>
              <CardDescription>
                Training sessions in this program
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddWorkoutOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {program.workouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No workouts added yet</p>
              <p className="text-sm mt-2">Click "Add Workout" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {program.workouts.map((pw, index) => {
                const workoutDetail = (program as any).detailedWorkouts?.find((w: WorkoutExtended) => w.id === pw.workoutId);
                return (
                    <Card key={index}>
                      <CardHeader>
                          <CardTitle>{workoutDetail?.name || `Workout ${index + 1}`}</CardTitle>
                          <CardDescription>
                          {pw.schedule.intervalType === 'days_of_week' 
                              ? `${(pw.schedule.intervalValue as string[]).join(', ')}`
                              : `Every ${pw.schedule.intervalValue} days`
                          }
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {workoutDetail && (
                          <Button onClick={() => handleStartWorkout(workoutDetail)}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Workout
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Workout Dialog */}
      <AddWorkoutToProgramDialog
        open={isAddWorkoutOpen}
        onOpenChange={setIsAddWorkoutOpen}
        onWorkoutAdd={handleWorkoutAdd}
      />
    </div>

    {executingWorkout && (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4 md:p-8">
        <WorkoutExecutionMode
          workout={executingWorkout}
          programId={program.id}
          onComplete={handleWorkoutComplete}
          onCancel={() => setExecutingWorkout(null)}
        />
      </div>
    )}
    </>
  );
}
