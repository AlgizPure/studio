'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutBuilder } from '@/components/workout-builder/workout-builder';
import type { WorkoutExtended } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface EditWorkoutDialogProps {
  workout: WorkoutExtended;
  onUpdate: (workout: WorkoutExtended) => Promise<void>;
  onDelete: (workoutId: string) => Promise<void>;
  trigger: React.ReactNode;
}

export function EditWorkoutDialog({ workout, onUpdate, onDelete, trigger }: EditWorkoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Omit<WorkoutExtended, 'id'> | null>(null);
  const [currentTab, setCurrentTab] = useState<'edit' | 'delete'>('edit');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCurrentWorkout({
        name: workout.name,
        description: workout.description,
        cycles: workout.cycles || [],
        targetMuscles: workout.targetMuscles,
        estimatedDuration: workout.estimatedDuration,
        status: workout.status,
        isStandalone: workout.isStandalone,
        standaloneSchedule: workout.standaloneSchedule,
        isHabit: workout.isHabit,
      });
      setCurrentTab('edit');
    }
  }, [open, workout]);

  const handleWorkoutSave = (workoutData: Omit<WorkoutExtended, 'id'>) => {
    const updated: WorkoutExtended = {
      ...workout,
      ...workoutData,
    };
    onUpdate(updated);
    setOpen(false);
    toast({
      title: 'Workout Updated',
      description: 'Workout has been saved.',
    });
  };

  const handleDelete = async () => {
    await onDelete(workout.id);
    setOpen(false);
    toast({
      title: 'Workout Deleted',
      description: 'Workout has been removed.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Edit Workout</DialogTitle>
          <DialogDescription>
            Modify your workout structure and cycles.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'edit' | 'delete')} className="flex-1 flex flex-col overflow-hidden min-h-0 px-6">
          <TabsList className="grid w-full grid-cols-2 mt-4 flex-shrink-0">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4" style={{ minHeight: 0 }}>
            {currentWorkout && (
              <WorkoutBuilder
                workout={currentWorkout}
                onSave={handleWorkoutSave}
                onCancel={() => setOpen(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="delete" className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4" style={{ minHeight: 0 }}>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Workout</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{workout.name}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

