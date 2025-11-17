import type { Habit, DailyReflection, WeeklyContext } from '@/lib/types';
import { subDays, subWeeks, formatISO } from 'date-fns';

/**
 * Export habits and life balance data to YAML for Claude Analysis
 *
 * Generates a comprehensive YAML export with:
 * - All habits with completion rates and streaks
 * - Daily reflections summary (last 30 days)
 * - Weekly life balance contexts (last 8 weeks)
 * - Embedded prompt for Claude as life coach
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.9 - Claude Integration (Stage 6)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */

export interface HabitExportOptions {
  reflectionsDays?: number; // Default 30
  contextsWeeks?: number; // Default 8
}

/**
 * Export habits data for Claude analysis (YAML format)
 */
export function exportHabitsForClaude(
  habits: Habit[],
  reflections: DailyReflection[],
  weeklyContexts: WeeklyContext[],
  userId: string,
  options: HabitExportOptions = {}
): string {
  const { reflectionsDays = 30, contextsWeeks = 8 } = options;

  const exportDate = new Date().toISOString().split('T')[0];

  // Filter reflections to last N days
  const cutoffDate = subDays(new Date(), reflectionsDays);
  const recentReflections = reflections.filter(
    r => new Date(r.date) >= cutoffDate
  );

  // Calculate reflection averages
  const avgMood = recentReflections.length > 0
    ? (recentReflections.reduce((sum, r) => sum + r.mood, 0) / recentReflections.length).toFixed(1)
    : 'N/A';
  const avgEnergy = recentReflections.length > 0
    ? (recentReflections.reduce((sum, r) => sum + r.energy, 0) / recentReflections.length).toFixed(1)
    : 'N/A';
  const avgStress = recentReflections.length > 0
    ? (recentReflections.reduce((sum, r) => sum + r.stress, 0) / recentReflections.length).toFixed(1)
    : 'N/A';
  const avgSleep = recentReflections.length > 0
    ? (recentReflections.reduce((sum, r) => sum + r.sleepQuality, 0) / recentReflections.length).toFixed(1)
    : 'N/A';

  // Get latest weekly context
  const sortedContexts = [...weeklyContexts].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );
  const latestContext = sortedContexts[0];

  // Get context from N weeks ago for trend
  const weekCutoff = subWeeks(new Date(), contextsWeeks);
  const contextTrend = sortedContexts.filter(
    c => new Date(c.weekStart) >= weekCutoff
  );

  // Build YAML string
  let yaml = `# Zenith Trainer - Habits & Life Balance Export
# Generated: ${exportDate}
# User ID: ${userId}
#
# This export contains your habits, daily reflections, and life balance data.
# Send this to Claude for personalized life coaching analysis.

habits_export:
  user_id: "${userId}"
  export_date: "${exportDate}"

  # ========================================
  # HABITS (${habits.length} total)
  # ========================================
  habits:
`;

  // Add each habit
  habits.forEach(habit => {
    yaml += `    - name: "${habit.name}"\n`;
    yaml += `      type: "${habit.type}"\n`;
    yaml += `      completed: ${habit.completed}\n`;
    yaml += `      current_streak: ${habit.currentStreak || 0}\n`;
    yaml += `      best_streak: ${habit.bestStreak || 0}\n`;
    if (habit.description) {
      yaml += `      description: "${habit.description}"\n`;
    }
    yaml += `\n`;
  });

  // Add reflections summary
  yaml += `  # ========================================\n`;
  yaml += `  # DAILY REFLECTIONS SUMMARY (Last ${reflectionsDays} days)\n`;
  yaml += `  # ========================================\n`;
  yaml += `  daily_reflections_summary:\n`;
  yaml += `    period: "${reflectionsDays} days"\n`;
  yaml += `    total_entries: ${recentReflections.length}\n`;
  yaml += `    avg_mood: ${avgMood}  # Scale 1-10 (1=terrible, 10=amazing)\n`;
  yaml += `    avg_energy: ${avgEnergy}  # Scale 1-10 (1=exhausted, 10=energized)\n`;
  yaml += `    avg_stress: ${avgStress}  # Scale 1-10 (1=calm, 10=overwhelmed)\n`;
  yaml += `    avg_sleep: ${avgSleep}  # Scale 1-10 (1=poor, 10=excellent)\n`;
  yaml += `\n`;

  // Add weekly contexts
  if (latestContext) {
    yaml += `  # ========================================\n`;
    yaml += `  # WHEEL OF LIFE - LATEST ASSESSMENT\n`;
    yaml += `  # Week of ${new Date(latestContext.weekStart).toLocaleDateString()}\n`;
    yaml += `  # ========================================\n`;
    yaml += `  weekly_contexts_latest:\n`;
    yaml += `    week_start: "${latestContext.weekStart}"\n`;
    yaml += `    fitness: ${latestContext.contexts.fitness}  # Physical health, workouts, sleep, nutrition\n`;
    yaml += `    career: ${latestContext.contexts.career}  # Work satisfaction, income, growth\n`;
    yaml += `    relationships: ${latestContext.contexts.relationships}  # Quality time, connections, social life\n`;
    yaml += `    growth: ${latestContext.contexts.growth}  # Learning, hobbies, creativity\n`;
    yaml += `    environment: ${latestContext.contexts.environment}  # Home, workspace, organization\n`;
    yaml += `    fun: ${latestContext.contexts.fun}  # Leisure, travel, entertainment\n`;
    yaml += `    contribution: ${latestContext.contexts.contribution}  # Volunteering, helping others\n`;
    yaml += `    spirituality: ${latestContext.contexts.spirituality}  # Meditation, values, purpose\n`;
    yaml += `\n`;
  }

  // Add context trend
  if (contextTrend.length > 1) {
    yaml += `  # ========================================\n`;
    yaml += `  # LIFE BALANCE TREND (Last ${contextsWeeks} weeks)\n`;
    yaml += `  # ========================================\n`;
    yaml += `  weekly_contexts_trend:\n`;
    contextTrend.slice(0, contextsWeeks).forEach(context => {
      const weekDate = new Date(context.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      yaml += `    - week: "${weekDate}"\n`;
      yaml += `      fitness: ${context.contexts.fitness}\n`;
      yaml += `      career: ${context.contexts.career}\n`;
      yaml += `      relationships: ${context.contexts.relationships}\n`;
      yaml += `      growth: ${context.contexts.growth}\n`;
      yaml += `\n`;
    });
  }

  // Add Claude prompt
  yaml += `  # ========================================\n`;
  yaml += `  # CLAUDE LIFE COACH PROMPT\n`;
  yaml += `  # ========================================\n`;
  yaml += `  claude_prompt: |\n`;
  yaml += `    You are a certified life coach analyzing this user's habits and life balance.\n`;
  yaml += `    \n`;
  yaml += `    CONTEXT:\n`;
  yaml += `    - The user tracks habits using Zenith Trainer (fitness & life optimization app)\n`;
  yaml += `    - Daily reflections track mood, energy, stress, and sleep quality (1-10 scale)\n`;
  yaml += `    - Wheel of Life tracks 8 life dimensions (1-10 scale, assessed weekly)\n`;
  yaml += `    - All data is from the past ${reflectionsDays}-${contextsWeeks*7} days\n`;
  yaml += `    \n`;
  yaml += `    ANALYSIS CHECKLIST:\n`;
  yaml += `    1. **Life Balance Assessment**:\n`;
  yaml += `       - Which life dimensions are thriving (8+)? Which need urgent attention (<5)?\n`;
  yaml += `       - Is there imbalance between work/career and personal life?\n`;
  yaml += `       - Are any dimensions consistently declining?\n`;
  yaml += `    \n`;
  yaml += `    2. **Habit Effectiveness**:\n`;
  yaml += `       - Which habits have strong streaks? Celebrate these!\n`;
  yaml += `       - Which habits are struggling? Why might that be?\n`;
  yaml += `       - Are there too many habits? Should some be simplified?\n`;
  yaml += `    \n`;
  yaml += `    3. **Pattern Detection**:\n`;
  yaml += `       - Are there correlations between habits and well-being?\n`;
  yaml += `       - Does low energy/mood correlate with specific life dimensions?\n`;
  yaml += `       - Are stress levels impacting specific areas?\n`;
  yaml += `    \n`;
  yaml += `    4. **Actionable Recommendations**:\n`;
  yaml += `       - Suggest 2-3 NEW habits to improve weak life dimensions\n`;
  yaml += `       - Recommend timing adjustments (morning vs evening)\n`;
  yaml += `       - Suggest habit simplification for low-streak habits\n`;
  yaml += `       - Prioritize the single most impactful change\n`;
  yaml += `    \n`;
  yaml += `    5. **Life Coach Tone**:\n`;
  yaml += `       - Be encouraging but honest\n`;
  yaml += `       - Use specific data points (e.g., "Your career score of 4/10 has been low for 3 weeks")\n`;
  yaml += `       - Frame recommendations as experiments, not mandates\n`;
  yaml += `       - Acknowledge what's working well\n`;
  yaml += `    \n`;
  yaml += `    OUTPUT FORMAT:\n`;
  yaml += `    Provide your analysis in these sections:\n`;
  yaml += `    1. **Current State** (2-3 sentences)\n`;
  yaml += `    2. **Strengths** (what's working well)\n`;
  yaml += `    3. **Areas for Growth** (specific dimensions/habits)\n`;
  yaml += `    4. **Key Insights** (patterns, correlations)\n`;
  yaml += `    5. **Action Plan** (3 specific, time-bound recommendations)\n`;
  yaml += `    \n`;
  yaml += `    Be specific, data-driven, and actionable. The user wants concrete next steps.\n`;

  return yaml;
}

/**
 * Download YAML export as file
 */
export function downloadYAML(yaml: string, filename?: string): void {
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `zenith-habits-claude-${date}.yaml`;

  const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
