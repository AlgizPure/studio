import type { HabitLog, HabitInsight, AnalysisSystem } from './types';

/**
 * Mock insights generator for development/testing.
 * Analyzes logs based on Wheel of Life and Maslow Hierarchy patterns.
 */
export function generateInsightsFromLogsMock(logs: HabitLog[]): HabitInsight[] {
  const insights: HabitInsight[] = [];
  const today = new Date().toISOString().slice(0, 10);
  
  // Wheel of Life weak areas
  const areas = ['health','career','relationships','growth','finance','recreation','environment','spirituality'] as const;
  const counters: Record<string, { total: number; done: number }> = Object.fromEntries(areas.map(a => [a, { total: 0, done: 0 }]));
  
  for (const l of logs) {
    const area = l.contextData?.['wheel-of-life-v1']?.life_area as string | undefined;
    if (area && counters[area]) {
      counters[area].total += 1;
      if (l.status === 'done') counters[area].done += 1;
    }
  }
  
  const metrics = areas.map(a => ({ area: a, value: counters[a].total ? (counters[a].done / counters[a].total) * 100 : 0 }));
  const weak = metrics.filter(m => m.value > 0 && m.value < 40).sort((a,b)=>a.value-b.value).slice(0,2);
  
  if (weak.length > 0) {
    insights.push({
      id: crypto.randomUUID(),
      date: today,
      systemId: 'wheel-of-life-v1',
      type: 'warning',
      priority: 4,
      title: 'Weak life areas detected',
      description: `Low completion in: ${weak.map(w=>w.area).join(', ')}`,
      data: { metrics: Object.fromEntries(metrics.map(m=>[m.area, Math.round(m.value)])) },
      createdAt: new Date().toISOString(),
    });
  }
  
  // Maslow base stability
  const physLogs = logs.filter(l => l.contextData?.['maslow-hierarchy-v1']?.need_level === 'physiological');
  const safLogs = logs.filter(l => l.contextData?.['maslow-hierarchy-v1']?.need_level === 'safety');
  const phys = physLogs.length ? (physLogs.filter(l=>l.status==='done').length / physLogs.length) * 100 : 0;
  const saf = safLogs.length ? (safLogs.filter(l=>l.status==='done').length / safLogs.length) * 100 : 0;
  const baseStability = Math.round((phys + saf) / 2);
  
  if (baseStability > 0 && baseStability < 60) {
    insights.push({
      id: crypto.randomUUID(),
      date: today,
      systemId: 'maslow-hierarchy-v1',
      type: 'recommendation',
      priority: 5,
      title: 'Base needs unstable',
      description: 'Focus on sleep, nutrition, financial safety before advanced goals.',
      data: { metrics: { physiological: Math.round(phys), safety: Math.round(saf), baseStability } },
      createdAt: new Date().toISOString(),
    });
  }
  
  return insights;
}

/**
 * Main insights generation function (delegates to AI or mock based on env).
 * Use this function instead of direct mock calls.
 */
export async function generateInsightsFromLogs(
  logs: HabitLog[],
  activeSystems?: AnalysisSystem[]
): Promise<HabitInsight[]> {
  // Import dynamically to avoid server/client issues
  const { generateInsights } = await import('@/ai/flows/generate-insights');
  return generateInsights(logs, activeSystems || []);
}


