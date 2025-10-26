
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

interface PomodoroTimerProps {
  cycles: number;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_REST_MINUTES = 5;

const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function PomodoroTimer({ cycles }: PomodoroTimerProps) {
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
      const initialDuration = workMin * 60;
      setWorkDuration(initialDuration);
      setRestDuration(restMin * 60);
      setTimeLeft(initialDuration);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration);
    setCompletedCycles(0);
  }, [workDuration]);

  useEffect(() => {
    // When workDuration changes (e.g. from settings), reset the timer
    setTimeLeft(workDuration);
  }, [workDuration]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (timeLeft <= 0) {
      if (isWorkSession) {
        setCompletedCycles(prev => prev + 1);
        
        if (completedCycles + 1 >= cycles) {
            resetTimer();
            new Notification("Pomodoro", { body: "All cycles complete! Great work." });
            return;
        }

        setIsWorkSession(false);
        setTimeLeft(restDuration);
        new Notification("Pomodoro", { body: "Work session over! Time for a break." });

      } else {
        setIsWorkSession(true);
        setTimeLeft(workDuration);
        new Notification("Pomodoro", { body: "Break's over! Time to get back to work." });
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkSession, workDuration, restDuration, resetTimer, completedCycles, cycles]);

  const toggleTimer = () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            cx="25"
            cy="25"
            r={CIRCLE_RADIUS}
            fill="transparent"
          />
          <circle
            className="stroke-current text-primary transition-all duration-1000 ease-linear"
            strokeWidth="4"
            strokeLinecap="round"
            cx="25"
            cy="25"
            r={CIRCLE_RADIUS}
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
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTimer}>
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );
}
