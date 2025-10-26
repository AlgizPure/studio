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
import { PlusCircle, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Workout, Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { exercises as allExercises } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';

const workoutDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  level: z.string().optional(),
});

type WorkoutDetailsValues = z.infer<typeof workoutDetailsSchema>;

interface AddWorkoutToProgramDialogProps {
  programId: string;
  onWorkoutAdd: (workout: Workout) => void;
}

export function AddWorkoutToProgramDialog({ programId, onWorkoutAdd }: AddWorkoutToProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [workoutDetails, setWorkoutDetails] = useState<Partial<Workout>>({});
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkoutDetailsValues>({
    resolver: zodResolver(workoutDetailsSchema),
  });

  const handleDetailsSubmit: SubmitHandler<WorkoutDetailsValues> = (data) => {
    setWorkoutDetails({
      id: `wk${Date.now()}`,
      name: data.name,
      description: data.description || '',
      level: data.level ? parseInt(data.level) : undefined,
    });
    setStep(2);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises(prev => 
        prev.includes(exerciseId) 
            ? prev.filter(id => id !== exerciseId)
            : [...prev, exerciseId]
    );
  };
  
  const handleNextToConfigure = () => {
    if (selectedExercises.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Exercises Selected',
            description: 'Please select at least one exercise.',
        });
        return;
    }
    // In the future, this will go to step 3 (configure sets/reps)
    // For now, we'll just create the workout
     const newWorkout: Workout = {
      ...workoutDetails,
      exercises: selectedExercises.map(exId => ({ exerciseId: exId })),
    } as Workout;
    
    onWorkoutAdd(newWorkout);
    toast({
        title: 'Workout Added',
        description: `${newWorkout.name} has been added to the program.`,
    });
    
    // Reset and close
    setIsOpen(false);
    setStep(1);
    reset();
    setSelectedExercises([]);
    setSearchTerm('');
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setStep(1);
      reset();
      setSelectedExercises([]);
      setSearchTerm('');
    }
    setIsOpen(open);
  }

  const filteredExercises = allExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        {step === 1 && (
          <form onSubmit={handleSubmit(handleDetailsSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Workout (Step 1 of 4)</DialogTitle>
              <DialogDescription>Define the details for your new workout.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input id="name" {...register('name')} placeholder="e.g., Upper Body Strength" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Describe the focus of this workout." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select {...register('level')}>
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
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Select Exercises (Step 2 of 4)</DialogTitle>
              <DialogDescription>Choose exercises from your library to include in this workout.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search exercises..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4 space-y-2">
                    {filteredExercises.map(exercise => (
                        <div key={exercise.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50">
                            <Checkbox 
                                id={`ex-select-${exercise.id}`}
                                checked={selectedExercises.includes(exercise.id)}
                                onCheckedChange={() => handleExerciseToggle(exercise.id)}
                            />
                            <Label htmlFor={`ex-select-${exercise.id}`} className="font-medium cursor-pointer w-full">
                                {exercise.name}
                            </Label>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </div>
            <DialogFooter className="justify-between sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextToConfigure}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}