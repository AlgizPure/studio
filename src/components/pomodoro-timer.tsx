'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

const TomatoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
        <path d="M13.29 8.53a4 4 0 1 0-5.87 5.41"/>
        <path d="M13.59 4.39a3 3 0 0 1 4.28 4.2"/>
        <path d="M12.48 4.5a3 3 0 0 1 3.5-3.5 3 3 0 0 1 3.5 3.5c0 .6-.18 1.16-.5 1.66"/>
        <path d="M15.8 20.94c-1.3-1.5-2.09-3.32-2.28-5.22"/>
        <path d="M12.61 14.22c.48-1.9 1.5-3.61 2.89-4.9"/>
    </svg>
);


interface PomodoroTimerProps {
  cycles: number;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_REST_MINUTES = 5;

export function PomodoroTimer({ cycles }: PomodoroTimerProps) {
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_MINUTES * 60);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_MINUTES * 60);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    const workMin = parseInt(localStorage.getItem('pomodoroWorkDuration') || String(DEFAULT_WORK_MINUTES), 10);
    const restMin = parseInt(localStorage.getItem('pomodoroRestDuration') || String(DEFAULT_REST_MINUTES), 10);
    const initialDuration = workMin * 60;
    setWorkDuration(initialDuration);
    setRestDuration(restMin * 60);
    setTimeLeft(initialDuration);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration);
    setCompletedCycles(0);
  }, [workDuration]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (timeLeft <= 0) {
      if (isWorkSession) {
        setCompletedCycles(prev => prev + 1);
        setIsWorkSession(false);
        setTimeLeft(restDuration);
        new Notification("Pomodoro", { body: "Work session over! Time for a break." });
        
        if (completedCycles + 1 >= cycles) {
            resetTimer();
            new Notification("Pomodoro", { body: "All cycles complete! Great work." });
            return;
        }

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
     // Request permission for notifications if not already granted
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

  return (
    <div className="flex items-center gap-2">
      <TomatoIcon />
      <span className="text-sm font-mono text-muted-foreground w-12">{formatTime(timeLeft)}</span>
      <span className="text-sm font-mono text-muted-foreground">
        {completedCycles}
      </span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTimer}>
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );
}
