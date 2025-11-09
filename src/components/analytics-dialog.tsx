'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HabitLog } from '@/lib/types';
import { useUserCollection } from '@/hooks/use-user-collection';

type WheelOfLifeContext = {
  life_area?: string;
};

type MaslowHierarchyContext = {
  need_level?: string;
};

function computeWheelOfLife(logs: HabitLog[]) {
  const areas = ['health','career','relationships','growth','finance','recreation','environment','spirituality'] as const;
  const counters: Record<string, { total: number; done: number }> = Object.fromEntries(areas.map(a => [a, { total: 0, done: 0 }]));
  for (const l of logs) {
    const wheelContext = l.contextData?.['wheel-of-life-v1'] as WheelOfLifeContext | undefined;
    const area = wheelContext?.life_area;
    if (!area || !(area in counters)) continue;
    counters[area].total += 1;
    if (l.status === 'done') counters[area].done += 1;
  }
  const metrics = areas.map(a => ({ area: a, value: counters[a].total ? Math.round((counters[a].done / counters[a].total) * 100) : 0 }));
  const values = metrics.map(m => m.value);
  const avg = values.reduce((s,v)=>s+v,0) / (values.length || 1);
  const variance = values.reduce((s,v)=> s + Math.pow(v-avg,2), 0) / (values.length || 1);
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 10)));
  return { metrics, balanceScore };
}

function computeMaslowBase(logs: HabitLog[]) {
  const base = ['physiological','safety'] as const;
  const counters: Record<string, { total: number; done: number }> = { physiological: { total: 0, done: 0 }, safety: { total: 0, done: 0 } };
  for (const l of logs) {
    const maslowContext = l.contextData?.['maslow-hierarchy-v1'] as MaslowHierarchyContext | undefined;
    const level = maslowContext?.need_level;
    if (!level || !(level in counters)) continue;
    counters[level].total += 1;
    if (l.status === 'done') counters[level].done += 1;
  }
  const phys = counters.physiological.total ? (counters.physiological.done / counters.physiological.total) * 100 : 0;
  const saf = counters.safety.total ? (counters.safety.done / counters.safety.total) * 100 : 0;
  const baseStability = Math.round((phys + saf) / 2);
  return { physiological: Math.round(phys), safety: Math.round(saf), baseStability };
}

export function AnalyticsDialog() {
  const [open, setOpen] = useState(false);

  const { data: rawLogs } = useUserCollection<HabitLog>('habitLogs');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const safeRawLogs: HabitLog[] = (rawLogs ?? []) as unknown as HabitLog[];

  const logs = useMemo(() => {
    if (!from && !to) return safeRawLogs;
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return safeRawLogs.filter(l => {
      const d = new Date(l.date);
      if (f && d < f) return false;
      if (t && d > t) return false;
      return true;
    });
  }, [safeRawLogs, from, to]);

  const wheel = useMemo(() => computeWheelOfLife(logs), [logs]);
  const maslow = useMemo(() => computeMaslowBase(logs), [logs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Analytics</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Analytics (basic)</DialogTitle>
          <DialogDescription>Early metrics based on active systems context.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">From</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">To</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Wheel of Life</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {wheel.metrics.map(m => (
                <div key={m.area} className="flex items-center justify-between p-2 rounded border">
                  <span className="capitalize">{m.area}</span>
                  <span>{m.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Balance score: {wheel.balanceScore}%</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Maslow Base</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded border">Physiological: {maslow.physiological}%</div>
              <div className="p-2 rounded border">Safety: {maslow.safety}%</div>
              <div className="p-2 rounded border">Base stability: {maslow.baseStability}%</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


