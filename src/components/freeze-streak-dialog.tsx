'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Snowflake, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';

interface FreezeStreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  currentStreak: number;
  onConfirm: (untilDate: string) => Promise<void>;
}

export function FreezeStreakDialog({
  open,
  onOpenChange,
  habitName,
  currentStreak,
  onConfirm,
}: FreezeStreakDialogProps) {
  const { toast } = useToast();
  const [preset, setPreset] = useState<string>('3');
  const [customDate, setCustomDate] = useState('');
  const [busy, setBusy] = useState(false);

  const calculateUntilDate = (): string => {
    if (preset === 'custom') {
      return customDate;
    }
    const days = parseInt(preset);
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
  };

  const handleConfirm = async () => {
    const untilDate = calculateUntilDate();
    if (!untilDate) {
      toast({
        title: 'Invalid date',
        description: 'Please select a valid freeze period',
        variant: 'destructive',
      });
      return;
    }

    // Validate date is in future
    const until = new Date(untilDate);
    const now = new Date();
    if (until <= now) {
      toast({
        title: 'Invalid date',
        description: 'Freeze date must be in the future',
        variant: 'destructive',
      });
      return;
    }

    // Validate max 14 days
    const diffDays = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 14) {
      toast({
        title: 'Maximum freeze period',
        description: 'You can freeze a streak for maximum 14 days',
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    try {
      await onConfirm(untilDate);
      toast({
        title: 'Streak frozen',
        description: `${habitName} streak frozen until ${format(until, 'MMM d, yyyy')}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to freeze streak',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const untilDate = calculateUntilDate();
  const daysCount = untilDate 
    ? Math.ceil((new Date(untilDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-600" />
            Freeze Streak
          </DialogTitle>
          <DialogDescription>
            Pause tracking for <strong>{habitName}</strong> without breaking your streak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Freezing is perfect for vacations, illness, or planned breaks. Your {currentStreak}-day streak will be preserved.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Freeze period</Label>
            <RadioGroup value={preset} onValueChange={setPreset}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="3days" />
                <Label htmlFor="3days" className="cursor-pointer font-normal">
                  3 days (Weekend)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="7days" />
                <Label htmlFor="7days" className="cursor-pointer font-normal">
                  7 days (Week)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="14" id="14days" />
                <Label htmlFor="14days" className="cursor-pointer font-normal">
                  14 days (Maximum)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  Custom date
                </Label>
              </div>
            </RadioGroup>

            {preset === 'custom' && (
              <div className="ml-6">
                <Label htmlFor="customDate" className="text-xs">
                  Freeze until
                </Label>
                <Input
                  id="customDate"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  max={format(addDays(new Date(), 14), 'yyyy-MM-dd')}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {untilDate && daysCount > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Streak will be frozen for {daysCount} day{daysCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Until {format(new Date(untilDate), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Frozen days won't count toward or against your streak</p>
            <p>• You can use freeze once per quarter</p>
            <p>• Maximum freeze period is 14 days</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={busy || !untilDate || daysCount <= 0}>
            {busy ? 'Freezing...' : 'Freeze Streak'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

