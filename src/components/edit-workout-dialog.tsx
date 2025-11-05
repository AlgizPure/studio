'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutBuilder } from '@/components/workout-builder/workout-builder';
import type { WorkoutExtended } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

/**
 * @fileoverview Диалоговое окно для редактирования и удаления существующей тренировки.
 */

/**
 * Свойства для компонента EditWorkoutDialog.
 * @interface EditWorkoutDialogProps
 * @property {WorkoutExtended} workout - Тренировка для редактирования.
 * @property {(workout: WorkoutExtended) => Promise<void>} onUpdate - Функция обратного вызова при обновлении тренировки.
 * @property {(workoutId: string) => Promise<void>} onDelete - Функция обратного вызова при удалении тренировки.
 * @property {React.ReactNode} trigger - Триггер для открытия диалогового окна.
 */
interface EditWorkoutDialogProps {
  workout: WorkoutExtended;
  onUpdate: (workout: WorkoutExtended) => Promise<void>;
  onDelete: (workoutId: string) => Promise<void>;
  trigger: React.ReactNode;
}

/**
 * Компонент диалогового окна для редактирования тренировки.
 * @param {EditWorkoutDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диалоговое окно для редактирования тренировки.
 */
export function EditWorkoutDialog({ workout, onUpdate, onDelete, trigger }: EditWorkoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Omit<WorkoutExtended, 'id'> | null>(null);
  const [currentTab, setCurrentTab] = useState<'edit' | 'delete'>('edit');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCurrentWorkout({
        name: workout.name,
        description: workout.description,
        cycles: workout.cycles || [],
        targetMuscles: workout.targetMuscles,
        estimatedDuration: workout.estimatedDuration,
        status: workout.status,
        isStandalone: workout.isStandalone,
        standaloneSchedule: workout.standaloneSchedule,
        isHabit: workout.isHabit,
      });
      setCurrentTab('edit');
    }
  }, [open, workout]);

  const handleWorkoutSave = (workoutData: Omit<WorkoutExtended, 'id'>) => {
    const updated: WorkoutExtended = {
      ...workout,
      ...workoutData,
    };
    onUpdate(updated);
    setOpen(false);
    toast({
      title: 'Тренировка обновлена',
      description: 'Тренировка была сохранена.',
    });
  };

  const handleDelete = async () => {
    await onDelete(workout.id);
    setOpen(false);
    toast({
      title: 'Тренировка удалена',
      description: 'Тренировка была удалена.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Редактировать тренировку</DialogTitle>
          <DialogDescription>
            Измените структуру и циклы вашей тренировки.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'edit' | 'delete')} className="flex-1 flex flex-col overflow-hidden min-h-0 px-6">
          <TabsList className="grid w-full grid-cols-2 mt-4 flex-shrink-0">
            <TabsTrigger value="edit">Редактировать</TabsTrigger>
            <TabsTrigger value="delete">Удалить</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4" style={{ minHeight: 0 }}>
            {currentWorkout && (
              <WorkoutBuilder
                workout={currentWorkout}
                onSave={handleWorkoutSave}
                onCancel={() => setOpen(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="delete" className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4" style={{ minHeight: 0 }}>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Вы уверены, что хотите удалить эту тренировку? Это действие нельзя будет отменить.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Удалить тренировку</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие навсегда удалит "{workout.name}" и все связанные с ней данные.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
