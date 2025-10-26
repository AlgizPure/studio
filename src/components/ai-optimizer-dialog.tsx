'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getOptimizedRoutine } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';

const schema = z.object({
  goals: z.string().min(10, 'Please describe your goals in more detail.'),
  availability: z.string().min(10, 'Please describe your availability in more detail.'),
  preferredExercises: z.string().min(10, 'Please list some preferred exercises.'),
  customExercises: z.string().optional(),
});

type FormFields = z.infer<typeof schema>;

export function AiOptimizerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      goals: 'Develop speed and muscle definition, and reduce belly fat.',
      availability: '6 times a week, usually in the first half of the day.',
      preferredExercises: 'Strength training (Mon, Wed, Fri), bio-dynamics/functional patterns (Tue, Thu, Sat), trail running, static exercises (Alexander Zass cycle).',
      customExercises: 'TRX exercises, bodyweight exercises for when I travel.'
    }
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getOptimizedRoutine(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestion(result.data.suggestedSchedule);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
      setSuggestion(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          AI Optimizer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-primary"/>
            AI Routine Optimizer
            </DialogTitle>
          <DialogDescription>
            Describe your fitness preferences and let AI create a balanced weekly schedule for you.
          </DialogDescription>
        </DialogHeader>

        {suggestion ? (
           <div className="space-y-4">
            <h3 className="font-semibold">Suggested Weekly Schedule:</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap font-body">{suggestion}</pre>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSuggestion(null)}>Back to Form</Button>
                <Button onClick={() => {
                    toast({ title: "Schedule Applied!", description: "Your new schedule is now active."});
                    handleOpenChange(false);
                }}>Apply Schedule</Button>
            </DialogFooter>
           </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Primary Goals</Label>
              <Textarea id="goals" {...register('goals')} rows={3} />
              {errors.goals && <p className="text-sm text-destructive">{errors.goals.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea id="availability" {...register('availability')} rows={2} />
              {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredExercises">Preferred & Custom Exercises</Label>
              <Textarea id="preferredExercises" {...register('preferredExercises')} rows={4} />
              {errors.preferredExercises && <p className="text-sm text-destructive">{errors.preferredExercises.message}</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Schedule'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
