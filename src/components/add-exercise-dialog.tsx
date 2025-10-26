
'use client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Plus, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hoursOfDay = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Strength', 'Cardio', 'Bio-dynamics', 'TRX', 'Bodyweight', 'Static']),
  description: z.string().min(1, 'Description is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format.').optional(),
  days: z.array(z.string()).optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface AddExerciseDialogProps {
  onExerciseAdd: (exercise: Exercise) => void;
  onExerciseUpdate?: (exercise: Exercise) => void;
  onExerciseDelete?: (exerciseId: string) => void;
  exerciseToEdit?: Exercise;
  trigger?: React.ReactNode;
}

export function AddExerciseDialog({ onExerciseAdd, onExerciseUpdate, onExerciseDelete, exerciseToEdit, trigger }: AddExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!exerciseToEdit;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
  });

  useEffect(() => {
    if (isEditMode && exerciseToEdit) {
      setValue('name', exerciseToEdit.name);
      setValue('category', exerciseToEdit.category);
      setValue('description', exerciseToEdit.description);
      setValue('time', exerciseToEdit.time || '00:00');
      setValue('days', exerciseToEdit.days || []);
    } else {
      reset({
        name: '',
        description: '',
        time: '00:00',
        days: [],
      });
    }
  }, [isEditMode, exerciseToEdit, setValue, reset]);


  const onSubmit: SubmitHandler<ExerciseFormValues> = (data) => {
    if (isEditMode && exerciseToEdit && onExerciseUpdate) {
        const updatedExercise: Exercise = {
            ...exerciseToEdit,
            name: data.name,
            category: data.category,
            description: data.description,
            time: data.time,
            days: data.days as Day[],
        };
        onExerciseUpdate(updatedExercise);
        toast({
            title: 'Exercise Updated',
            description: `${data.name} has been updated.`,
        });
    } else {
        const newExercise: Exercise = {
            id: `ex${Date.now()}`,
            name: data.name,
            category: data.category,
            description: data.description,
            time: data.time,
            days: data.days as Day[],
            image: 'https://picsum.photos/seed/custom/600/400',
            custom: true,
        };
        onExerciseAdd(newExercise);
        toast({
            title: 'Exercise Added',
            description: `${data.name} has been added to your library.`,
        });
    }
    
    setIsOpen(false);
    reset();
  };

  const handleDelete = () => {
    if (isEditMode && exerciseToEdit && onExerciseDelete) {
        onExerciseDelete(exerciseToEdit.id);
        toast({
            title: 'Exercise Deleted',
            description: `${exerciseToEdit.name} has been removed.`,
            variant: 'destructive'
        });
        setIsOpen(false);
    }
  }
  
  const [currentPath, setCurrentPath] = useState('');
  
  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isLibraryPage = currentPath.includes('/library');

  const dialogTrigger = trigger ? trigger : (
     isLibraryPage ? (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
        ) : (
            <Button variant="ghost" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
            </Button>
        )
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditMode ? 'Edit Exercise' : 'Add Custom Exercise'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your exercise.' : "Add a new exercise to your personal library. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="e.g., Kettlebell Swings" className="col-span-3" {...register('name')} />
            </div>
            {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Strength">Strength</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Bio-dynamics">Bio-dynamics</SelectItem>
                      <SelectItem value="TRX">TRX</SelectItem>
                      <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                      <SelectItem value="Static">Static</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
             {errors.category && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.category.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" placeholder="Describe the exercise briefly." className="col-span-3" {...register('description')} />
            </div>
             {errors.description && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.description.message}</p>}

             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                    Start Time
                </Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                       <Select
                        value={field.value?.split(':')[0] || '00'}
                        onValueChange={(hour) => {
                          const minute = field.value?.split(':')[1] || '00';
                          field.onChange(`${hour}:${minute}`);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                           {hoursOfDay.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={field.value?.split(':')[1] || '00'}
                        onValueChange={(minute) => {
                          const hour = field.value?.split(':')[0] || '00';
                          field.onChange(`${hour}:${minute}`);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00">00</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="45">45</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
             </div>
             {errors.time && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.time.message}</p>}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Days
              </Label>
              <div className="col-span-3 grid grid-cols-3 gap-2">
                <Controller
                  name="days"
                  control={control}
                  render={({ field }) => (
                    <>
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center gap-2">
                          <Checkbox
                            id={`day-${day}-${exerciseToEdit?.id || 'new'}`}
                            checked={field.value?.includes(day)}
                            onCheckedChange={(checked) => {
                              const currentDays = field.value || [];
                              if (checked) {
                                field.onChange([...currentDays, day]);
                              } else {
                                field.onChange(currentDays.filter(d => d !== day));
                              }
                            }}
                          />
                          <Label htmlFor={`day-${day}-${exerciseToEdit?.id || 'new'}`} className="text-sm font-normal">{day.substring(0,3)}</Label>
                        </div>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>
             {errors.days && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.days.message}</p>}
          </div>
          <DialogFooter>
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your exercise.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Save Exercise'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    