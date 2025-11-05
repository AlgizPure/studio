
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @fileoverview Компонент иконки таймера Pomodoro.
 */

const CIRCLE_RADIUS = 20;

/**
 * @interface PomodoroIconProps
 * @description Свойства для компонента PomodoroIcon.
 */
interface PomodoroIconProps {
  /** Дополнительные классы CSS. */
  className?: string;
}

/**
 * Компонент-иконка, представляющий таймер Pomodoro.
 * Отображает стилизованный круглый индикатор.
 * На данный момент является статичной иконкой, но может быть расширен для отображения прогресса.
 * @param {PomodoroIconProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function PomodoroIcon({ className }: PomodoroIconProps) {
  return (
    <div className={cn("relative h-10 w-10", className)}>
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
          strokeDasharray={2 * Math.PI * CIRCLE_RADIUS}
          strokeDashoffset={0} 
          transform="rotate(-90 25 25)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-muted-foreground">25</span>
      </div>
    </div>
  );
}
