'use server';
/**
 * AI-powered progression suggestions for workout programs using Genkit + Gemini.
 * Falls back to mock generator if NEXT_PUBLIC_AI_MOCK=1 or API key is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Program, WorkoutLog } from '@/lib/types';
import { generateProgressionSuggestionsMock } from '@/lib/workout-ai-mocks';
import type { ProgressionSuggestionsOutput } from '@/lib/workout-ai-mocks';
import { logger } from '@/lib/logger';

const ProgressionSuggestionSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  currentWeight: z.number().optional(),
  currentReps: z.number().optional(),
  suggestedWeight: z.number().optional(),
  suggestedReps: z.number().optional(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(100),
  applyImmediately: z.boolean(),
});

const ProgressionSuggestionsInputSchema = z.object({
  program: z.object({
    id: z.string(),
    name: z.string(),
    workouts: z.array(z.object({
      workoutId: z.string(),
    })),
  }),
  recentWorkouts: z.array(z.object({
    date: z.string(),
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
  exerciseHistory: z.record(z.object({
    sessions: z.array(z.object({
      date: z.string(),
      sets: z.array(z.object({
        reps: z.number(),
        weight: z.number().optional(),
        rpe: z.number().optional(),
      })),
      avgRPE: z.number(),
      totalVolume: z.number(),
    })),
  })),
});

const ProgressionSuggestionsOutputSchema = z.object({
  suggestions: z.array(ProgressionSuggestionSchema),
  globalRecommendation: z.string().optional(),
});

export type ProgressionSuggestionsInput = z.infer<typeof ProgressionSuggestionsInputSchema>;
// ProgressionSuggestionsOutput is imported from workout-ai-mocks.ts

/**
 * Real AI progression suggestions generation using Gemini via Genkit.
 */
async function generateProgressionSuggestionsWithAI(
  input: ProgressionSuggestionsInput
): Promise<z.infer<typeof ProgressionSuggestionsOutputSchema>> {
  const exerciseHistorySummary = Object.entries(input.exerciseHistory).slice(0, 10).map(([id, history]) => {
    const sessions = history.sessions;
    const lastSession = sessions[sessions.length - 1];
    return `Exercise ${id}: ${sessions.length} sessions, last: ${lastSession.sets.length} sets @ ${lastSession.sets[0]?.weight || 'N/A'}kg, RPE ${lastSession.avgRPE.toFixed(1)}`;
  }).join('\n');

  const prompt = ai.definePrompt({
    name: 'progressionSuggestionsPrompt',
    input: { schema: ProgressionSuggestionsInputSchema },
    output: { schema: ProgressionSuggestionsOutputSchema },
    prompt: `You are an AI system for automatic load progression in strength training.

PROGRESSIVE OVERLOAD PRINCIPLES:
1. If all sets completed with RPE ≤ 7.5: increase weight by 2.5-5%
2. If all sets completed with RPE 8-9: maintain current weight
3. If not all sets completed OR RPE > 9: decrease weight by 5-10%
4. Priority: Safety > Progression

CONFIDENCE SCORE RULES:
- 90-100: ≥5 recent sessions, stable patterns
- 70-89: 3-4 sessions, moderate variability
- <70: insufficient data, high variability

REASONING FORMAT:
"Last N sessions: [brief stats]. [Recommendation] because [justification]."

Example: "Last 5 sessions: 3x10 @ 100kg, RPE 7-7.5. Increase to 102.5kg because you consistently complete all sets with reserve."

PROGRAM: ${input.program.name} (${input.program.id})

EXERCISE HISTORY:
${exerciseHistorySummary}

Generate specific progression suggestions for each exercise with sufficient data.
Return structured JSON response matching the schema.`,
  });

  try {
    const result = await prompt({
      program: input.program,
      recentWorkouts: input.recentWorkouts,
      exerciseHistory: input.exerciseHistory,
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
    logger.error('Progression suggestions: AI generation error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Main progression suggestions function with fallback logic.
 */
export async function getProgressionSuggestions(
  program: Program,
  recentWorkouts: WorkoutLog[],
  exerciseHistory: Record<string, { sessions: Array<{ date: string; sets: Array<{ reps: number; weight?: number; rpe?: number }>; avgRPE: number; totalVolume: number }> }>
): Promise<ProgressionSuggestionsOutput> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    logger.info('Progression suggestions using mock generator', { reason: 'NEXT_PUBLIC_AI_MOCK=1' });
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    logger.warn('Progression suggestions: No API key found, using mock', { key: 'GOOGLE_GENAI_API_KEY' });
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }

  try {
    // Prepare input
    const input: ProgressionSuggestionsInput = {
      program: {
        id: program.id,
        name: program.name,
        workouts: program.workouts.map(w => ({ workoutId: w.workoutId })),
      },
      recentWorkouts: recentWorkouts.map(log => ({
        date: log.date,
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
      exerciseHistory,
    };

    // Try AI generation with retry logic (3 attempts with exponential backoff)
    let lastError: Error | null = null;
    let tokensUsed = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateProgressionSuggestionsWithAI(input);
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
    logger.error('Progression suggestions: AI generation failed after retries, using mock', lastError);
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  } catch (error) {
    // Any other error, fall back to mock
    logger.error('Progression suggestions: Unexpected error, using mock', error instanceof Error ? error : new Error(String(error)));
    return generateProgressionSuggestionsMock(program, recentWorkouts);
  }
}
