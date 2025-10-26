'use client';
import React, { useState } from 'react';

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
import { PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Program } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface AddProgramDialogProps {
  onProgramAdd: (program: Omit<Program, 'id' | 'isTemplate' | 'authorId'>) => Promise<void>;
  programToEdit?: Program;
  trigger?: React.ReactNode;
}

export function AddProgramDialog({ onProgramAdd, programToEdit, trigger }: AddProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!programToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: programToEdit?.name || '',
      description: programToEdit?.description || '',
    }
  });

  const onSubmit: SubmitHandler<ProgramFormValues> = async (data) => {
    try {
      if (isEditMode && programToEdit) {
        // Update logic here
      } else {
          await onProgramAdd(data);
          toast({
              title: 'Program Added',
              description: `${data.name} has been added to your programs.`,
          });
      }
      
      setIsOpen(false);
      reset();

    } catch (e) {
       toast({
          title: 'Error',
          description: 'Failed to add program.',
          variant: 'destructive',
      });
    }
  };
  
  const dialogTrigger = trigger ? trigger : (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Program
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
            <DialogTitle className="font-headline">{isEditMode ? 'Edit Program' : 'Add New Program'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your program.' : "Create a new workout program. You can add workouts to it later."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="e.g., Summer Shred" className="col-span-3" {...register('name')} />
            </div>
            {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" placeholder="Describe the main goal of this program." className="col-span-3" {...register('description')} />
            </div>
             {errors.description && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Save Program'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
