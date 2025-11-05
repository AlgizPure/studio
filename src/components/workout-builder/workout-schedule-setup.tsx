'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProgramWorkout, IntervalType, Day } from '@/lib/types';

/**
 * @fileoverview Компонент для настройки расписания отдельной тренировки в рамках программы.
 */

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WorkoutScheduleSetupProps {
  /** Существующий объект расписания для редактирования. */
  schedule?: ProgramWorkout['schedule'];
  /** Callback-функция, вызываемая при изменении расписания. */
  onChange: (schedule: ProgramWorkout['schedule'] | null) => void;
}

/**
 * `WorkoutScheduleSetup` предоставляет интерфейс для детальной настройки
 * расписания тренировки, включая тип интервала (дни недели, каждые N дней),
 * продолжительность и время начала.
 * @param {WorkoutScheduleSetupProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function WorkoutScheduleSetup({ schedule, onChange }: WorkoutScheduleSetupProps) {
  const [intervalType, setIntervalType] = useState<IntervalType>(schedule?.intervalType || 'days_of_week');
  const [selectedDays, setSelectedDays] = useState<Day[]>((schedule?.intervalType === 'days_of_week' && Array.isArray(schedule.intervalValue)) ? schedule.intervalValue as Day[] : []);
  const [everyNDays, setEveryNDays] = useState<number>((schedule?.intervalType === 'every_n_days' && typeof schedule.intervalValue === 'number') ? schedule.intervalValue : 3);
  const [duration, setDuration] = useState(schedule?.duration || { value: 8, unit: 'weeks' as const });
  const [startTime, setStartTime] = useState<string>(schedule?.startTime || '');

  useEffect(() => {
    const value = intervalType === 'days_of_week' ? selectedDays : everyNDays;
    const newSchedule: ProgramWorkout['schedule'] = {
      intervalType,
      intervalValue: value,
      duration,
      startOffset: 0,
      startTime: startTime || undefined,
    };
    if (intervalType === 'days_of_week' && selectedDays.length === 0) {
      onChange(null); // Невалидное расписание, если не выбран ни один день
    } else {
      onChange(newSchedule);
    }
  }, [intervalType, selectedDays, everyNDays, duration, startTime, onChange]);

  // ... (обработчики handleDaysChange, handleEveryNDaysChange, и т.д.)

  return (
    <Card className="glass border-none shadow-none">
      <CardHeader>
        <CardTitle>Расписание тренировки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="interval-type">Тип расписания</Label>
          <Select value={intervalType} onValueChange={(v) => setIntervalType(v as IntervalType)}>
            <SelectTrigger id="interval-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="days_of_week">Конкретные дни недели</SelectItem>
              <SelectItem value="every_n_days">Каждые N дней</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {intervalType === 'days_of_week' && (
          <div>
            <Label>Выберите дни</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {/* ... (чекбоксы для дней недели) ... */}
            </div>
          </div>
        )}

        {intervalType === 'every_n_days' && (
          <div>
            <Label htmlFor="every-n-days">Каждые</Label>
            <div className="flex items-center gap-2">
              <Input id="every-n-days" type="number" min="1" value={everyNDays} onChange={(e) => setEveryNDays(Math.max(1, parseInt(e.target.value) || 1))} className="w-20" />
              <span className="text-sm text-muted-foreground">дней</span>
            </div>
          </div>
        )}

        {/* ... (поля для продолжительности и времени начала) ... */}
      </CardContent>
    </Card>
  );
}
