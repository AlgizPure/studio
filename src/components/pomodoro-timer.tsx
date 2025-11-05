
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

/**
 * @fileoverview Компонент таймера Pomodoro.
 */

/**
 * @interface PomodoroTimerProps
 * @description Свойства для компонента PomodoroTimer.
 */
interface PomodoroTimerProps {
  /** Количество рабочих циклов. */
  cycles: number;
  /** Флаг, отключающий таймер. */
  disabled?: boolean;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_REST_MINUTES = 5;
const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * Интерактивный компонент таймера Pomodoro.
 * Позволяет пользователю запускать и останавливать сессии работы и отдыха.
 * Настройки длительности берутся из `localStorage`.
 * @param {PomodoroTimerProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function PomodoroTimer({ cycles, disabled = false }: PomodoroTimerProps) {
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_MINUTES * 60);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_MINUTES * 60);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const workMin = parseInt(localStorage.getItem('pomodoroWorkDuration') || String(DEFAULT_WORK_MINUTES), 10);
      const restMin = parseInt(localStorage.getItem('pomodoroRestDuration') || String(DEFAULT_REST_MINUTES), 10);
      setWorkDuration(workMin * 60);
      setRestDuration(restMin * 60);
      setTimeLeft(workMin * 60);
    }
  }, []);

  /**
   * Сбрасывает таймер в исходное состояние.
   */
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration);
    setCompletedCycles(0);
  }, [workDuration]);

  useEffect(() => {
    if (disabled) {
        setIsActive(false);
    }
  }, [disabled]);
  
  useEffect(() => {
    setTimeLeft(workDuration);
  }, [workDuration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        if (isWorkSession) {
          const newCompleted = completedCycles + 1;
          setCompletedCycles(newCompleted);
          if (newCompleted >= cycles) {
            resetTimer();
            new Notification("Pomodoro", { body: "Все циклы завершены! Отличная работа." });
            return;
          }
          setIsWorkSession(false);
          setTimeLeft(restDuration);
          new Notification("Pomodoro", { body: "Рабочая сессия окончена! Время для перерыва." });
        } else {
          setIsWorkSession(true);
          setTimeLeft(workDuration);
          new Notification("Pomodoro", { body: "Перерыв окончен! Пора возвращаться к работе." });
        }
      }
      return;
    }

    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkSession, workDuration, restDuration, resetTimer, completedCycles, cycles]);

  /**
   * Переключает состояние таймера (запуск/пауза).
   */
  const toggleTimer = () => {
    if (disabled) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  /**
   * Форматирует время из секунд в строку "мм:сс".
   * @param {number} seconds - Время в секундах.
   * @returns {string} - Отформатированное время.
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalDuration = isWorkSession ? workDuration : restDuration;
  const progress = timeLeft / totalDuration;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex items-center gap-2">
       <div className="relative h-10 w-10">
        <svg className="h-full w-full" viewBox="0 0 50 50">
          <circle
            className="stroke-current text-secondary"
            strokeWidth="4"
            cx="25" cy="25" r={CIRCLE_RADIUS}
            fill="transparent"
          />
          <circle
            className="stroke-current text-primary transition-all duration-1000 ease-linear"
            strokeWidth="4" strokeLinecap="round"
            cx="25" cy="25" r={CIRCLE_RADIUS}
            fill="transparent"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 25 25)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-muted-foreground">{formatTime(timeLeft).split(':')[0]}</span>
        </div>
      </div>
      <span className="text-sm font-mono text-muted-foreground">
        {completedCycles}
      </span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTimer} disabled={disabled}>
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );
}
