'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import type { Cycle, CycleType, CycleExercise, Exercise, ExerciseCategory } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DraggableExercise } from './draggable-exercise';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

/**
 * @fileoverview Компонент для создания и редактирования одного цикла упражнений в конструкторе тренировок.
 */

interface CycleBuilderProps {
  /** Объект цикла для редактирования. */
  cycle: Cycle;
  /** Callback-функция при обновлении данных цикла. */
  onUpdate: (cycle: Cycle) => void;
  /** Callback-функция при удалении цикла. */
  onDelete: () => void;
  /** Пропсы для элемента, за который можно перетаскивать. */
  dragHandleProps?: any;
}

/**
 * Компонент `CycleBuilder` предоставляет интерфейс для настройки одного цикла
 * тренировки, включая его тип, количество повторений, отдых после, а также
 * добавление, удаление, редактирование и изменение порядка упражнений внутри него.
 * @param {CycleBuilderProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function CycleBuilder({ cycle, onUpdate, onDelete, dragHandleProps }: CycleBuilderProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  
  const exercisesQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/exercises`) : null), [user, firestore]);
  const { data: exercises } = useCollection<Exercise>(exercisesQuery);
  
  const exerciseCategoriesQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null), [user, firestore]);
  const { data: exerciseCategories } = useCollection<ExerciseCategory>(exerciseCategoriesQuery);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  /** Обрабатывает перетаскивание упражнения в списке. */
  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cycle.exercises.findIndex(ex => ex.exerciseId + ex.order === active.id);
      const newIndex = cycle.exercises.findIndex(ex => ex.exerciseId + ex.order === over.id);
      const reorderedExercises = arrayMove(cycle.exercises, oldIndex, newIndex).map((ex, idx) => ({ ...ex, order: idx }));
      onUpdate({ ...cycle, exercises: reorderedExercises });
    }
  };

  // ... (остальные обработчики: handleCycleTypeChange, handleAddExercise и т.д.)

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div {...dragHandleProps} className="cursor-grab"><GripVertical /></div>
            Цикл {cycle.order + 1}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Настройки цикла */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ... (поля для типа, повторений, отдыха) ... */}
        </div>

        {/* Упражнения с Drag-and-Drop */}
        <div className="space-y-2">
          <Label>Упражнения</Label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExerciseDragEnd}>
            <SortableContext items={cycle.exercises.map(ex => ex.exerciseId + ex.order)} strategy={verticalListSortingStrategy}>
              {cycle.exercises.map((ex, index) => (
                <DraggableExercise
                  key={ex.exerciseId + ex.order}
                  exercise={ex}
                  exerciseData={exercises?.find(e => e.id === ex.exerciseId)}
                  // ... (props)
                />
              ))}
            </SortableContext>
          </DndContext>
          <Select onValueChange={handleAddExercise} value="">
            <SelectTrigger><SelectValue placeholder="Добавить упражнение из библиотеки..." /></SelectTrigger>
            <SelectContent>
              {/* ... (опции для добавления упражнений) ... */}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      {/* ... (диалоговые окна AddExerciseDialog и ManageCategoriesDialog) ... */}
    </Card>
  );
}
