'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { LifeDimension } from '@/lib/wheel-of-life';
import { DIMENSION_INFO } from '@/lib/wheel-of-life';

interface DimensionSliderInputProps {
  dimension: LifeDimension;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Dimension Slider Input Component
 *
 * Slider input for Wheel of Life dimension assessment (1-10 scale).
 * Shows dimension icon, label, description, and current value.
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.6 - Context Systems (Stage 4)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function DimensionSliderInput({
  dimension,
  value,
  onChange,
  className,
}: DimensionSliderInputProps) {
  const info = DIMENSION_INFO[dimension];

  // Color intensity based on value
  const getColorIntensity = (val: number): string => {
    if (val >= 8) return 'text-green-600 dark:text-green-400';
    if (val >= 6) return 'text-blue-600 dark:text-blue-400';
    if (val >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleValueChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <Label htmlFor={`dimension-${dimension}`} className="text-sm font-medium">
              {info.label}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
          </div>
        </div>
        <div className={cn('text-2xl font-bold min-w-[3rem] text-right', getColorIntensity(value))}>
          {value}
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          id={`dimension-${dimension}`}
          min={1}
          max={10}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          className="w-full"
          style={{
            // @ts-ignore - CSS custom property
            '--slider-color': info.color,
          }}
        />

        <div className="flex justify-between px-0.5 text-xs text-muted-foreground">
          <span>Poor (1)</span>
          <span>Excellent (10)</span>
        </div>
      </div>
    </div>
  );
}
