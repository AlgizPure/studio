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
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Workout, Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { collection } from 'firebase/firestore';

const workoutDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  level: z.string().optional(),
});

const workoutExercisesSchema = z.object({
  exercises: z.array(z.object({
    exerciseId: z.string(),
    name: z.string(),
    sets: z.preprocess((val) => Number(val), z.number().min(0).optional()),
    reps: z.preprocess((val) => Number(val), z.number().min(0).optional()),
    duration: z.string().optional(),
  }))
});

type WorkoutDetailsValues = z.infer<typeof workoutDetailsSchema>;
type WorkoutExercisesValues = z.infer<typeof workoutExercisesSchema>;

interface AddWorkoutToProgramDialogProps {
  onWorkoutAdd: (workout: Omit<Workout, 'id'>) => Promise<void>;
}

export function AddWorkoutToProgramDialog({ onWorkoutAdd }: AddWorkoutToProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [workoutDetails, setWorkoutDetails] = useState<Partial<Omit<Workout, 'id'>>>({});
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const { user } = useUser();
  const firestore = useFirestore();

  const allExercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: allExercises, loading: exercisesLoading } = useCollection<Exercise>(allExercisesQuery);


  const {
    register: registerDetails,
    handleSubmit: handleDetailsSubmit,
    reset: resetDetails,
    formState: { errors: detailsErrors },
  } = useForm<WorkoutDetailsValues>({
    resolver: zodResolver(workoutDetailsSchema),
  });
  
  const {
    register: registerExercises,
    control: exercisesControl,
    handleSubmit: handleExercisesSubmit,
    reset: resetExercises,
  } = useForm<WorkoutExercisesValues>({
      defaultValues: {
        exercises: [],
      }
  });

  const { fields, replace } = useFieldArray({
    control: exercisesControl,
    name: "exercises"
  });


  const onDetailsSubmit: SubmitHandler<WorkoutDetailsValues> = (data) => {
    setWorkoutDetails({
      name: data.name,
      description: data.description || '',
      level: data.level ? parseInt(data.level) : undefined,
    });
    setStep(2);
  };

  const handleNextToConfigure = async () => {
    if (selectedExercises.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Exercises Selected',
            description: 'Please select at least one exercise.',
        });
        return;
    }
    const exercisesToConfigure = selectedExercises.map(id => {
      const exercise = allExercises?.find(ex => ex.id === id);
      return { exerciseId: id, name: exercise?.name || 'Unknown', sets: undefined, reps: undefined, duration: '' };
    })
    replace(exercisesToConfigure);
    setStep(3);
  };

  const onFinalSubmit: SubmitHandler<WorkoutExercisesValues> = async (data) => {
    const finalWorkout: Omit<Workout, 'id'> = {
      ...workoutDetails,
      name: workoutDetails.name || 'Unnamed Workout',
      exercises: data.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
      })),
    }

    try {
      await onWorkoutAdd(finalWorkout);
      toast({
          title: 'Workout Added',
          description: `${finalWorkout.name} has been added to the program.`,
      });
      handleOpenChange(false); // This will trigger the reset
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error Adding Workout',
            description: 'Failed to add the workout to the program.'
        });
    }
  }


  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises(prev => 
        prev.includes(exerciseId) 
            ? prev.filter(id => id !== exerciseId)
            : [...prev, exerciseId]
    );
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setStep(1);
      resetDetails();
      resetExercises();
      setSelectedExercises([]);
      setSearchTerm('');
    }
    setIsOpen(open);
  }

  const filteredExercises = (allExercises || []).filter(ex => 
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
          <form onSubmit={handleDetailsSubmit(onDetailsSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Workout (Step 1 of 3)</DialogTitle>
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
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Select Exercises (Step 2 of 3)</DialogTitle>
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
                    {exercisesLoading ? <p className="p-4 text-muted-foreground">Loading exercises...</p> : (
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
                    )}
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
        {step === 3 && (
            <form onSubmit={handleExercisesSubmit(onFinalSubmit)}>
                 <DialogHeader>
                    <DialogTitle>Configure Exercises (Step 3 of 3)</DialogTitle>
                    <DialogDescription>Set the sets, reps, and duration for each exercise.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-96 w-full">
                        <div className="space-y-4 pr-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 glass">
                                    <h4 className="font-semibold">{field.name}</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor={`exercises[${index}].sets`} className="text-xs">Sets</Label>
                                            <Input id={`exercises[${index}].sets`} type="number" placeholder="3" {...registerExercises(`exercises.${index}.sets`)} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`exercises[${index}].reps`} className="text-xs">Reps</Label>
                                            <Input id={`exercises[${index}].reps`} type="number" placeholder="10" {...registerExercises(`exercises.${index}.reps`)} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`exercises[${index}].duration`} className="text-xs">Duration</Label>
                                            <Input id={`exercises[${index}].duration`} placeholder="60s" {...registerExercises(`exercises.${index}.duration`)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                 <DialogFooter className="justify-between sm:justify-between">
                    <Button variant="ghost" type="button" onClick={() => setStep(2)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit">
                        Finish & Add Workout
                    </Button>
                </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
