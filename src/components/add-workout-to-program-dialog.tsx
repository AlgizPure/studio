'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const workoutDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  level: z.string().optional(),
});


type WorkoutDetailsValues = z.infer<typeof workoutDetailsSchema>;

interface AddWorkoutToProgramDialogProps {
  onWorkoutAdd: (workout: Omit<Workout, 'id' | 'exercises'>) => Promise<void>;
}

export function AddWorkoutToProgramDialog({ onWorkoutAdd }: AddWorkoutToProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const {
    register: registerDetails,
    handleSubmit: handleDetailsSubmit,
    reset: resetDetails,
    formState: { errors: detailsErrors },
  } = useForm<WorkoutDetailsValues>({
    resolver: zodResolver(workoutDetailsSchema),
  });
  
  const onDetailsSubmit: SubmitHandler<WorkoutDetailsValues> = async (data) => {
    const finalWorkout: Omit<Workout, 'id' | 'exercises'> = {
      name: data.name,
      description: data.description || '',
      level: data.level ? parseInt(data.level) : undefined,
    }

    try {
      await onWorkoutAdd(finalWorkout);
      toast({
          title: 'Workout Added',
          description: `${finalWorkout.name} has been added to the program.`,
      });
      handleOpenChange(false);
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error Adding Workout',
            description: 'Failed to add the workout to the program.'
        });
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDetails();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleDetailsSubmit(onDetailsSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Workout</DialogTitle>
            <DialogDescription>Define the details for your new workout.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input id="name" {...registerDetails('name')} placeholder="e.g., Upper Body Strength" />
              {detailsErrors.name && <p className="text-sm text-destructive">{detailsErrors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...registerDetails('description')} placeholder="Describe the focus of this workout." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
               <Select onValueChange={(value) => registerDetails('level').onChange({ target: { value } })} name={registerDetails('level').name}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a level (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Beginner)</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3 (Intermediate)</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5 (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              Add Workout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
