'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import type { HabitLog, Habit } from '@/lib/types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

function buildHeatmap(logs: HabitLog[], habitId?: string) {
  const map = new Map<string, number>();
  for (const l of logs) {
    if (l.status !== 'done') continue;
    if (habitId && l.habitId !== habitId) continue;
    const key = l.date;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function HeatmapDialog({ habits = [] }: { habits?: Habit[] }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs } = useCollection<HabitLog>(logsQuery);

  const safeLogs: HabitLog[] = (logs ?? []) as unknown as HabitLog[];

  const heatmap = useMemo(() => buildHeatmap(safeLogs, selectedHabit === 'all' ? undefined : selectedHabit), [safeLogs, selectedHabit]);

  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  const days: string[] = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().slice(0, 10));
  }

  const intensity = (count: number) => {
    if (count >= 5) return 'bg-emerald-600';
    if (count >= 3) return 'bg-emerald-400';
    if (count >= 1) return 'bg-emerald-200';
    return 'bg-muted';
  };

  const maxCount = useMemo(() => Math.max(...Array.from(heatmap.values()), 0), [heatmap]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Heatmap</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Heatmap</DialogTitle>
          <DialogDescription>Daily completion intensity over the last year.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <label className="text-sm">Filter by habit:</label>
            <Select value={selectedHabit} onValueChange={setSelectedHabit}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All habits</SelectItem>
                  {(habits || []).map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-14 gap-1 text-[10px]">
            {days.map((d) => {
              const count = heatmap.get(d) || 0;
              return (
                <div
                  key={d}
                  className={`h-4 w-4 rounded cursor-pointer transition-all ${intensity(count)} ${hoveredDate === d ? 'ring-2 ring-primary' : ''}`}
                  title={`${d}: ${count} completion(s)`}
                  onMouseEnter={() => setHoveredDate(d)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => {
                    if (count > 0) {
                      alert(`Date: ${d}\nCompletions: ${count}\n${selectedHabit !== 'all' ? `Habit: ${habits.find(h => h.id === selectedHabit)?.name}` : ''}`);
                    }
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-muted" />
              <div className="h-3 w-3 rounded bg-emerald-200" />
              <div className="h-3 w-3 rounded bg-emerald-400" />
              <div className="h-3 w-3 rounded bg-emerald-600" />
            </div>
            <span>More</span>
            {maxCount > 0 && <span className="ml-auto">Max: {maxCount} per day</span>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


