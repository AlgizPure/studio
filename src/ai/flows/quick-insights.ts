'use server';
/**
 * AI-powered quick insights for workout analytics using Genkit + Gemini.
 * Falls back to mock generator if NEXT_PUBLIC_AI_MOCK=1 or API key is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { WorkoutLog, Program } from '@/lib/types';
import { generateQuickInsightsMock } from '@/lib/workout-ai-mocks';
import type { QuickInsightsOutput } from '@/lib/workout-ai-mocks';

const QuickInsightSchema = z.object({
  type: z.enum(['positive', 'warning', 'recommendation']),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  description: z.string(),
  actionable: z.boolean(),
  relatedProgram: z.string().optional(),
});

const QuickInsightsInputSchema = z.object({
  workoutLogs: z.array(z.object({
    id: z.string(),
    date: z.string(),
    duration: z.number().optional(),
    totalVolume: z.number().optional(),
    cycles: z.array(z.object({
      exercises: z.array(z.object({
        exerciseId: z.string(),
        sets: z.array(z.object({
          reps: z.number(),
          weight: z.number().optional(),
          rpe: z.number().optional(),
          completed: z.boolean(),
        })),
      })),
    })),
  })),
  activePrograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
  })),
  userGoal: z.string().optional(),
  timeframe: z.enum(['2weeks', '4weeks']),
});

const QuickInsightsOutputSchema = z.object({
  insights: z.array(QuickInsightSchema),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
});

export type QuickInsightsInput = z.infer<typeof QuickInsightsInputSchema>;
// QuickInsightsOutput is imported from workout-ai-mocks.ts

/**
 * Real AI insights generation using Gemini via Genkit.
 */
async function generateQuickInsightsWithAI(input: QuickInsightsInput): Promise<z.infer<typeof QuickInsightsOutputSchema>> {
  const workoutsSummary = input.workoutLogs.slice(0, 50).map(log => {
    const volume = log.totalVolume || 0;
    const duration = log.duration || 0;
    return `Date: ${log.date}, Volume: ${Math.round(volume)}kg, Duration: ${duration}min`;
  }).join('\n');

  const programsList = input.activePrograms.map(p => `- ${p.name} (${p.status})`).join('\n');

  const prompt = ai.definePrompt({
    name: 'quickInsightsPrompt',
    input: { schema: QuickInsightsInputSchema },
    output: { schema: QuickInsightsOutputSchema },
    prompt: `You are an elite strength & conditioning coach with 15+ years of experience.

SPECIALIZATION:
- Evidence-based programming
- Progressive overload strategies
- RPE-based training
- Periodization and recovery
- Injury prevention

RESPONSE STYLE:
- Brief and actionable (2-3 sentences max)
- Specific numbers and dates
- Avoid generic phrases
- Focus on next 1-2 weeks

ANALYZE:
1. Volume trends (increasing/decreasing/plateauing)
2. RPE patterns (overtraining/undertraining)
3. Progressive overload (is there progression?)
4. Recovery (missed workouts, fatigue indicators)
5. Exercise-specific (strong/weak points)

USER DATA:
Timeframe: ${input.timeframe}
Goal: ${input.userGoal || 'Not specified'}

Recent Workouts:
${workoutsSummary}

Active Programs:
${programsList || 'None'}

Generate 3-5 insights with:
- type: 'positive' (what's going well + why), 'warning' (red flags + consequences), 'recommendation' (what to change + how + when)
- priority: 1 (highest) to 3 (lowest)
- actionable: true if user can act immediately

Return structured JSON response matching the schema.`,
  });

  try {
    const result = await prompt({
      workoutLogs: input.workoutLogs,
      activePrograms: input.activePrograms,
      userGoal: input.userGoal,
      timeframe: input.timeframe,
    });
    
    // Extract token usage if available
    const tokensUsed = (result as any)?.usage?.totalTokens || (result as any)?.tokensUsed || 0;
    if (tokensUsed > 0) {
      (result as any).tokensUsed = tokensUsed;
    }

    // Genkit returns a wrapper; use .output for typed result
    // @ts-expect-error - Genkit type wrapper issue
    return result.output ?? result;
  } catch (error) {
    console.error('[quick-insights] AI generation error:', error);
    throw error;
  }
}

/**
 * Main insights generation function with fallback logic.
 */
export async function getQuickInsights(
  workoutLogs: WorkoutLog[],
  programs: Program[],
  userGoal?: string,
  timeframe: '2weeks' | '4weeks' = '2weeks'
): Promise<QuickInsightsOutput> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[quick-insights] Using mock generator (NEXT_PUBLIC_AI_MOCK=1)');
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[quick-insights] No GOOGLE_GENAI_API_KEY found, falling back to mock');
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }

  try {
    // Prepare input
    const input: QuickInsightsInput = {
      workoutLogs: workoutLogs.map(log => ({
        id: log.id,
        date: log.date,
        duration: log.duration,
        totalVolume: log.totalVolume,
        cycles: log.cycles.map(cycle => ({
          exercises: cycle.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe,
              completed: set.completed,
            })),
          })),
        })),
      })),
      activePrograms: programs.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
      userGoal,
      timeframe,
    };

    // Try AI generation with retry logic (3 attempts with exponential backoff)
    let lastError: Error | null = null;
    let tokensUsed = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateQuickInsightsWithAI(input);
        // Track token usage
        tokensUsed = (result as any).tokensUsed || 0;
        if (tokensUsed > 0) {
          (result as any).tokensUsed = tokensUsed;
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Exponential backoff: 100ms, 200ms, 400ms
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // If all retries failed, fall back to mock
    console.error('[quick-insights] AI generation failed after retries, falling back to mock:', lastError);
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  } catch (error) {
    // Any other error, fall back to mock
    console.error('[quick-insights] Unexpected error, falling back to mock:', error);
    return generateQuickInsightsMock(workoutLogs, programs, userGoal);
  }
}
