'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutBuilder } from './workout-builder/workout-builder';
import { WorkoutScheduleSetup } from './workout-builder/workout-schedule-setup';
import type { WorkoutExtended, ProgramWorkout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddWorkoutToProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkoutAdd: (workout: WorkoutExtended, schedule: ProgramWorkout['schedule']) => void;
}

export function AddWorkoutToProgramDialog({
  open,
  onOpenChange,
  onWorkoutAdd,
}: AddWorkoutToProgramDialogProps) {
  const [currentTab, setCurrentTab] = useState('workout');
  const [workout, setWorkout] = useState<Omit<WorkoutExtended, 'id'> | null>(null);
  const [schedule, setSchedule] = useState<ProgramWorkout['schedule'] | null>(null);
  const { toast } = useToast();

  const handleWorkoutSave = (workoutData: Omit<WorkoutExtended, 'id'>) => {
    setWorkout(workoutData);
    setCurrentTab('schedule');
  };

  const handleScheduleSave = () => {
    if (!workout || !schedule) {
      toast({
        title: 'Error',
        description: 'Please complete workout and schedule setup.',
        variant: 'destructive',
      });
      return;
    }

    const fullWorkout: WorkoutExtended = {
      ...workout,
      id: `workout_${Date.now()}`,
    };

    onWorkoutAdd(fullWorkout, schedule);
    
    // Reset
    setWorkout(null);
    setSchedule(null);
    setCurrentTab('workout');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setWorkout(null);
    setSchedule(null);
    setCurrentTab('workout');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Workout to Program</DialogTitle>
          <DialogDescription>
            Create a new workout and configure its schedule in the program.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workout">Workout Builder</TabsTrigger>
            <TabsTrigger value="schedule" disabled={!workout}>
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout" className="space-y-4 flex-grow overflow-y-auto">
            <WorkoutBuilder
              onSave={handleWorkoutSave}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 flex-grow overflow-y-auto">
            {workout && (
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <WorkoutScheduleSetup
                    schedule={schedule || undefined}
                    onChange={setSchedule}
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setCurrentTab('workout')}>
                    Back to Builder
                  </Button>
                  <Button onClick={handleScheduleSave} disabled={!schedule}>
                    Add to Program
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
