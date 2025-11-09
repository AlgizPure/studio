import { format } from 'date-fns';
import { toYAML } from './parser';
import type { Program } from '@/lib/ztl/types';
import type { WorkoutLog } from '@/lib/types';

export type ScheduledWorkout = {
  date: string; // ISO date
  workoutName: string;
  plannedVolume?: number;
  status: 'Upcoming' | 'Planned';
  exercises: string[];
};

export type ActiveProgramExport = {
  program: Program;
  ztl: unknown; // already converted structure
  currentWeek: number;
  totalWeeks: number;
  scheduledWorkouts: ScheduledWorkout[];
};

type WorkoutLogWithFeedback = WorkoutLog & {
  userFeedback?: string;
  feedbackTags?: string[];
};

type Input = {
  userId: string;
  userGoal?: string;
  pastWorkouts: WorkoutLog[];
  activePrograms: ActiveProgramExport[];
};

function escapeTripleBackticks(text: string) {
  return text.replace(/```/g, '\u0060\u0060\u0060');
}

function truncateJson(obj: unknown, maxLength = 350000): string {
  const s = JSON.stringify(obj, null, 2);
  if (s.length <= maxLength) return s;
  const head = s.slice(0, maxLength);
  return head + "\n/* truncated for size */";
}

export function downloadMarkdownFile(markdown: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateFullAnalysisExport(input: Input): Promise<string> {
  const exportDate = format(new Date(), 'yyyy-MM-dd');

  const header = `# 🏋️ ZENITH TRAINER - COMPREHENSIVE ANALYSIS EXPORT\n**Export Date:** ${exportDate}\n**Analysis Window:** Past 90d + Next 90d\n**User ID:** ${input.userId}`;

  const instructions = `\n\n## 📋 CLAUDE ANALYSIS INSTRUCTIONS\n\nYou are analyzing training data from Zenith Trainer app for personalized coaching recommendations.\n\n### YOUR ROLE\nElite Strength & Conditioning Coach with expertise in evidence-based programming, RPE, periodization and recovery.\n\n### REQUIRED ANALYSIS STEPS\n1) Web research latest (2023-2025): progressive overload, RPE effectiveness, volume/frequency meta-analyses, recovery optimization, periodization trends.\n\nSuggested queries:\n- RPE based training effectiveness 2024 research\n- progressive overload strategies evidence based 2025\n- training volume frequency optimization study\n- strength training periodization latest research\n\n2) Deep data analysis: Volume trends, RPE patterns, progressive overload, recovery indicators, exercise-specific analysis.\n3) Benchmarking vs evidence-based norms.\n4) Personalized recommendations (immediate, 4-week plan, 3-6 months) with red flags.\n5) Scientific backing with citations.\n\n### OUTPUT FORMAT\n\n## 🔍 RESEARCH FINDINGS\n## 📊 DATA ANALYSIS\n### Volume Trends\n### RPE Patterns\n### Progressive Overload\n### Recovery\n### Exercise-Specific\n\n## 🎯 RECOMMENDATIONS\n### Immediate (This Week)\n### 4-Week Plan\n### Long-term Strategy\n\n## ⚠️ CONCERNS & RED FLAGS\n## 📚 EVIDENCE BASE\n`;

  const userSection = `\n---\n\n## 📦 SECTION 1: USER PROFILE\n- Goal: ${input.userGoal ?? 'Not specified'}\n`;

  const programsSection = `\n---\n\n## 📦 SECTION 2: ACTIVE PROGRAMS (NEXT 90 DAYS)\n\n${input.activePrograms
    .map((ap) => {
      const scheduleTable = ap.scheduledWorkouts
        .slice(0, 120) // limit rows
        .map(
          (sw) => `| ${sw.date} | ${sw.workoutName} | ${sw.exercises.join(', ')} | ${sw.plannedVolume ?? ''} | ${sw.status} |`
        )
        .join('\n');
      const tableHeader = `| Date | Workout | Exercises | Planned Volume | Status |\n|------|---------|-----------|----------------|--------|`;
      const ztlYaml = toYAML(ap.ztl as unknown);
      return `### Program: ${ap.program.name}\n**Status:** ${ap.program.status} • **Progress:** Week ${ap.currentWeek}/${ap.totalWeeks || '∞'}\n\n#### Full Program Specification:\n\n\`\`\`ztl\n${escapeTripleBackticks(ztlYaml)}\n\`\`\`\n\n#### Scheduled Workouts (Next 90 Days):\n${tableHeader}\n${scheduleTable}\n`;
    })
    .join('\n')}`;

  const pastSection = `\n---\n\n## 📦 SECTION 3: COMPLETED WORKOUTS (PAST 90 DAYS)\n\n### Chronological Log\n\n\`\`\`json\n${escapeTripleBackticks(truncateJson(input.pastWorkouts))}\n\`\`\`\n`;

  const feedbackSection = `\n---\n\n## 📦 SECTION 4: WORKOUT FEEDBACK / NOTES\n\n${input.pastWorkouts
    .filter((w): w is WorkoutLogWithFeedback => 'userFeedback' in w || 'feedbackTags' in w)
    .slice(0, 200)
    .map((w: WorkoutLogWithFeedback) => `**${w.date}** — ${(w.feedbackTags || []).join(', ')}\n${w.userFeedback || ''}`)
    .join('\n\n')}`;

  const questions = `\n---\n\n## 📦 SECTION 5: ANALYSIS QUESTIONS\n- Past performance (progressions, stagnation, overtraining, recovery)\n- Current programs (volume sustainability, selection, missing elements)\n- Future plan 90d (overload risks, schedule, additions)\n- Integration (planned vs actual)\n\n**END OF INSTRUCTIONS - BEGIN ANALYSIS**`;

  return [header, instructions, userSection, programsSection, pastSection, feedbackSection, questions].join('\n');
}



