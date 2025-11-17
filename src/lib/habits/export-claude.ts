// src/lib/habits/export-claude.ts
// Function 13.9: Claude Integration for Habit Analysis
// Export habits + context to YAML for Claude life coaching analysis

import { collection, getDocs, query, where, orderBy, limit, type Firestore } from 'firebase/firestore';
import { stringify as yamlStringify } from 'yaml';
import type { Habit, HabitLog, HabitStreak, DailyReflection, WeeklyContext } from '@/lib/types';
import { computeCompletionRate, computeStreakFromLogs } from '@/lib/habits';
import { calculateReflectionStats, getTopGratitudes } from '@/lib/reflections';
import { calculateBalanceScore, getLatestContext, DIMENSION_INFO } from '@/lib/wheel-of-life';
import { subDays, subWeeks, startOfWeek } from 'date-fns';

/**
 * Claude analysis export data structure
 */
export type ClaudeAnalysisExport = {
  meta: {
    exportDate: string;
    purpose: string;
    period: {
      habits: string; // "All time"
      reflections: string; // "Last 30 days"
      weeklyContext: string; // "Last 8 weeks"
    };
  };
  habits: {
    id: string;
    name: string;
    type: string;
    target?: string;
    completionRate30d: number;
    completionRate90d: number;
    currentStreak: number;
    longestStreak: number;
    tags?: string[];
    priority?: number;
    difficulty?: string;
  }[];
  dailyReflections: {
    summary: {
      totalReflections: number;
      averageMood: number;
      averageEnergy: number;
      averageStress: number;
      averageSleepQuality: number;
      currentStreak: number;
      completionRate: number;
    };
    topGratitudes: string[];
    recentEntries: {
      date: string;
      mood: number;
      energy: number;
      stress: number;
      sleepQuality: number;
      gratitude?: string[];
      notes?: string;
    }[];
  };
  weeklyContext: {
    latestWeek: {
      weekStart: string;
      scores: Record<string, number>;
      balanceScore: {
        overall: number;
        rating: string;
        weakestDimension: string;
        strongestDimension: string;
        averageScore: number;
      };
      notes?: Record<string, string>;
    } | null;
    recentWeeks: {
      weekStart: string;
      fitness: number;
      career: number;
      relationships: number;
      growth: number;
      environment: number;
      fun: number;
      contribution: number;
      spirituality: number;
    }[];
  };
  claudePrompt: string;
};

/**
 * Claude life coach prompt for habit analysis
 */
const CLAUDE_LIFE_COACH_PROMPT = `# Claude Life Coach - Habit Analysis Instructions

You are an expert life coach and holistic wellness advisor. Analyze the provided habit tracking data and deliver a comprehensive, actionable coaching report.

## Your Analysis Should Include:

### 1. Executive Summary (2-3 sentences)
- Overall life balance assessment
- Key strengths and critical gaps
- Primary focus recommendation

### 2. Habit Performance Analysis
- Identify habits with excellent consistency (>80% completion)
- Identify struggling habits (<50% completion) and potential root causes
- Analyze streak patterns - celebrate wins, investigate breaks
- Assess habit difficulty vs. completion rate (are hard habits failing?)
- Recommend habit modifications (adjust targets, simplify, remove)

### 3. Wheel of Life Balance Assessment
- Evaluate the 8 life dimensions (fitness, career, relationships, growth, environment, fun, contribution, spirituality)
- Identify areas of excellence and areas needing urgent attention
- Detect imbalances (e.g., high career but low fun/relationships)
- Suggest specific actions to improve weakest dimensions
- Analyze trends if multiple weeks available

### 4. Daily Reflection Insights
- Mood, energy, stress, and sleep quality patterns
- Identify correlations (e.g., poor sleep → low energy → bad mood)
- Analyze gratitude themes - what brings joy consistently?
- Detect warning signs (chronic low mood, high stress, poor sleep)
- Recommend daily reflection improvements

### 5. Holistic Recommendations (Prioritized)
Provide 3-5 specific, actionable recommendations ranked by impact:
- **High Priority:** Critical changes needed now
- **Medium Priority:** Important but not urgent
- **Low Priority:** Nice-to-have optimizations

For each recommendation:
- Explain WHY (data-driven rationale)
- Suggest HOW (concrete action steps)
- Estimate IMPACT (what will improve)

### 6. 4-Week Action Plan
Create a phased plan:
- **Week 1:** Focus area + 2-3 specific actions
- **Week 2:** Focus area + 2-3 specific actions
- **Week 3:** Focus area + 2-3 specific actions
- **Week 4:** Review + consolidation actions

## Guidelines:
- Be specific and data-driven - reference actual numbers from the export
- Avoid generic advice - personalize to this user's data
- Be honest but encouraging - acknowledge struggles, celebrate wins
- Focus on sustainable behavior change, not perfection
- Consider the whole person (Wheel of Life context is critical)
- If data is limited, note it and suggest tracking improvements

## Output Format:
Structured markdown with clear sections, bullet points, and emphasis on actionability.
`;

/**
 * Export habits + context for Claude analysis (YAML format)
 */
