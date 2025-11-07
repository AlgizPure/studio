'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import type { Cycle, CycleType, CycleExercise, Exercise, ExerciseCategory } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useUserCollection } from '@/hooks/use-user-collection';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const dialogTriggerRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAddExerciseDialogOpen && dialogTriggerRef.current) {
      dialogTriggerRef.current.click();
    }
  }, [isAddExerciseDialogOpen]);

  const { data: exercises } = useUserCollection<Exercise>('exercises');
  const { data: exerciseCategories } = useUserCollection<ExerciseCategory>('exerciseCategories');

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
    if (exerciseId === 'create-new') {
      setIsAddExerciseDialogOpen(true);
      return;
    }
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

  const handleExerciseAdd = (newExercise: Omit<Exercise, 'id'>) => {
    if (!user || !firestore) return;
    const exercisesCollection = collection(firestore, `users/${user.uid}/exercises`);
    addDoc(exercisesCollection, { ...newExercise, authorId: user.uid })
      .then((docRef) => {
        // After exercise is created, add it to the cycle
        const newCycleExercise: CycleExercise = {
          exerciseId: docRef.id,
          order: cycle.exercises.length,
          targetReps: '8-12',
          restAfter: 60,
        };
        onUpdate({
          ...cycle,
          exercises: [...cycle.exercises, newCycleExercise],
        });
        setIsAddExerciseDialogOpen(false);
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          operation: 'create',
          path: exercisesCollection.path,
          requestResourceData: newExercise,
        }));
      });
  };

  const handleAddCategory = (name: string) => {
    if (!user || !firestore) return;
    const categoriesCollection = collection(firestore, `users/${user.uid}/exerciseCategories`);
    addDoc(categoriesCollection, { name }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: categoriesCollection.path,
        requestResourceData: { name },
      }));
    });
  };

  const handleUpdateCategory = (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, category.id);
    updateDoc(categoryDoc, { name: category.name }).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'update',
        path: categoryDoc.path,
        requestResourceData: { name: category.name },
      }));
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const categoryDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId);
    deleteDoc(categoryDoc).catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'delete',
        path: categoryDoc.path,
      }));
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
              <SelectGroup>
                <SelectLabel>Add Exercise</SelectLabel>
                <SelectItem value="create-new">
                  <span className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> Create new exercise...
                  </span>
                </SelectItem>
                {exercises && exercises.length > 0 && (
                  <>
                    <SelectLabel className="mt-2">From Library</SelectLabel>
                    {exercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <AddExerciseDialog
        onExerciseAdd={(exercise) => {
          handleExerciseAdd(exercise);
          setIsAddExerciseDialogOpen(false);
        }}
        categories={exerciseCategories || []}
        openManageCategories={() => setIsManageCategoriesOpen(true)}
        trigger={
          <button 
            ref={dialogTriggerRef}
            style={{ display: 'none' }}
          />
        }
      />
      <ManageCategoriesDialog
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        categories={exerciseCategories || []}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        categoryType="Exercise"
      />
    </Card>
  );
}
