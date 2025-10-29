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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Program } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  durationType: z.enum(['fixed', 'infinite']),
  startDate: z.date(),
  duration: z.object({
    value: z.preprocess(val => Number(val), z.number().min(1).optional()),
    unit: z.enum(['days', 'weeks', 'months']).optional(),
  }).optional(),
  goal: z.string().optional(),
  tags: z.string().optional(), // we'll parse this as a comma-separated string
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface AddProgramDialogProps {
  onProgramAdd: (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workouts'>) => void;
  programToEdit?: Program;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AddProgramDialog({ 
  onProgramAdd, 
  programToEdit, 
  open,
  onOpenChange,
  children
}: AddProgramDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!programToEdit;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
  });

  const durationType = watch('durationType');

  useEffect(() => {
    if (open) {
      if (programToEdit) {
        reset({
          name: programToEdit.name,
          description: programToEdit.description || '',
          durationType: programToEdit.durationType,
          startDate: new Date(programToEdit.startDate),
          goal: programToEdit.goal || '',
          tags: programToEdit.tags?.join(', ') || '',
        });
      } else {
        reset({
            name: '',
            description: '',
            durationType: 'fixed',
            startDate: new Date(),
            duration: { value: 8, unit: 'weeks' },
            goal: '',
            tags: '',
        });
      }
    }
  }, [programToEdit, open, reset]);

  const onSubmit: SubmitHandler<ProgramFormValues> = (data) => {
    try {
      let endDate: string | undefined;
      if (data.durationType === 'fixed' && data.duration?.value && data.duration?.unit) {
        const start = new Date(data.startDate);
        const { value, unit } = data.duration;
        
        if (unit === 'days') {
          start.setDate(start.getDate() + value);
        } else if (unit === 'weeks') {
          start.setDate(start.getDate() + (value * 7));
        } else if (unit === 'months') {
          start.setMonth(start.getMonth() + value);
        }
        endDate = start.toISOString();
      }

      const tags = data.tags 
        ? data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0).map(t => t.startsWith('#') ? t : `#${t}`)
        : [];

      const programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workouts' > = {
        name: data.name,
        description: data.description || '',
        startDate: data.startDate.toISOString(),
        endDate,
        durationType: data.durationType,
        status: 'draft',
        goal: data.goal || '',
        tags,
      };
      
      onProgramAdd(programData);
      
      toast({
        title: isEditMode ? 'Program Updated' : 'Program Created',
        description: `${data.name} has been ${isEditMode ? 'updated' : 'created'}.`,
      });
      
      onOpenChange(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to save program.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Program' : 'Create New Program'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your program.' : 'Create a new training program. Add workouts later.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 pr-2">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input 
                id="name" 
                placeholder="e.g., Summer Shred" 
                className="col-span-3" 
                {...register('name')} 
              />
            </div>
            {errors.name && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
            
            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea 
                id="description" 
                placeholder="Describe the goal and structure..." 
                className="col-span-3" 
                {...register('description')} 
              />
            </div>
            
            {/* Duration Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durationType" className="text-right">
                Duration Type *
              </Label>
              <Controller
                name="durationType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Duration</SelectItem>
                      <SelectItem value="infinite">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date *
              </Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'col-span-3 justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Duration (only for fixed) */}
            {durationType === 'fixed' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Duration *</Label>
                <div className="col-span-3 flex gap-2">
                  <Controller
                    name="duration.value"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        placeholder="8"
                        className="w-20"
                        {...field}
                        value={field.value || ''}
                      />
                    )}
                  />
                  <Controller
                    name="duration.unit"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Goal */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal
              </Label>
              <Input 
                id="goal" 
                placeholder="e.g., mass_gain, fat_loss" 
                className="col-span-3" 
                {...register('goal')} 
              />
            </div>

            {/* Tags */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input 
                id="tags" 
                placeholder="силовая, дома, новичок" 
                className="col-span-3" 
                {...register('tags')} 
              />
              <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                Separate tags with commas. # will be added automatically.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {isEditMode ? 'Save Changes' : 'Create Program'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
