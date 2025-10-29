'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProgramWorkout, IntervalType, Day } from '@/lib/types';

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WorkoutScheduleSetupProps {
  schedule?: ProgramWorkout['schedule'];
  onChange: (schedule: ProgramWorkout['schedule'] | null) => void;
}

export function WorkoutScheduleSetup({ schedule, onChange }: WorkoutScheduleSetupProps) {
  const [intervalType, setIntervalType] = useState<IntervalType>(
    schedule?.intervalType || 'days_of_week'
  );
  const [selectedDays, setSelectedDays] = useState<Day[]>(
    (schedule?.intervalType === 'days_of_week' && Array.isArray(schedule.intervalValue)) 
      ? schedule.intervalValue as Day[]
      : []
  );
  const [everyNDays, setEveryNDays] = useState<number>(
    (schedule?.intervalType === 'every_n_days' && typeof schedule.intervalValue === 'number')
      ? schedule.intervalValue
      : 3
  );
  const [duration, setDuration] = useState(schedule?.duration || { value: 8, unit: 'weeks' as const });

  useEffect(() => {
    const value = intervalType === 'days_of_week' ? selectedDays : everyNDays;
    const newSchedule: ProgramWorkout['schedule'] = {
      intervalType,
      intervalValue: value,
      duration,
      startOffset: 0,
    };
    if (intervalType === 'days_of_week' && selectedDays.length === 0) {
      onChange(null);
    } else {
      onChange(newSchedule);
    }
  }, [intervalType, selectedDays, everyNDays, duration, onChange]);


  const handleDaysChange = (day: Day, checked: boolean) => {
    const newDays = checked 
      ? [...selectedDays, day]
      : selectedDays.filter(d => d !== day);
    setSelectedDays(newDays);
  };

  const handleEveryNDaysChange = (value: number) => {
    setEveryNDays(Math.max(1, value));
  };

  const handleDurationChange = (updates: Partial<typeof duration>) => {
    const newDuration = { ...duration, ...updates };
    if(updates.value) newDuration.value = Math.max(1, updates.value);
    setDuration(newDuration);
  };


  return (
    <Card className="glass border-none shadow-none">
      <CardHeader>
        <CardTitle>Workout Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interval Type */}
        <div>
          <Label htmlFor="interval-type">Schedule Type</Label>
          <Select value={intervalType} onValueChange={(v) => setIntervalType(v as IntervalType)}>
            <SelectTrigger id="interval-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days_of_week">Specific Days of Week</SelectItem>
              <SelectItem value="every_n_days">Every N Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Days of Week */}
        {intervalType === 'days_of_week' && (
          <div>
            <Label>Select Days</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day}`}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked) => handleDaysChange(day, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day}`} className="cursor-pointer font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Every N Days */}
        {intervalType === 'every_n_days' && (
          <div>
            <Label htmlFor="every-n-days">Every</Label>
            <div className="flex items-center gap-2">
              <Input
                id="every-n-days"
                type="number"
                min="1"
                value={everyNDays}
                onChange={(e) => handleEveryNDaysChange(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <Label>For a duration of</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type="number"
              min="1"
              value={duration.value}
              onChange={(e) => handleDurationChange({ value: parseInt(e.target.value) || 1 })}
              className="w-20"
            />
            <Select 
              value={duration.unit} 
              onValueChange={(unit: 'days' | 'weeks' | 'months') => handleDurationChange({ unit })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
