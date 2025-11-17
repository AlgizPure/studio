'use server';
/**
 * AI-powered habit pattern detection and insights
 *
 * Analyzes:
 * - Habit completion patterns
 * - Daily reflections (mood, energy, stress, sleep)
 * - Weekly life balance contexts
 *
 * Provides:
 * - Correlation detection (e.g., "Mood 30% higher on workout days")
 * - Weak spot identification (e.g., "Career low for 3 weeks")
 * - Habit suggestions (e.g., "Add morning walk to improve energy")
 * - Timing optimization (e.g., "Best compliance before 10 AM")
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.8 - AI Insights (Stage 5)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { logger } from '@/lib/logger';

// Input schema
const HabitInsightsInputSchema = z.object({
  habits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['daily', 'weekly', 'count', 'duration']),
    completed: z.boolean(),
    completionRate: z.number().optional(), // last 30 days
    currentStreak: z.number().optional(),
  })),

  reflections: z.array(z.object({
    date: z.string(), // YYYY-MM-DD
    mood: z.number(), // 1-10
    energy: z.number(), // 1-10
    stress: z.number(), // 1-10
    sleepQuality: z.number(), // 1-10
  })),

  weeklyContexts: z.array(z.object({
    weekStart: z.string(), // YYYY-MM-DD
    fitness: z.number(), // 1-10
    career: z.number(), // 1-10
    relationships: z.number(), // 1-10
    growth: z.number(), // 1-10
    environment: z.number(), // 1-10
    fun: z.number(), // 1-10
    contribution: z.number(), // 1-10
    spirituality: z.number(), // 1-10
  })),
});

// Output schema
const HabitInsightItemSchema = z.object({
  type: z.enum(['correlation', 'weak_spot', 'suggestion', 'timing', 'achievement']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  metric: z.string().optional(), // e.g., "30% higher", "3 weeks", etc.
  actionable: z.string().optional(), // Suggested action
});

const HabitInsightsOutputSchema = z.object({
  insights: z.array(HabitInsightItemSchema),
  summary: z.string(), // Overall assessment
});

export type HabitInsightsInput = z.infer<typeof HabitInsightsInputSchema>;
export type HabitInsightsOutput = z.infer<typeof HabitInsightsOutputSchema>;
export type HabitInsightItem = z.infer<typeof HabitInsightItemSchema>;

/**
 * Mock insights generator (fallback when AI is unavailable)
 */
function generateMockInsights(input: HabitInsightsInput): HabitInsightsOutput {
  const insights: HabitInsightItem[] = [];

  // Check for low energy patterns
  const avgEnergy = input.reflections.length > 0
    ? input.reflections.reduce((sum, r) => sum + r.energy, 0) / input.reflections.length
    : 5;

  if (avgEnergy < 6) {
    insights.push({
      type: 'weak_spot',
      priority: 'high',
      title: 'Low Energy Levels Detected',
      description: `Your average energy level is ${avgEnergy.toFixed(1)}/10 over the past ${input.reflections.length} days.`,
      metric: `${avgEnergy.toFixed(1)}/10 average`,
      actionable: 'Consider adding a morning exercise habit to boost energy',
    });
  }

  // Check for weak life dimensions
  if (input.weeklyContexts.length > 0) {
    const latestContext = input.weeklyContexts[0];
    const weakDimensions = Object.entries(latestContext)
      .filter(([key, value]) => key !== 'weekStart' && typeof value === 'number' && value < 5)
      .map(([key]) => key);

    if (weakDimensions.length > 0) {
      insights.push({
        type: 'weak_spot',
        priority: 'medium',
        title: `${weakDimensions.length} Life Dimensions Need Attention`,
        description: `The following areas are below 5/10: ${weakDimensions.join(', ')}`,
        actionable: `Focus on improving ${weakDimensions[0]} this week`,
      });
    }
  }

  // Suggest new habit based on completion rate
  const habitsWithLowCompletion = input.habits.filter(h =>
    h.completionRate !== undefined && h.completionRate < 0.5
  );

  if (habitsWithLowCompletion.length > 0) {
    insights.push({
      type: 'suggestion',
      priority: 'medium',
      title: 'Simplify Your Habits',
      description: `${habitsWithLowCompletion.length} habit(s) have low completion rates. Consider making them smaller or less frequent.`,
      actionable: `Start with "${habitsWithLowCompletion[0].name}" - break it into smaller steps`,
    });
  }

  // Achievement if high streak
  const highStreakHabits = input.habits.filter(h =>
    h.currentStreak !== undefined && h.currentStreak >= 7
  );

  if (highStreakHabits.length > 0) {
    insights.push({
      type: 'achievement',
      priority: 'low',
      title: `${highStreakHabits.length} Strong Habit Streak(s)`,
      description: `Great work! You have ${highStreakHabits.length} habit(s) with 7+ day streaks.`,
      metric: `${Math.max(...highStreakHabits.map(h => h.currentStreak || 0))} days best streak`,
    });
  }

  return {
    insights: insights.slice(0, 5),
    summary: insights.length > 0
      ? `Found ${insights.length} insights from your habits and life balance data.`
      : 'Keep tracking your habits to unlock personalized insights!',
  };
}

