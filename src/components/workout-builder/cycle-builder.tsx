'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical } from 'lucide-react';
import type { Cycle, CycleType, CycleExercise, Exercise } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { DraggableExercise } from './draggable-exercise';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface CycleBuilderProps {
  cycle: Cycle;
  onUpdate: (cycle: Cycle) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function CycleBuilder({ cycle, onUpdate, onDelete, dragHandleProps }: CycleBuilderProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises } = useCollection<Exercise>(exercisesQuery);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCycleTypeChange = (type: CycleType) => {
    onUpdate({ ...cycle, type });
  };

  const handleRepetitionsChange = (reps: number) => {
    onUpdate({ ...cycle, repetitions: reps });
  };

  const handleRestChange = (rest: number) => {
    onUpdate({ ...cycle, restAfter: rest });
  };

  const handleAddExercise = (exerciseId: string) => {
    if (!exerciseId) return;
    const newExercise: CycleExercise = {
      exerciseId,
      order: cycle.exercises.length,
      targetReps: '8-12',
      restAfter: 60,
    };
    
    onUpdate({
      ...cycle,
      exercises: [...cycle.exercises, newExercise],
    });
  };

  const handleRemoveExercise = (index: number) => {
    onUpdate({
      ...cycle,
      exercises: cycle.exercises.filter((_, i) => i !== index),
    });
  };

  const handleExerciseUpdate = (index: number, updates: Partial<CycleExercise>) => {
    const updatedExercises = [...cycle.exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    onUpdate({ ...cycle, exercises: updatedExercises });
  };

  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cycle.exercises.findIndex(
        (ex) => ex.exerciseId + ex.order === active.id
      );
      const newIndex = cycle.exercises.findIndex(
        (ex) => ex.exerciseId + ex.order === over.id
      );

      const reorderedExercises = arrayMove(cycle.exercises, oldIndex, newIndex).map(
        (ex, idx) => ({ ...ex, order: idx })
      );

      onUpdate({ ...cycle, exercises: reorderedExercises });
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            Cycle {cycle.order + 1}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete} className="hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cycle Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`type-${cycle.id}`}>Type</Label>
            <Select value={cycle.type} onValueChange={handleCycleTypeChange}>
              <SelectTrigger id={`type-${cycle.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="circuit">Circuit</SelectItem>
                <SelectItem value="superset">Superset</SelectItem>
                <SelectItem value="dropset">Dropset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor={`reps-${cycle.id}`}>Repetitions</Label>
            <Input
              id={`reps-${cycle.id}`}
              type="number"
              min="1"
              value={cycle.repetitions}
              onChange={(e) => handleRepetitionsChange(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div>
            <Label htmlFor={`rest-${cycle.id}`}>Rest After (sec)</Label>
            <Input
              id={`rest-${cycle.id}`}
              type="number"
              min="0"
              value={cycle.restAfter}
              onChange={(e) => handleRestChange(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Exercises with Drag-and-Drop */}
        <div className="space-y-2">
          <Label>Exercises</Label>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleExerciseDragEnd}
          >
            <SortableContext
              items={cycle.exercises.map((ex) => ex.exerciseId + ex.order)}
              strategy={verticalListSortingStrategy}
            >
              {cycle.exercises.map((ex, index) => {
                const exerciseData = exercises?.find((e) => e.id === ex.exerciseId);
                return (
                  <DraggableExercise
                    key={ex.exerciseId + ex.order}
                    exercise={ex}
                    exerciseData={exerciseData}
                    onUpdate={(updates) => handleExerciseUpdate(index, updates)}
                    onRemove={() => handleRemoveExercise(index)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
          
          <Select onValueChange={handleAddExercise} value="">
            <SelectTrigger>
              <SelectValue placeholder="Add exercise from library..." />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
