'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { WorkoutExtended, Cycle } from '@/lib/types';
import { DraggableCycle } from './draggable-cycle';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

/**
 * @fileoverview Основной компонент-конструктор для создания и редактирования тренировок.
 */

interface WorkoutBuilderProps {
  /** Частичный или полный объект тренировки для редактирования. */
  workout?: Partial<WorkoutExtended>;
  /** Callback-функция при сохранении тренировки. */
  onSave: (workout: Omit<WorkoutExtended, 'id'>) => void;
  /** Callback-функция при отмене. */
  onCancel: () => void;
}

/**
 * `WorkoutBuilder` предоставляет полный интерфейс для создания или изменения
 * структуры тренировки. Он включает поля для названия и описания, а также
 * позволяет добавлять, удалять и переупорядочивать циклы упражнений.
 * @param {WorkoutBuilderProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function WorkoutBuilder({ workout, onSave, onCancel }: WorkoutBuilderProps) {
  const [name, setName] = useState(workout?.name || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [cycles, setCycles] = useState<Cycle[]>(workout?.cycles || []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  /**
   * Сохраняет данные тренировки.
   */
  const handleSave = () => {
    const orderedCycles = cycles.map((cycle, index) => ({ ...cycle, order: index }));
    const workoutData: Omit<WorkoutExtended, 'id'> = {
      name,
      description,
      cycles: orderedCycles,
      targetMuscles: [],
      estimatedDuration: 60, // Placeholder
      status: workout?.status || 'inactive',
    };
    onSave(workoutData);
  };

  /**
   * Добавляет новый пустой цикл в конец списка.
   */
  const handleAddCycle = () => {
    const newCycle: Cycle = {
      id: `cycle_${Date.now()}`,
      order: cycles.length,
      type: 'normal',
      repetitions: 1,
      restAfter: 120,
      exercises: [],
    };
    setCycles([...cycles, newCycle]);
  };

  /**
   * Обрабатывает завершение перетаскивания цикла.
   * @param {DragEndEvent} event - Событие перетаскивания.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCycles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="space-y-6 pb-4">
          <Card className="glass">
            <CardHeader><CardTitle>Детали тренировки</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workout-name">Название *</Label>
                <Input id="workout-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="например, Верх тела (Жим)" />
              </div>
              <div>
                <Label htmlFor="workout-description">Описание</Label>
                <Textarea id="workout-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите тренировку..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Циклы</CardTitle>
                <Button onClick={handleAddCycle} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Добавить цикл</Button>
              </div>
            </CardHeader>
            <CardContent>
              {cycles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Пока нет циклов</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={cycles.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {cycles.map((cycle, index) => (
                        <DraggableCycle
                          key={cycle.id}
                          cycle={cycle}
                          onUpdate={(updatedCycle) => {
                            const newCycles = [...cycles];
                            newCycles[index] = updatedCycle;
                            setCycles(newCycles);
                          }}
                          onDelete={() => setCycles(cycles.filter(c => c.id !== cycle.id))}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSave} disabled={!name}>Далее: Настроить расписание</Button>
      </div>
    </div>
  );
}
