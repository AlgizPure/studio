'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { parseReflectionMock } from '@/lib/reflection';
import { parseDailyReflection } from '@/ai/flows/parse-reflection';
import { isHabitV2 } from '@/lib/habits-guards';
import { validateAndCreateHabitLog } from '@/lib/habits-validators';
import { logger } from '@/lib/logger';

interface DailyReflectionReviewProps {
  habits: Habit[];
  trigger?: React.ReactNode;
}

type EditableEntry = {
  habitId: string;
  habitName: string;
  status: HabitLogStatus;
  value?: string;
  durationMin?: string;
};

export function DailyReflectionReview({ habits, trigger }: DailyReflectionReviewProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const loadAndParse = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
    const snap = await getDoc(ref);
    const rawText = snap.exists() ? (snap.data()?.rawText as string) : '';
    if (!rawText) {
      setEntries([]);
      return;
    }
    
    // Use real AI parsing with fallback to mock
    try {
      const parsed = await parseDailyReflection(rawText, habits || []);
      setEntries(parsed.map(p => ({
        habitId: p.habitId,
        habitName: p.habitName,
        status: p.suggestedStatus,
        value: p.extractedValue != null ? String(p.extractedValue) : '',
        durationMin: p.extractedDuration != null ? String(p.extractedDuration) : '',
      })));
    } catch (error) {
      logger.error('Daily reflection review: Parsing error, using mock fallback', error instanceof Error ? error : new Error(String(error)));
      // Fallback to mock
      const parsed = parseReflectionMock(rawText, habits || []);
      setEntries(parsed.map(p => ({
        habitId: p.habitId,
        habitName: p.habitName,
        status: p.suggestedStatus,
        value: p.extractedValue != null ? String(p.extractedValue) : '',
        durationMin: p.extractedDuration != null ? String(p.extractedDuration) : '',
      })));
    }
  };

  useEffect(() => {
    if (open) {
      loadAndParse();
    }
  }, [open]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      // write logs
      const logsCol = collection(firestore, `users/${user.uid}/habitLogs`);
      for (const e of entries) {
        const matched = (habits || []).find(h => h.id === e.habitId);
        const contextData = matched && isHabitV2(matched) && matched.contextParams ? matched.contextParams : undefined;
        
        const logData = {
          habitId: e.habitId,
          date: dateStr,
          status: e.status,
          value: e.value ? Number(e.value) : undefined,
          durationMin: e.durationMin ? Number(e.durationMin) : undefined,
          ...(contextData && { contextData }),
          extractedFrom: 'reflection' as const,
          aiConfidence: 0.7,
          manuallyEdited: true,
        };
        
        // Validate before writing
        const validated = validateAndCreateHabitLog(logData);
        await addDoc(logsCol, validated);
      }
      // update reflection doc
      const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
      await updateDoc(ref, {
        parsedEntries: entries.map(e => ({
          habitId: e.habitId,
          habitName: e.habitName,
          extractedValue: e.value ? Number(e.value) : undefined,
          extractedDuration: e.durationMin ? Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection processed', description: 'Logs created from reflection.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Process reflection</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Review parsed entries</DialogTitle>
          <DialogDescription>Adjust values or status, then save to create logs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {entries.map((e, idx) => (
            <div key={e.habitId} className="grid grid-cols-6 items-center gap-2 p-2 border rounded">
              <div className="col-span-2 text-sm font-medium truncate">{e.habitName}</div>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="value" value={e.value} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], value: ev.target.value };
                  setEntries(next);
                }} />
                <Input placeholder="minutes" value={e.durationMin} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], durationMin: ev.target.value };
                  setEntries(next);
                }} />
              </div>
              <div className="col-span-2">
                <Select value={e.status} onValueChange={(v) => {
                  const next = [...entries] as EditableEntry[];
                  next[idx] = { ...next[idx], status: v as HabitLogStatus };
                  setEntries(next);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground">No entries parsed from today’s reflection.</div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={entries.length === 0 || busy} aria-busy={busy}>{busy ? 'Saving…' : 'Save Logs'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


