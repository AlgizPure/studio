
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface PomodoroIconProps {
  className?: string;
}

export function PomodoroIcon({ className }: PomodoroIconProps) {
  return (
    <div className={cn("relative h-8 w-8", className)}>
      <svg className="h-full w-full" viewBox="0 0 50 50">
        <circle
          className="stroke-current text-secondary"
          strokeWidth="4"
          cx="25"
          cy="25"
          r={CIRCLE_RADIUS}
          fill="transparent"
        />
        <circle
          className="stroke-current text-primary"
          strokeWidth="4"
          strokeLinecap="round"
          cx="25"
          cy="25"
          r={CIRCLE_RADIUS}
          fill="transparent"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - 0.75)} // Example progress
          transform="rotate(-90 25 25)"
        />
      </svg>
    </div>
  );
}
