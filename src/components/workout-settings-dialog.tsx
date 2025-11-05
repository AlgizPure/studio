'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WorkoutExtended, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileoverview Диалоговое окно для настройки параметров тренировки.
 */

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @interface WorkoutSettingsDialogProps
 * @description Свойства для компонента WorkoutSettingsDialog.
 */
interface WorkoutSettingsDialogProps {
  /** Расширенный объект тренировки для настройки. */
  workout: WorkoutExtended;
  /** Callback-функция при обновлении настроек. */
  onUpdate: (workout: WorkoutExtended) => Promise<void>;
  /** Триггер для открытия диалогового окна. */
  trigger: React.ReactNode;
}

/**
 * Компонент-диалог для настройки различных параметров тренировки, таких как
 * ее статус (активна/неактивна), является ли она отдельной (standalone),
 * и должна ли она отображаться как привычка.
 * @param {WorkoutSettingsDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function WorkoutSettingsDialog({ workout, onUpdate, trigger }: WorkoutSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(workout.isStandalone || false);
  const [isHabit, setIsHabit] = useState(workout.isHabit || false);
  const [status, setStatus] = useState<'active' | 'inactive'>(workout.status || 'inactive');
  const [selectedDays, setSelectedDays] = useState<Day[]>(workout.standaloneSchedule?.days || []);
  const [startTime, setStartTime] = useState<string>(workout.standaloneSchedule?.startTime || '');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setIsStandalone(workout.isStandalone || false);
      setIsHabit(workout.isHabit || false);
      setStatus(workout.status || 'inactive');
      setSelectedDays(workout.standaloneSchedule?.days || []);
      setStartTime(workout.standaloneSchedule?.startTime || '');
    }
  }, [open, workout]);

  /**
   * Сохраняет измененные настройки тренировки.
   */
  const handleSave = async () => {
    const updated: WorkoutExtended = {
      ...workout,
      status,
      isStandalone,
      isHabit,
      standaloneSchedule: isStandalone ? { days: selectedDays, startTime: startTime || undefined } : undefined,
    };
    await onUpdate(updated);
    setOpen(false);
    toast({ title: 'Настройки обновлены', description: 'Настройки тренировки были сохранены.' });
  };

  /**
   * Обрабатывает изменение выбора дней недели для отдельной тренировки.
   * @param {Day} day - День недели.
   * @param {boolean} checked - Новое состояние.
   */
  const handleDaysChange = (day: Day, checked: boolean) => {
    setSelectedDays(checked ? [...selectedDays, day] : selectedDays.filter(d => d !== day));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки тренировки</DialogTitle>
          <DialogDescription>Настройте активацию, отдельное расписание и настройки привычки.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="inactive">Неактивна</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="isStandalone" checked={isStandalone} onCheckedChange={(c) => setIsStandalone(c as boolean)} />
              <Label htmlFor="isStandalone" className="cursor-pointer">Отдельная тренировка</Label>
            </div>
            {isStandalone && <div className="ml-6 space-y-3"> /* ... настройки дней и времени ... */ </div>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="isHabit" checked={isHabit} onCheckedChange={(c) => setIsHabit(c as boolean)} />
              <Label htmlFor="isHabit" className="cursor-pointer">Добавить как привычку</Label>
            </div>
            {isHabit && <p className="text-xs text-muted-foreground ml-6">Эта тренировка появится в вашем списке привычек.</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить настройки</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