export async function exportHabitsForClaude(opts: {
  firestore: Firestore;
  userId: string;
}): Promise<string> {
  const { firestore, userId } = opts;

  // Fetch habits
  const habitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const habits: Habit[] = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));

  // Fetch all habit logs
  const logsSnap = await getDocs(collection(firestore, `users/${userId}/habitLogs`));
  const allLogs: HabitLog[] = logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  // Calculate date ranges
  const now = new Date();
  const date30dAgo = subDays(now, 30);
  const date90dAgo = subDays(now, 90);

  // Build habits summary with completion rates and streaks
  const habitsSummary = habits
    .filter(h => !h.archived)
    .map(habit => {
      const habitLogs = allLogs.filter(l => l.habitId === habit.id);
      const completionRate30d = computeCompletionRate(habitLogs, date30dAgo, now);
      const completionRate90d = computeCompletionRate(habitLogs, date90dAgo, now);
      const streakData = computeStreakFromLogs(habitLogs);

      return {
        id: habit.id,
        name: habit.name,
        type: 'type' in habit ? habit.type : 'boolean',
        target: 'target' in habit && habit.target
          ? `${habit.target.value || ''} ${habit.target.unit || ''}`.trim()
          : undefined,
        completionRate30d: Math.round(completionRate30d),
        completionRate90d: Math.round(completionRate90d),
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
        tags: 'tags' in habit ? habit.tags : undefined,
        priority: 'priority' in habit ? habit.priority : undefined,
        difficulty: 'difficulty' in habit ? habit.difficulty : undefined,
      };
    });

  // Fetch daily reflections (last 30 days)
  const reflectionsSnap = await getDocs(
    query(
      collection(firestore, `users/${userId}/dailyReflections`),
      where('date', '>=', date30dAgo.toISOString().split('T')[0]),
      orderBy('date', 'desc')
    )
  );
  const reflections: DailyReflection[] = reflectionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as DailyReflection));

  // Calculate reflection stats
  const reflectionStats = calculateReflectionStats(reflections, 30);
  const topGratitudes = getTopGratitudes(reflections, 10);

  // Recent reflection entries (last 10)
  const recentReflections = reflections.slice(0, 10).map(r => ({
    date: r.date,
    mood: r.mood,
    energy: r.energy,
    stress: r.stress,
    sleepQuality: r.sleepQuality,
    gratitude: r.gratitude,
    notes: r.notes,
  }));

  // Fetch weekly contexts (last 8 weeks)
  const date8weeksAgo = subWeeks(now, 8);
  const weeklyContextsSnap = await getDocs(
    query(
      collection(firestore, `users/${userId}/weeklyContexts`),
      where('weekStart', '>=', date8weeksAgo.toISOString().split('T')[0]),
      orderBy('weekStart', 'desc'),
      limit(8)
    )
  );
  const weeklyContexts: WeeklyContext[] = weeklyContextsSnap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyContext));

  // Latest week context
  const latestContext = getLatestContext(weeklyContexts);
  const latestWeekData = latestContext
    ? {
        weekStart: latestContext.weekStart,
        scores: latestContext.contexts,
        balanceScore: calculateBalanceScore(latestContext.contexts),
        notes: latestContext.notes,
      }
    : null;

  // Recent weeks data
  const recentWeeksData = weeklyContexts.map(wc => ({
    weekStart: wc.weekStart,
    fitness: wc.contexts.fitness,
    career: wc.contexts.career,
    relationships: wc.contexts.relationships,
    growth: wc.contexts.growth,
    environment: wc.contexts.environment,
    fun: wc.contexts.fun,
    contribution: wc.contexts.contribution,
    spirituality: wc.contexts.spirituality,
  }));

  // Build export data
  const exportData: ClaudeAnalysisExport = {
    meta: {
      exportDate: now.toISOString(),
      purpose: 'Claude Life Coach - Habit Analysis',
      period: {
        habits: 'All time',
        reflections: 'Last 30 days',
        weeklyContext: 'Last 8 weeks',
      },
    },
    habits: habitsSummary,
    dailyReflections: {
      summary: {
        totalReflections: reflectionStats.totalReflections,
        averageMood: reflectionStats.averageMood,
        averageEnergy: reflectionStats.averageEnergy,
        averageStress: reflectionStats.averageStress,
        averageSleepQuality: reflectionStats.averageSleepQuality,
        currentStreak: reflectionStats.currentStreak,
        completionRate: reflectionStats.completionRate,
      },
      topGratitudes,
      recentEntries: recentReflections,
    },
    weeklyContext: {
      latestWeek: latestWeekData,
      recentWeeks: recentWeeksData,
    },
    claudePrompt: CLAUDE_LIFE_COACH_PROMPT,
  };

  // Convert to YAML
  const yamlContent = yamlStringify(exportData, {
    indent: 2,
    lineWidth: 0, // no line wrapping
    minContentWidth: 0,
  });

  return yamlContent;
}

/**
 * Download YAML file
 */
export function downloadClaudeAnalysisYAML(yamlContent: string) {
  const blob = new Blob([yamlContent], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits-claude-analysis-${new Date().toISOString().split('T')[0]}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
}
