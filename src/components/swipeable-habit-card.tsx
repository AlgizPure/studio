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

interface SwipeableHabitCardProps {
  habit: Habit;
  streak?: HabitStreak;
  progress?: { value?: number; durationMin?: number };
  isCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onOpenLog: () => void;
}

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
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80; // pixels to trigger action
  const MAX_SWIPE = 120; // maximum swipe distance

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCompleted) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Limit swipe distance
    setOffsetX(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (offsetX > SWIPE_THRESHOLD) {
      // Swipe right = complete
      if (isQuantityHabit(habit) || isDurationHabit(habit)) {
        onOpenLog();
      } else {
        onComplete();
      }
    } else if (offsetX < -SWIPE_THRESHOLD) {
      // Swipe left = skip
      onSkip();
    }

    // Reset position
    setOffsetX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCompleted) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setOffsetX(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (offsetX > SWIPE_THRESHOLD) {
      if (isQuantityHabit(habit) || isDurationHabit(habit)) {
        onOpenLog();
      } else {
        onComplete();
      }
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onSkip();
    }

    setOffsetX(0);
  };

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

  // Calculate progress text
  let progressText = formatHabitTarget(habit) || (!isHabitV2(habit) ? habit.goal : undefined);
  if (isHabitV2(habit) && target && (isQuantityHabit(habit) || isDurationHabit(habit))) {
    const targetValue = target.value;
    const targetUnit = target.unit;
    if (typeof targetValue === 'number' && progress) {
      const val = isDurationHabit(habit) ? progress.durationMin : progress.value;
      if (typeof val === 'number') {
        progressText = `${val}/${targetValue}${targetUnit ? ' ' + targetUnit : isDurationHabit(habit) ? ' min' : ''}`;
      }
    }
  }

  const swipePercentage = Math.abs(offsetX) / SWIPE_THRESHOLD;
  const backgroundColor = offsetX > 0 
    ? `rgba(34, 197, 94, ${swipePercentage * 0.3})` // green for complete
    : offsetX < 0 
    ? `rgba(239, 68, 68, ${swipePercentage * 0.3})` // red for skip
    : 'transparent';

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe indicators */}
      {offsetX > 20 && (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-green-500/20 rounded-l-lg">
          <Check className="h-5 w-5 text-green-600" />
          <span className="ml-2 text-xs font-medium text-green-700">Complete</span>
        </div>
      )}
      {offsetX < -20 && (
        <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-red-500/20 rounded-r-lg">
          <span className="mr-2 text-xs font-medium text-red-700">Skip</span>
          <X className="h-5 w-5 text-red-600" />
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className={cn(
          'flex items-center space-x-3 p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing',
          'hover:bg-accent/50',
          isCompleted && 'opacity-50',
          isDragging && 'shadow-lg scale-105'
        )}
        style={{
          transform: `translateX(${offsetX}px)`,
          backgroundColor,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out, background-color 0.2s',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <Checkbox 
          id={habit.id} 
          checked={isCompleted}
          onCheckedChange={() => {
            if (isQuantityHabit(habit) || isDurationHabit(habit)) {
              onOpenLog();
            } else {
              onComplete();
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <Label 
            htmlFor={habit.id} 
            className={cn(
              'font-medium cursor-pointer block',
              isCompleted && 'line-through'
            )}
          >
            {habit.name}
          </Label>
          {progressText && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {progressText}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {streak && streak.current > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-800">
                🔥 {streak.current}
              </Badge>
            )}
            {tags.map((t: string) => (
              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                #{t}
              </Badge>
            ))}
            {priority && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800">
                P{priority}
              </Badge>
            )}
            {difficulty && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {difficulty}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open context menu
          }}
          className="p-1 hover:bg-accent rounded"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

