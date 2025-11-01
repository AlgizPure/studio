'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import type { Habit, HabitLog, HabitStreak } from '@/lib/types';
import { HabitStreakCard } from './habit-streak-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { freezeStreak } from '@/lib/habits';

interface StreaksDialogProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  streaks: Map<string, HabitStreak>;
}

export function StreaksDialog({ habits, habitLogs, streaks }: StreaksDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  const selectedHabit = habits.find(h => h.id === selectedHabitId);
  const selectedStreak = selectedHabitId ? streaks.get(selectedHabitId) : undefined;
  const selectedLogs = selectedHabitId ? habitLogs.filter(l => l.habitId === selectedHabitId) : [];

  const handleFreeze = async (habitId: string, untilDate: string) => {
    if (!user || !firestore) return;
    
    try {
      const streakDoc = doc(firestore, `users/${user.uid}/habitStreaks/${habitId}`);
      const currentStreak = streaks.get(habitId);
      
      if (!currentStreak) {
        throw new Error('Streak not found');
      }

      const frozen = freezeStreak(currentStreak, untilDate);
      
      await updateDoc(streakDoc, {
        frozenUntil: frozen.frozenUntil,
      });

      toast({
        title: 'Streak frozen',
        description: `Streak frozen until ${new Date(untilDate).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error freezing streak:', error);
      throw error;
    }
  };

  const handleUseSkipToken = async (habitId: string) => {
    if (!user || !firestore) return;
    
    try {
      const streakDoc = doc(firestore, `users/${user.uid}/habitStreaks/${habitId}`);
      const currentStreak = streaks.get(habitId);
      
      if (!currentStreak) {
        throw new Error('Streak not found');
      }

      const skipTokens = currentStreak.skipTokens ?? 0;
      if (skipTokens === 0) {
        toast({
          title: 'No skip tokens',
          description: 'You have no skip tokens remaining',
          variant: 'destructive',
        });
        return;
      }

      await updateDoc(streakDoc, {
        skipTokens: skipTokens - 1,
      });

      toast({
        title: 'Skip token used',
        description: `${skipTokens - 1} token(s) remaining`,
      });
    } catch (error) {
      console.error('Error using skip token:', error);
      toast({
        title: 'Error',
        description: 'Failed to use skip token',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Flame className="h-4 w-4 mr-1" />
          Streaks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Habit Streaks</DialogTitle>
          <DialogDescription>
            View and manage your habit streaks, tokens, and freezes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select habit</label>
            <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a habit..." />
              </SelectTrigger>
              <SelectContent>
                {habits.map(h => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHabit && selectedStreak && (
            <HabitStreakCard
              habit={selectedHabit}
              streak={selectedStreak}
              logs={selectedLogs}
              onFreeze={(untilDate) => handleFreeze(selectedHabit.id, untilDate)}
              onUseSkipToken={() => handleUseSkipToken(selectedHabit.id)}
            />
          )}

          {!selectedHabitId && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Select a habit to view streak details
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

