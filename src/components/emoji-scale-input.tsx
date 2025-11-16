'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface EmojiScaleInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  emojiType: 'mood' | 'energy' | 'stress' | 'sleep';
  className?: string;
}

/**
 * Emoji Scale Input Component
 *
 * Visual 1-10 scale selector with emoji feedback.
 * Used for Daily Reflection System (Stage 3).
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.5 - Daily Reflection System
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function EmojiScaleInput({
  label,
  value,
  onChange,
  emojiType,
  className,
}: EmojiScaleInputProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const displayValue = hoveredValue ?? value;

  // Emoji configurations for different types
  const emojiConfig = {
    mood: {
      emoji: ['😢', '😟', '😕', '🙁', '😐', '🙂', '😊', '😄', '😁', '🤩'],
      labels: ['Terrible', 'Very Bad', 'Bad', 'Poor', 'Neutral', 'Good', 'Great', 'Very Good', 'Excellent', 'Amazing'],
      color: 'text-purple-600',
    },
    energy: {
      emoji: ['😴', '🥱', '😪', '😑', '😐', '🙂', '😊', '💪', '⚡', '🔥'],
      labels: ['Exhausted', 'Very Tired', 'Tired', 'Low', 'Neutral', 'Good', 'Energetic', 'Very Energetic', 'Pumped', 'Unstoppable'],
      color: 'text-orange-600',
    },
    stress: {
      emoji: ['😌', '😊', '🙂', '😐', '😟', '😰', '😨', '😱', '🤯', '💀'],
      labels: ['Zen', 'Relaxed', 'Calm', 'Neutral', 'Slightly Stressed', 'Stressed', 'Very Stressed', 'Overwhelmed', 'Burned Out', 'Crisis'],
      color: 'text-red-600',
    },
    sleep: {
      emoji: ['💀', '😫', '😴', '😪', '😐', '🙂', '😊', '😌', '✨', '🌟'],
      labels: ['Terrible', 'Very Bad', 'Poor', 'Below Average', 'Neutral', 'Decent', 'Good', 'Very Good', 'Excellent', 'Perfect'],
      color: 'text-blue-600',
    },
  };

  const config = emojiConfig[emojiType];
  const currentEmoji = config.emoji[displayValue - 1] || '❓';
  const currentLabel = config.labels[displayValue - 1] || 'Not set';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`scale-${emojiType}`} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl', config.color)}>{currentEmoji}</span>
          <span className="text-sm text-muted-foreground">{currentLabel}</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Visual scale */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = value === num;
            const isHovered = hoveredValue === num;
            const isBelowSelected = value > 0 && num <= value && !hoveredValue;
            const isBelowHovered = hoveredValue && num <= hoveredValue;

            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                onMouseEnter={() => setHoveredValue(num)}
                onMouseLeave={() => setHoveredValue(null)}
                className={cn(
                  'flex-1 h-10 rounded-md border-2 transition-all duration-150',
                  'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  {
                    'bg-primary border-primary text-primary-foreground': isSelected,
                    'bg-primary/70 border-primary/70': isBelowSelected && !isSelected,
                    'bg-primary/40 border-primary/40': isBelowHovered && !isHovered,
                    'border-muted bg-muted/20': !isBelowSelected && !isBelowHovered && !isSelected,
                  }
                )}
                aria-label={`${label}: ${num} (${config.labels[num - 1]})`}
              >
                <span className="text-xs font-medium">{num}</span>
              </button>
            );
          })}
        </div>

        {/* Number labels */}
        <div className="flex justify-between px-0.5 text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
