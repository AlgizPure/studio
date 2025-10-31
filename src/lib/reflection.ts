import type { Habit, DailyReflection, HabitLog, HabitLogStatus } from './types';

type ParsedEntry = {
  habitId: string;
  habitName: string;
  extractedValue?: number;
  extractedDuration?: number;
  extractedNote?: string;
  suggestedStatus: HabitLogStatus;
  confidence: number;
};

// Very simple mock parser: looks for habit names in text and first integer following the line
export function parseReflectionMock(rawText: string, habits: Habit[]): ParsedEntry[] {
  const lines = rawText.split(/\r?\n/);
  const results: ParsedEntry[] = [];
  for (const habit of habits) {
    const idx = lines.findIndex((l) => l.toLowerCase().includes(habit.name.toLowerCase()));
    if (idx === -1) continue;
    const windowLines = lines.slice(idx, Math.min(idx + 3, lines.length));
    const joined = windowLines.join(' ');
    const match = joined.match(/(\d+)(?:\s*(min|minutes|ml|km|steps))?/i);
    let value: number | undefined;
    let duration: number | undefined;
    if (match) {
      const n = parseInt(match[1], 10);
      const unit = (match[2] || '').toLowerCase();
      if (unit === 'min' || unit === 'minutes') duration = n;
      else value = n;
    }
    const note = windowLines.join('\n');
    const suggestedStatus: HabitLogStatus = duration != null || value != null ? 'done' : 'partial';
    results.push({
      habitId: habit.id,
      habitName: habit.name,
      extractedValue: value,
      extractedDuration: duration,
      extractedNote: note,
      suggestedStatus,
      confidence: 0.7,
    });
  }
  return results;
}


