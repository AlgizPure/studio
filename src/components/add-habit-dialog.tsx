
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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  goal: z.string().optional(),
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
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
  });

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    const newHabit: Habit = {
      id: `hb${Date.now()}`,
      name: data.name,
      goal: data.goal,
      icon: BrainCircuit, // Default icon for now
      completed: false,
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

          </div>
          <DialogFooter>
            <Button type="submit">Save Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
