import { collection, getDocs } from 'firebase/firestore';
import type { AnalysisSystem, Habit, HabitExportV1, HabitLog, HabitStreak, HabitInsight } from './types';
import { BUILTIN_SYSTEMS } from './systems';

type DateRange = { from: string; to: string };

export async function buildHabitExport(opts: {
  firestore: any;
  userId: string;
  dateRange?: DateRange;
}): Promise<HabitExportV1> {
  const { firestore, userId, dateRange } = opts;
  const habitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const logsSnap = await getDocs(collection(firestore, `users/${userId}/habitLogs`));
  const streaksSnap = await getDocs(collection(firestore, `users/${userId}/habitStreaks`));
  const insightsSnap = await getDocs(collection(firestore, `users/${userId}/habitInsights`));
  const activeSnap = await getDocs(collection(firestore, `users/${userId}/activeSystems`));

  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as Habit[];
  let logs = logsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitLog[];
  const streaks = streaksSnap.docs.map(d => ({ ...(d.data() as any) })) as unknown as HabitStreak[];
  const insights = insightsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitInsight[];
  const activeSystems = activeSnap.docs.map(d => ({ systemId: (d.data() as any).systemId || d.id, systemVersion: '1.0' }));

  if (dateRange) {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    logs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= from && d <= to;
    });
  }

  const systemDefinitions: AnalysisSystem[] = BUILTIN_SYSTEMS.filter(s => activeSystems.find(a => a.systemId === s.id));

  const totalHabits = habits.length;
  const completionRate = logs.length
    ? Math.round((logs.filter(l => l.status === 'done').length / logs.length) * 100)
    : 0;

  const exportData: HabitExportV1 = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
    habits: habits as any,
    logs,
    streaks,
    insights,
    activeSystems,
    systemDefinitions,
    metadata: {
      totalHabits,
      dateRange: dateRange || { from: '1970-01-01', to: new Date().toISOString().slice(0, 10) },
      completionRate,
    },
  };
  return exportData;
}


