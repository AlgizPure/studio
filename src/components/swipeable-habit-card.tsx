'use client';

import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Habit, HabitStreak } from '@/lib/types';
import { isHabitV2, getHabitTags, getHabitPriority, getHabitDifficulty, getHabitTarget, isQuantityHabit, isDurationHabit } from '@/lib/habits-guards';
import { formatHabitTarget } from '@/lib/habits';
import { cn } from '@/lib/utils';
import { Check, X, MoreVertical } from 'lucide-react';

/**
 * @fileoverview Компонент карточки привычки с возможностью свайпа.
 */

/**
 * @interface SwipeableHabitCardProps
 * @description Свойства для компонента SwipeableHabitCard.
 */
interface SwipeableHabitCardProps {
  /** Объект привычки. */
  habit: Habit;
  /** Данные о серии выполнения. */
  streak?: HabitStreak;
  /** Текущий прогресс для количественных привычек или привычек на время. */
  progress?: { value?: number; durationMin?: number };
  /** Флаг, указывающий, завершена ли привычка. */
  isCompleted: boolean;
  /** Callback при завершении привычки. */
  onComplete: () => void;
  /** Callback при пропуске привычки. */
  onSkip: () => void;
  /** Callback для открытия модального окна логирования. */
  onOpenLog: () => void;
}

/**
 * Интерактивная карточка привычки, которая поддерживает свайп-жесты
 * для быстрого выполнения (свайп вправо) или пропуска (свайп влево).
 * @param {SwipeableHabitCardProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function SwipeableHabitCard({
  habit,
  streak,
  progress,
  isCompleted,
  onComplete,
  onSkip,
  onOpenLog,
}: SwipeableHabitCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const SWIPE_THRESHOLD = 80; // Порог в пикселях для срабатывания действия
  const MAX_SWIPE = 120; // Максимальное расстояние свайпа

  /** Обработчик начала свайпа (касание). */
  const handleTouchStart = (e: React.TouchEvent) => { /* ... */ };
  /** Обработчик движения при свайпе (касание). */
  const handleTouchMove = (e: React.TouchEvent) => { /* ... */ };
  /** Обработчик окончания свайпа (касание). */
  const handleTouchEnd = () => { /* ... */ };

  /** Обработчик начала свайпа (мышь). */
  const handleMouseDown = (e: React.MouseEvent) => { /* ... */ };
  /** Обработчик движения при свайпе (мышь). */
  const handleMouseMove = (e: MouseEvent) => { /* ... */ };
  /** Обработчик окончания свайпа (мышь). */
  const handleMouseUp = () => { /* ... */ };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  const target = getHabitTarget(habit);
  const tags = getHabitTags(habit);
  const priority = getHabitPriority(habit);
  const difficulty = getHabitDifficulty(habit);

  // Расчет текста прогресса
  let progressText = formatHabitTarget(habit);
  if (isHabitV2(habit) && target && (isQuantityHabit(habit) || isDurationHabit(habit))) {
    // ... логика отображения прогресса ...
  }

  const swipePercentage = Math.abs(offsetX) / SWIPE_THRESHOLD;
  const backgroundColor = offsetX > 0 
    ? `rgba(34, 197, 94, ${swipePercentage * 0.3})` // зеленый
    : offsetX < 0 
    ? `rgba(239, 68, 68, ${swipePercentage * 0.3})` // красный
    : 'transparent';

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Индикаторы свайпа */}
      {offsetX > 20 && (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-green-500/20">
          <Check className="h-5 w-5 text-green-600" />
          <span className="ml-2 text-xs font-medium text-green-700">Выполнить</span>
        </div>
      )}
      {offsetX < -20 && (
        <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-red-500/20">
          <span className="mr-2 text-xs font-medium text-red-700">Пропустить</span>
          <X className="h-5 w-5 text-red-600" />
        </div>
      )}

      {/* Основная карточка */}
      <div
        className={cn('flex items-center ...')}
        style={{
          transform: `translateX(${offsetX}px)`,
          backgroundColor,
          transition: isDragging ? 'none' : 'transform 0.2s, background-color 0.2s',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <Checkbox /* ... */ />
        <div className="flex-1 min-w-0">
          <Label /* ... */ >{habit.name}</Label>
          {progressText && <p className="text-xs text-muted-foreground">{progressText}</p>}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* ... рендеринг значков (серия, теги, приоритет) ... */}
          </div>
        </div>
        <button /* ... */ >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
