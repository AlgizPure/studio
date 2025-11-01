'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WorkoutExtended, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WorkoutSettingsDialogProps {
  workout: WorkoutExtended;
  onUpdate: (workout: WorkoutExtended) => Promise<void>;
  trigger: React.ReactNode;
}

export function WorkoutSettingsDialog({ workout, onUpdate, trigger }: WorkoutSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(workout.isStandalone || false);
  const [isHabit, setIsHabit] = useState(workout.isHabit || false);
  const [status, setStatus] = useState<'active' | 'inactive'>(workout.status || 'inactive');
  const [selectedDays, setSelectedDays] = useState<Day[]>(
    workout.standaloneSchedule?.days || []
  );
  const [startTime, setStartTime] = useState<string>(
    workout.standaloneSchedule?.startTime || ''
  );
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setIsStandalone(workout.isStandalone || false);
      setIsHabit(workout.isHabit || false);
      setStatus(workout.status || 'inactive');
      setSelectedDays(workout.standaloneSchedule?.days || []);
      setStartTime(workout.standaloneSchedule?.startTime || '');
    }
  }, [open, workout]);

  const handleSave = async () => {
    const updated: WorkoutExtended = {
      ...workout,
      status,
      isStandalone,
      isHabit,
      standaloneSchedule: isStandalone ? {
        days: selectedDays,
        startTime: startTime || undefined,
      } : undefined,
    };

    await onUpdate(updated);
    setOpen(false);
    toast({
      title: 'Settings Updated',
      description: 'Workout settings have been saved.',
    });
  };

  const handleDaysChange = (day: Day, checked: boolean) => {
    const newDays = checked 
      ? [...selectedDays, day]
      : selectedDays.filter(d => d !== day);
    setSelectedDays(newDays);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Workout Settings</DialogTitle>
          <DialogDescription>
            Configure activation, standalone schedule, and habit settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Standalone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isStandalone"
                checked={isStandalone}
                onCheckedChange={(checked) => setIsStandalone(checked as boolean)}
              />
              <Label htmlFor="isStandalone" className="cursor-pointer">
                Standalone workout
              </Label>
            </div>
            {isStandalone && (
              <div className="ml-6 space-y-3">
                <div>
                  <Label>Days</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {DAYS.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={selectedDays.includes(day)}
                          onCheckedChange={(checked) => handleDaysChange(day, checked as boolean)}
                        />
                        <Label htmlFor={`day-${day}`} className="cursor-pointer font-normal text-sm">
                          {day.substring(0, 3)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time (optional)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Select
                      value={startTime ? startTime.split(':')[0] : ''}
                      onValueChange={(hour) => {
                        const minute = startTime ? startTime.split(':')[1] || '00' : '00';
                        setStartTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select
                      value={startTime ? startTime.split(':')[1] || '00' : '00'}
                      onValueChange={(minute) => {
                        const hour = startTime ? startTime.split(':')[0] || '00' : '00';
                        setStartTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00">00</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Habit */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isHabit"
                checked={isHabit}
                onCheckedChange={(checked) => setIsHabit(checked as boolean)}
              />
              <Label htmlFor="isHabit" className="cursor-pointer">
                Add as habit
              </Label>
            </div>
            {isHabit && (
              <p className="text-xs text-muted-foreground ml-6">
                This workout will appear in your habits list.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

