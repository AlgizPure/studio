
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
import type { Habit, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  onHabitAdd: (habit: Habit) => void;
}

export function AddHabitDialog({ onHabitAdd }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
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
    defaultValues: {
      days: [],
      usePomodoro: false,
    },
  });

  const watchedDays = watch('days') || [];

  const handleAllDaysChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setValue('days', daysOfWeek, { shouldValidate: true });
    } else {
      setValue('days', [], { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    const newHabit: Habit = {
      id: `hb${Date.now()}`,
      name: data.name,
      goal: data.goal,
      completed: false,
      days: data.days as Day[],
      ...(data.usePomodoro && { pomodoro: { cycles: 1 } }),
    };
    onHabitAdd(newHabit);
    toast({
      title: 'Habit Added',
      description: `${data.name} has been added to your list.`,
    });
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">Add Custom Habit</DialogTitle>
            <DialogDescription>
              Add a new habit to your personal list. Click save when you're done.
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
                  <div className="col-span-3 grid grid-cols-3 gap-y-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`day-habit-${day}`}
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
                        <Label htmlFor={`day-habit-${day}`} className="text-sm font-normal">{day.substring(0,3)}</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="all-days-habit"
                        checked={watchedDays.length === daysOfWeek.length}
                        onCheckedChange={handleAllDaysChange}
                      />
                      <Label htmlFor="all-days-habit" className="text-sm font-normal">All Days</Label>
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
                                id="usePomodoro"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="usePomodoro" className="text-sm font-normal">Enable Pomodoro Timer</Label>
                        </div>
                    )}
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
