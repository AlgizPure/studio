'use client';

import { useState } from 'react';
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
import { BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface LogExerciseDialogProps {
  exercise: Exercise;
  onLog: (exercise: Exercise, values: { [key: string]: number }) => void;
  isCompleted: boolean;
}

export function LogExerciseDialog({ exercise, onLog, isCompleted }: LogExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const schema = z.object(
    (exercise.parameters || []).reduce((acc, param) => {
      acc[param.id] = z.preprocess((val) => Number(val), z.number().min(0, 'Must be non-negative'));
      return acc;
    }, {} as { [key: string]: z.ZodType<any, any> })
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (exercise.parameters || []).reduce((acc, param) => {
      acc[param.id] = param.defaultValue;
      return acc;
    }, {} as any),
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    try {
      onLog(exercise, data);
      toast({
        title: 'Exercise Logged!',
        description: `${exercise.name} has been marked as complete.`,
      });
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error logging the exercise.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isCompleted ? (
            <Button variant="ghost" size="icon" className="mr-4 text-green-500 cursor-not-allowed">
              <CheckCircle2 />
            </Button>
        ) : (
            <Button variant="ghost" size="icon" className="mr-4">
              <BookOpenCheck />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">Log: {exercise.name}</DialogTitle>
            <DialogDescription>Enter the values for today's workout. Your changes will be saved.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(exercise.parameters || []).map((param) => (
              <div key={param.id} className="space-y-2">
                <Label htmlFor={param.id}>
                  {param.name} ({param.unit})
                </Label>
                <Input
                  id={param.id}
                  type="number"
                  step="any"
                  {...register(param.id)}
                />
                {errors[param.id] && <p className="text-sm text-destructive">{errors[param.id]?.message as string}</p>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Log & Complete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
