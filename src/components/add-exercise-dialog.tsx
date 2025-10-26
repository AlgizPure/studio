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
import { PlusCircle, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Strength', 'Cardio', 'Bio-dynamics', 'TRX', 'Bodyweight', 'Static']),
  description: z.string().min(1, 'Description is required'),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface AddExerciseDialogProps {
  onExerciseAdd: (exercise: Exercise) => void;
}

export function AddExerciseDialog({ onExerciseAdd }: AddExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
  });

  const onSubmit: SubmitHandler<ExerciseFormValues> = (data) => {
    const newExercise: Exercise = {
      id: `ex${Date.now()}`,
      ...data,
      image: 'https://picsum.photos/seed/custom/600/400',
      custom: true,
    };
    onExerciseAdd(newExercise);
    toast({
      title: 'Exercise Added',
      description: `${data.name} has been added to your library.`,
    });
    setIsOpen(false);
    reset();
  };
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isLibraryPage = currentPath.includes('/library');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isLibraryPage ? (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
        ) : (
            <Button variant="ghost" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">Add Custom Exercise</DialogTitle>
            <DialogDescription>
              Add a new exercise to your personal library. Click save when you're done.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
          <DialogFooter>
            <Button type="submit">Save Exercise</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
