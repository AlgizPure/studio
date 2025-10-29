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
import { PlusCircle, Plus, X, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise, Day, ExerciseCategory, ExerciseParameter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { nanoid } from 'nanoid';
import { Separator } from './ui/separator';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hoursOfDay = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

const parameterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Parameter name can't be empty"),
  unit: z.string().min(1, "Parameter unit can't be empty"),
  defaultValue: z.preprocess((val) => Number(val), z.number()),
});

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url().optional().or(z.literal('')),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format.').optional(),
  days: z.array(z.string()).optional(),
  parameters: z.array(parameterSchema).optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface AddExerciseDialogProps {
  onExerciseAdd: (exercise: Omit<Exercise, 'id'>) => void;
  onExerciseUpdate?: (exercise: Exercise) => void;
  onExerciseDelete?: (exerciseId: string) => void;
  exerciseToEdit?: Exercise;
  trigger?: React.ReactNode;
  openManageCategories?: () => void;
  categories: ExerciseCategory[];
}

export function AddExerciseDialog({ onExerciseAdd, onExerciseUpdate, onExerciseDelete, exerciseToEdit, trigger, openManageCategories, categories }: AddExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!exerciseToEdit;
  const customImage = PlaceHolderImages.find(p => p.id === 'custom')?.imageUrl || 'https://picsum.photos/seed/custom/600/400';

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      parameters: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && exerciseToEdit) {
        reset({
            name: exerciseToEdit.name,
            categoryId: exerciseToEdit.categoryId,
            description: exerciseToEdit.description,
            image: exerciseToEdit.image,
            time: exerciseToEdit.time || '00:00',
            days: exerciseToEdit.days || [],
            parameters: exerciseToEdit.parameters || [],
        });
      } else {
        reset({
          name: '',
          categoryId: '',
          description: '',
          image: customImage,
          time: '00:00',
          days: [],
          parameters: [],
        });
      }
    }
  }, [isEditMode, exerciseToEdit, reset, isOpen, customImage]);


  const onSubmit: SubmitHandler<ExerciseFormValues> = (data) => {
    try {
      const finalData = {
        ...data,
        image: data.image || customImage,
        parameters: data.parameters && data.parameters.length > 0 ? data.parameters : undefined,
      };
      if (isEditMode && exerciseToEdit && onExerciseUpdate) {
          const updatedExercise: Exercise = {
              ...exerciseToEdit,
              ...finalData,
              days: data.days as Day[],
          };
          onExerciseUpdate(updatedExercise);
          toast({
              title: 'Exercise Updated',
              description: `${data.name} has been updated.`,
          });
      } else {
          const newExercise: Omit<Exercise, 'id'> = {
              ...finalData,
              custom: true,
              days: data.days as Day[],
          };
          onExerciseAdd(newExercise);
          toast({
              title: 'Exercise Added',
              description: `${data.name} has been added to your library.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was an error saving the exercise.'
        })
    }
  };

  const handleDelete = () => {
    if (isEditMode && exerciseToEdit && onExerciseDelete) {
        try {
            onExerciseDelete(exerciseToEdit.id);
            toast({
                title: 'Exercise Deleted',
                description: `${exerciseToEdit.name} has been removed.`,
                variant: 'destructive'
            });
            setIsOpen(false);
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'There was an error deleting the exercise.'
            })
        }
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new' && openManageCategories) {
        setIsOpen(false);
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }
  
  const [currentPath, setCurrentPath] = useState('');
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditMode ? 'Edit Exercise' : 'Add Custom Exercise'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your exercise.' : "Add a new exercise to your personal library. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g., Kettlebell Swings" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={handleCategoryChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Exercise Categories</SelectLabel>
                        {openManageCategories && (
                          <SelectItem value="add-new">
                              <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Add new category...</span>
                          </SelectItem>
                        )}
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the exercise briefly." {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

             <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
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
                {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
             </div>

            <div className="space-y-2">
              <Label>Days</Label>
              <div className="grid grid-cols-4 gap-2">
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
              {errors.days && <p className="text-sm text-destructive">{errors.days.message}</p>}
            </div>

            <Separator />
            
            <div className="space-y-2">
              <Label>Trackable Parameters</Label>
               {fields.map((field, index) => (
                <div key={field.id} className="p-2 border rounded-md space-y-2">
                    <div className="grid grid-cols-10 gap-2">
                        <Input
                            {...register(`parameters.${index}.name`)}
                            placeholder="Name"
                            className="col-span-4 h-8"
                        />
                         <Input
                            {...register(`parameters.${index}.unit`)}
                            placeholder="Unit"
                            className="col-span-2 h-8"
                        />
                        <Input
                            {...register(`parameters.${index}.defaultValue`)}
                            type="number"
                            placeholder="Default"
                            className="col-span-3 h-8"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                     {errors.parameters?.[index]?.name && <p className="text-sm text-destructive">{errors.parameters[index]?.name?.message}</p>}
                     {errors.parameters?.[index]?.unit && <p className="text-sm text-destructive">{errors.parameters[index]?.unit?.message}</p>}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ id: nanoid(5), name: '', unit: '', defaultValue: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Add Parameter
              </Button>
            </div>
          </div>
          <DialogFooter className="pt-4">
            {isEditMode && onExerciseDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="mr-auto">Delete</Button>
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
