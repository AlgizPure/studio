'use client';

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
import { Plus } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  onHabitAdd: (habit: Omit<Habit, 'id'>) => Promise<void>;
  onHabitUpdate?: (habit: Habit) => Promise<void>;
  onHabitDelete?: (habitId: string) => Promise<void>;
  habitToEdit?: Habit;
  trigger?: React.ReactNode;
  openManageCategories: () => void;
  categories: HabitCategory[];
}

export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!habitToEdit;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && habitToEdit) {
        setValue('name', habitToEdit.name);
        setValue('categoryId', habitToEdit.categoryId);
        setValue('goal', habitToEdit.goal);
        setValue('days', habitToEdit.days || []);
        setValue('usePomodoro', !!habitToEdit.pomodoro);
      } else {
          reset({
              name: '',
              categoryId: '',
              goal: '',
              days: [],
              usePomodoro: false,
          });
      }
    }
  }, [isEditMode, habitToEdit, setValue, reset, isOpen]);


  const watchedDays = watch('days') || [];

  const handleAllDaysChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setValue('days', daysOfWeek, { shouldValidate: true });
    } else {
      setValue('days', [], { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<HabitFormValues> = async (data) => {
    try {
      if(isEditMode && habitToEdit && onHabitUpdate) {
          const updatedHabit: Habit = {
              ...habitToEdit,
              name: data.name,
              categoryId: data.categoryId,
              goal: data.goal,
              days: data.days as Day[],
              pomodoro: data.usePomodoro ? (habitToEdit.pomodoro || { cycles: 1 }) : undefined,
          };
          await onHabitUpdate(updatedHabit);
          toast({
              title: 'Habit Updated',
              description: `${data.name} has been updated.`,
          });
      } else {
          const newHabit: Omit<Habit, 'id'> = {
            name: data.name,
            categoryId: data.categoryId,
            goal: data.goal,
            completed: false,
            days: data.days as Day[],
            ...(data.usePomodoro && { pomodoro: { cycles: 1 } }),
          };
          await onHabitAdd(newHabit);
          toast({
            title: 'Habit Added',
            description: `${data.name} has been added to your list.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error saving the habit.'
      });
    }
  };

  const handleDelete = async () => {
    if(isEditMode && habitToEdit && onHabitDelete) {
      try {
        await onHabitDelete(habitToEdit.id);
        toast({
            title: 'Habit Deleted',
            description: `${habitToEdit.name} has been removed.`,
            variant: 'destructive',
        });
        setIsOpen(false);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was an error deleting the habit.'
        });
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
        setIsOpen(false);
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }

  const dialogTrigger = trigger ? trigger : (
    <Button variant="ghost" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditMode ? 'Edit Habit' : 'Add Custom Habit'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for your habit.' : "Add a new habit to your personal list. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="e.g., Drink Water" className="col-span-3" {...register('name')} />
            </div>
            {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                    Category
                </Label>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={handleCategoryChange} value={field.value}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Habit Categories</SelectLabel>
                                    <SelectItem value="add-new">
                                        <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Add new category...</span>
                                    </SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            {errors.categoryId && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.categoryId.message}</p>}


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal
              </Label>
              <Input id="goal" placeholder="e.g., 8 glasses" className="col-span-3" {...register('goal')} />
            </div>
            {errors.goal && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.goal.message}</p>}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Days
              </Label>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <div className="col-span-3 grid grid-cols-4 items-center gap-y-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`day-habit-${day}-${habitToEdit?.id || 'new'}`}
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
                        <Label htmlFor={`day-habit-${day}-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">{day.substring(0,3)}</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`all-days-habit-${habitToEdit?.id || 'new'}`}
                        checked={watchedDays.length === daysOfWeek.length}
                        onCheckedChange={handleAllDaysChange}
                      />
                      <Label htmlFor={`all-days-habit-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">All</Label>
                    </div>
                  </div>
                )}
              />
            </div>
             {errors.days && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.days.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usePomodoro" className="text-right">Pomodoro</Label>
                <Controller
                    name="usePomodoro"
                    control={control}
                    render={({ field }) => (
                        <div className="col-span-3 flex items-center gap-2">
                            <Checkbox
                                id={`usePomodoro-${habitToEdit?.id || 'new'}`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label htmlFor={`usePomodoro-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">Enable Pomodoro Timer</Label>
                        </div>
                    )}
                />
            </div>
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
                            This action cannot be undone. This will permanently delete your habit.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Save Habit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
