'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PomodoroSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_REST_MINUTES = 5;

export function PomodoroSettingsDialog({ open, onOpenChange }: PomodoroSettingsDialogProps) {
  const [workDuration, setWorkDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pomodoroWorkDuration') || String(DEFAULT_WORK_MINUTES), 10);
    }
    return DEFAULT_WORK_MINUTES;
  });
  const [restDuration, setRestDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pomodoroRestDuration') || String(DEFAULT_REST_MINUTES), 10);
    }
    return DEFAULT_REST_MINUTES;
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('pomodoroWorkDuration', String(workDuration));
    localStorage.setItem('pomodoroRestDuration', String(restDuration));
    toast({
        title: "Settings Saved",
        description: "Your Pomodoro timer settings have been updated.",
    });
    onOpenChange(false);
  };
  
  const handleReset = () => {
    setWorkDuration(DEFAULT_WORK_MINUTES);
    setRestDuration(DEFAULT_REST_MINUTES);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pomodoro Timer Settings</DialogTitle>
          <DialogDescription>
            Set the intervals for your work and rest sessions. Defaults are 25/5 min.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="work-duration" className="text-right">
              Work (minutes)
            </Label>
            <Input
              id="work-duration"
              type="number"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value, 10))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rest-duration" className="text-right">
              Rest (minutes)
            </Label>
            <Input
              id="rest-duration"
              type="number"
              value={restDuration}
              onChange={(e) => setRestDuration(parseInt(e.target.value, 10))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