/**
 * Real AI insights generation using Gemini via Genkit
 */
async function generateInsightsWithAI(input: HabitInsightsInput): Promise<HabitInsightsOutput> {
  const prompt = ai.definePrompt({
    name: 'habitInsightsPrompt',
    input: { schema: HabitInsightsInputSchema },
    output: { schema: HabitInsightsOutputSchema },
    prompt: `You are an expert life coach and habit analyst. Analyze the user's habits, daily reflections, and life balance to provide actionable insights.

**Your Task:**
1. Detect correlations between habits and well-being (mood, energy, stress, sleep)
2. Identify weak spots in life balance or habit completion
3. Suggest new habits or adjustments to improve weak areas
4. Recommend optimal timing for habits based on completion patterns
5. Celebrate achievements and positive streaks

**Insight Types:**
- correlation: "Mood is X% higher on days when [habit] is completed"
- weak_spot: "[Life dimension] has been low (<5) for X weeks"
- suggestion: "Consider adding [habit] to improve [dimension]"
- timing: "Best compliance with habits logged before [time]"
- achievement: "Strong X-day streak on [habit]"

**Guidelines:**
- Provide 3-5 insights, prioritized by impact (high/medium/low)
- Be specific with metrics (percentages, durations, scores)
- Make insights actionable with clear next steps
- Focus on patterns, not isolated incidents
- Be encouraging and constructive

**Data Provided:**
- Habits: Current completion status, rates, and streaks
- Reflections: Daily mood, energy, stress, and sleep quality (1-10 scale)
- Weekly Contexts: 8 life dimensions (fitness, career, relationships, growth, environment, fun, contribution, spirituality) rated 1-10

Return structured JSON with insights array and summary.`,
  });

  try {
    const result = await prompt(input);
    // @ts-expect-error - Genkit type wrapper issue
    return result.output ?? result;
  } catch (error) {
    logger.error('Habit insights: AI generation error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Main habit insights generation function with fallback logic
 */
export async function generateHabitInsights(
  input: HabitInsightsInput
): Promise<HabitInsightsOutput> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    logger.info('Habit insights using mock generator', { reason: 'NEXT_PUBLIC_AI_MOCK=1' });
    return generateMockInsights(input);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    logger.warn('Habit insights: No API key found, using mock', { key: 'GOOGLE_GENAI_API_KEY' });
    return generateMockInsights(input);
  }

  try {
    // Try AI generation with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await generateInsightsWithAI(input);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // If all retries failed, fall back to mock
    logger.error('Habit insights: AI generation failed after retries, using mock', lastError);
    return generateMockInsights(input);
  } catch (error) {
    // Any other error, fall back to mock
    logger.error('Habit insights: Unexpected error, using mock', error instanceof Error ? error : new Error(String(error)));
    return generateMockInsights(input);
  }
}
