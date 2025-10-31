'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HabitLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  type: 'quantity' | 'duration';
  unitPlaceholder?: string;
  onSubmit: (value: number, unit?: string) => void;
}

export function HabitLogModal({ open, onOpenChange, habitName, type, unitPlaceholder, onSubmit }: HabitLogModalProps) {
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  const handleSubmit = () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onSubmit(parsed, unit || undefined);
    setValue('');
    setUnit('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log {habitName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="log-value" className="text-right">
              {type === 'quantity' ? 'Value' : 'Minutes'}
            </Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input id="log-value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'quantity' ? 'e.g., 2000' : 'e.g., 20'} />
              <div className="col-span-2">
                <Input id="log-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={unitPlaceholder || (type === 'quantity' ? 'ml, km, steps' : 'min')} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


