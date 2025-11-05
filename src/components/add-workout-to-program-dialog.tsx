'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutBuilder } from './workout-builder/workout-builder';
import { WorkoutScheduleSetup } from './workout-builder/workout-schedule-setup';
import type { WorkoutExtended, ProgramWorkout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileoverview Диалоговое окно для добавления новой тренировки в программу тренировок.
 */

/**
 * Свойства для компонента AddWorkoutToProgramDialog.
 * @interface AddWorkoutToProgramDialogProps
 * @property {boolean} open - Определяет, открыто ли диалоговое окно.
 * @property {(open: boolean) => void} onOpenChange - Функция обратного вызова при изменении состояния открытости.
 * @property {(workout: WorkoutExtended, schedule: ProgramWorkout['schedule']) => void} onWorkoutAdd - Функция обратного вызова при добавлении тренировки.
 */
interface AddWorkoutToProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkoutAdd: (workout: WorkoutExtended, schedule: ProgramWorkout['schedule']) => void;
}

/**
 * Компонент диалогового окна для добавления тренировки в программу.
 * @param {AddWorkoutToProgramDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диалоговое окно для добавления тренировки в программу.
 */
export function AddWorkoutToProgramDialog({
  open,
  onOpenChange,
  onWorkoutAdd,
}: AddWorkoutToProgramDialogProps) {
  const [currentTab, setCurrentTab] = useState('workout');
  const [workout, setWorkout] = useState<Omit<WorkoutExtended, 'id'> | null>(null);
  const [schedule, setSchedule] = useState<ProgramWorkout['schedule'] | null>(null);
  const { toast } = useToast();

  const handleWorkoutSave = (workoutData: Omit<WorkoutExtended, 'id'>) => {
    setWorkout(workoutData);
    setCurrentTab('schedule');
  };

  const handleScheduleSave = () => {
    if (!workout || !schedule) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, завершите создание тренировки и настройку расписания.',
        variant: 'destructive',
      });
      return;
    }

    const fullWorkout: WorkoutExtended = {
      ...workout,
      id: `workout_${Date.now()}`,
    };

    onWorkoutAdd(fullWorkout, schedule);
    
    // Сброс
    setWorkout(null);
    setSchedule(null);
    setCurrentTab('workout');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setWorkout(null);
    setSchedule(null);
    setCurrentTab('workout');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Добавить тренировку в программу</DialogTitle>
          <DialogDescription>
            Создайте новую тренировку и настройте ее расписание в программе.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden min-h-0 px-6">
          <TabsList className="grid w-full grid-cols-2 mt-4 flex-shrink-0">
            <TabsTrigger value="workout">Конструктор тренировок</TabsTrigger>
            <TabsTrigger value="schedule" disabled={!workout}>
              Расписание
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout" className="flex-1 flex flex-col overflow-hidden pt-4" style={{ minHeight: 0 }}>
            <WorkoutBuilder
              onSave={handleWorkoutSave}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="schedule" className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4" style={{ minHeight: 0 }}>
            {workout && (
              <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto">
                  <WorkoutScheduleSetup
                    schedule={schedule || undefined}
                    onChange={setSchedule}
                  />
                </div>
                <DialogFooter className="mt-4 pt-4 border-t px-0">
                  <Button variant="outline" onClick={() => setCurrentTab('workout')}>
                    Назад к конструктору
                  </Button>
                  <Button onClick={handleScheduleSave} disabled={!schedule}>
                    Добавить в программу
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
