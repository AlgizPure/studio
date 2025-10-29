'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CycleExercise, Exercise } from '@/lib/types';

interface DraggableExerciseProps {
  exercise: CycleExercise;
  exerciseData: Exercise | undefined;
  onUpdate: (updates: Partial<CycleExercise>) => void;
  onRemove: () => void;
}

export function DraggableExercise({
  exercise,
  exerciseData,
  onUpdate,
  onRemove,
}: DraggableExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.exerciseId + exercise.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-background/50"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <p className="font-medium">{exerciseData?.name || 'Unknown'}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Input
            placeholder="Reps"
            value={exercise.targetReps || ''}
            onChange={(e) => onUpdate({ targetReps: e.target.value })}
            className="h-8 w-24"
          />
          <Input
            placeholder="Weight"
            type="number"
            value={exercise.targetWeight || ''}
            onChange={(e) => onUpdate({ targetWeight: parseInt(e.target.value) || undefined })}
            className="h-8 w-24"
          />
          <Input
            placeholder="Rest (sec)"
            type="number"
            value={exercise.restAfter}
            onChange={(e) => onUpdate({ restAfter: parseInt(e.target.value) || 0 })}
            className="h-8 w-24"
          />
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="hover:text-destructive h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
