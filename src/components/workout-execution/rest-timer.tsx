'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward } from 'lucide-react';

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass border-2 border-primary">
      <CardHeader>
        <CardTitle>Rest Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</div>
          <p className="text-sm text-muted-foreground mt-1">seconds remaining</p>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex gap-2">
          {isRunning ? (
            <Button onClick={() => setIsRunning(false)} variant="outline" className="flex-1">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button onClick={() => setIsRunning(true)} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          <Button onClick={onSkip} variant="outline">
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Rest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
