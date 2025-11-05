'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import type { SetLog } from '@/lib/types';

/**
 * @fileoverview Компонент для отслеживания и логирования одного подхода (сета) упражнения.
 */

interface SetTrackerProps {
  /** Номер текущего подхода. */
  setNumber: number;
  /** Целевое количество повторений (например, "8-12"). */
  targetReps: string;
  /** Целевой вес. */
  targetWeight?: number;
  /** Callback-функция, вызываемая при завершении подхода. */
  onComplete: (set: Omit<SetLog, 'timestamp'>) => void;
  /** Callback-функция, вызываемая при пропуске подхода. */
  onSkip: () => void;
}

/**
 * `SetTracker` - это интерактивная карточка для записи данных одного подхода:
 * количество выполненных повторений, вес и RPE (воспринимаемое напряжение).
 * @param {SetTrackerProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function SetTracker({
  setNumber,
  targetReps,
  targetWeight,
  onComplete,
  onSkip,
}: SetTrackerProps) {
  const [reps, setReps] = useState(parseInt(targetReps.split('-')[0]) || 0);
  const [weight, setWeight] = useState(targetWeight || 0);
  const [rpe, setRpe] = useState<number | undefined>();

  /**
   * Собирает данные подхода и вызывает callback onComplete.
   */
  const handleComplete = () => {
    const setLog: Omit<SetLog, 'timestamp'> = {
      setNumber,
      reps,
      weight: weight || undefined,
      rpe,
      completed: true,
    };
    onComplete(setLog);
  };

  return (
    <Card className="glass border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-xl">Подход {setNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reps">Повторения (цель: {targetReps})</Label>
            <Input id="reps" type="number" value={reps} onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))} />
          </div>
          <div>
            <Label htmlFor="weight">Вес (кг)</Label>
            <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} placeholder={targetWeight?.toString()} />
          </div>
        </div>

        <div>
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Input id="rpe" type="number" min="1" max="10" value={rpe || ''} onChange={(e) => setRpe(parseInt(e.target.value) || undefined)} placeholder="Необязательно" />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleComplete} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Завершить подход
          </Button>
          <Button onClick={onSkip} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Пропустить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
