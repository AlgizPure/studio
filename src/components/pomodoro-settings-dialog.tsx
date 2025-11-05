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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileoverview Диалоговое окно для настройки параметров таймера Pomodoro.
 */

/**
 * @interface PomodoroSettingsDialogProps
 * @description Свойства для компонента PomodoroSettingsDialog.
 */
interface PomodoroSettingsDialogProps {
  /** Определяет, открыто ли диалоговое окно. */
  open: boolean;
  /** Callback-функция при изменении состояния открытости. */
  onOpenChange: (open: boolean) => void;
}

/** @constant {number} Длительность рабочего интервала по умолчанию в минутах. */
const DEFAULT_WORK_MINUTES = 25;
/** @constant {number} Длительность интервала отдыха по умолчанию в минутах. */
const DEFAULT_REST_MINUTES = 5;

/**
 * Компонент-диалог для настройки длительности рабочих и перерывных сессий таймера Pomodoro.
 * Настройки сохраняются в `localStorage`.
 * @param {PomodoroSettingsDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function PomodoroSettingsDialog({ open, onOpenChange }: PomodoroSettingsDialogProps) {
  const [workDuration, setWorkDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pomodoroWorkDuration') || String(DEFAULT_WORK_MINUTES), 10);
    }
    return DEFAULT_WORK_MINUTES;
  });
  const [restDuration, setRestDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pomodoroRestDuration') || String(DEFAULT_REST_MINUTES), 10);
    }
    return DEFAULT_REST_MINUTES;
  });
  
  const { toast } = useToast();

  /**
   * Сохраняет текущие настройки в localStorage.
   */
  const handleSave = () => {
    localStorage.setItem('pomodoroWorkDuration', String(workDuration));
    localStorage.setItem('pomodoroRestDuration', String(restDuration));
    toast({
        title: "Настройки сохранены",
        description: "Ваши настройки таймера Pomodoro были обновлены.",
    });
    onOpenChange(false);
  };
  
  /**
   * Сбрасывает настройки к значениям по умолчанию.
   */
  const handleReset = () => {
    setWorkDuration(DEFAULT_WORK_MINUTES);
    setRestDuration(DEFAULT_REST_MINUTES);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки таймера Pomodoro</DialogTitle>
          <DialogDescription>
            Установите интервалы для рабочих сессий и перерывов. По умолчанию 25/5 мин.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="work-duration" className="text-right">
              Работа (минуты)
            </Label>
            <Input
              id="work-duration"
              type="number"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value, 10))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rest-duration" className="text-right">
              Отдых (минуты)
            </Label>
            <Input
              id="rest-duration"
              type="number"
              value={restDuration}
              onChange={(e) => setRestDuration(parseInt(e.target.value, 10))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>Сбросить по умолчанию</Button>
          <Button onClick={handleSave}>Сохранить настройки</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
