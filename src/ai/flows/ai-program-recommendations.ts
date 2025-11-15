'use server';
/**
 * AI-powered program recommendations using Genkit + Gemini.
 *
 * Analyzes ZTL programs and recent workout logs to generate
 * actionable recommendations as ZTL patches (one-click apply).
 *
 * Features:
 * - Progressive overload analysis
 * - RPE pattern detection
 * - Volume trend analysis
 * - Deload scheduling
 * - Exercise modification suggestions
 *
 * Falls back to mock generator if NEXT_PUBLIC_AI_MOCK=1 or API key is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ZTLProgram, ZTLPatch, WorkoutLog } from '@/lib/ztl/types';
import { logger } from '@/lib/logger';

// ============================================
// SCHEMAS
// ============================================

const ZTLExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  sets: z.number().optional(),
  target_reps: z.string().optional(),
  target_weight_kg: z.number().optional(),
  target_rpe: z.number().optional(),
  target_duration_s: z.number().optional(),
  target_intensity: z.enum(['zone1', 'zone2', 'zone3', 'zone4', 'zone5']).optional(),
  rest_s: z.number().optional(),
});

const ZTLCycleSchema = z.object({
  type: z.enum(['normal', 'circuit', 'superset', 'dropset']),
  repetitions: z.number().optional(),
  rest_after: z.number().optional(),
  exercises: z.array(ZTLExerciseSchema),
});

const ZTLWorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  estimated_duration_min: z.number().optional(),
  cycles: z.array(ZTLCycleSchema),
});

const ZTLProgramSchema = z.object({
  meta: z.object({
    version: z.literal('1.0'),
    id: z.string(),
    name: z.string(),
    author: z.string().optional(),
    goal: z.enum(['hypertrophy', 'strength', 'fat_loss', 'endurance', 'mobility']).optional(),
    duration: z.object({ weeks: z.number() }).optional(),
    tags: z.array(z.string()).optional(),
  }),
  phases: z.array(z.object({
    name: z.string(),
    weeks: z.string(),
  })).optional(),
  schedule: z.object({
    pattern: z.enum(['days_of_week', 'every_n_days']),
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    every_n_days: z.number().optional(),
  }),
  workouts: z.array(ZTLWorkoutSchema),
  progression: z.object({
    rules: z.array(z.object({
      when: z.object({
        all_sets_completed: z.boolean().optional(),
        avg_rpe: z.object({
          lte: z.number().optional(),
          gte: z.number().optional(),
        }).optional(),
      }),
      do: z.object({
        action: z.enum(['increase_weight', 'decrease_weight']),
        amount: z.string(),
      }),
    })),
    microcycle_weeks: z.number().optional(),
    deload: z.object({
      week: z.number(),
      volume_reduction: z.string(),
    }).optional(),
  }).optional(),
});

const WorkoutLogSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  programId: z.string().optional(),
  userId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  status: z.enum(['not_started', 'in_progress', 'paused', 'completed']),
  cycles: z.array(z.object({
    cycleId: z.string(),
    cycleNumber: z.number(),
    exercises: z.array(z.object({
      exerciseId: z.string(),
      sets: z.array(z.object({
        setNumber: z.number(),
        reps: z.number(),
        weight: z.number().optional(),
        rpe: z.number().optional(),
        completed: z.boolean(),
        timestamp: z.string(),
      })),
      notes: z.string().optional(),
      skipped: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      duration: z.number().optional(),
    })),
    completed: z.boolean(),
  })),
  notes: z.string().optional(),
  totalVolume: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userFeedback: z.string().optional(),
  feedbackTags: z.array(z.string()).optional(),
});

const ZTLPatchOpSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('update-exercise'),
    program_id: z.string(),
    workout_id: z.string(),
    exercise_id: z.string(),
    set_target: z.object({
      sets: z.number().optional(),
      target_reps: z.string().optional(),
      target_weight_kg: z.number().optional(),
      target_rpe: z.number().optional(),
      target_duration_s: z.number().optional(),
      target_intensity: z.enum(['zone1', 'zone2', 'zone3', 'zone4', 'zone5']).optional(),
      rest_s: z.number().optional(),
    }).optional(),
  }),
  z.object({
    op: z.literal('add-program'),
    program: ZTLProgramSchema,
  }),
  z.object({
    op: z.literal('update-program'),
    program_id: z.string(),
    program: ZTLProgramSchema.partial(),
  }),
  z.object({
    op: z.literal('remove-exercise'),
    program_id: z.string(),
    workout_id: z.string(),
    exercise_id: z.string(),
  }),
]);

const ZTLPatchSchema = z.object({
  patch: z.array(ZTLPatchOpSchema),
});

const AIRecommendationSchema = z.object({
  id: z.string(),
  title: z.string().describe('Short, actionable title (e.g., "Increase Upper Body Volume")'),
  description: z.string().describe('Brief user-friendly description (1-2 sentences)'),
  rationale: z.string().describe('Detailed explanation with data/reasoning (2-3 sentences)'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level based on data quality and consistency'),
  patch: ZTLPatchSchema.describe('ZTL patch operations to apply the recommendation'),
});

const ProgramRecommendationsInputSchema = z.object({
  program: ZTLProgramSchema,
  recentLogs: z.array(WorkoutLogSchema).describe('Recent workout logs (last 30-90 days)'),
});

const ProgramRecommendationsOutputSchema = z.object({
  recommendations: z.array(AIRecommendationSchema).describe('2-5 prioritized recommendations'),
  summary: z.string().optional().describe('Overall program health summary'),
});

export type ProgramRecommendationsInput = z.infer<typeof ProgramRecommendationsInputSchema>;
export type ProgramRecommendationsOutput = z.infer<typeof ProgramRecommendationsOutputSchema>;
export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

// ============================================
// MOCK GENERATOR
// ============================================

/**
 * Mock recommendations generator for testing/fallback
 */
function generateMockRecommendations(
  program: ZTLProgram,
  _recentLogs: WorkoutLog[]
): ProgramRecommendationsOutput {
  const recommendations: AIRecommendation[] = [];

  // Mock recommendation 1: Increase volume on first exercise
  const firstWorkout = program.workouts[0];
  const firstExercise = firstWorkout?.cycles[0]?.exercises[0];

  if (firstWorkout && firstExercise) {
    recommendations.push({
      id: crypto.randomUUID(),
      title: 'Increase Upper Body Volume',
      description: 'Based on your progression, you can handle 10% more volume on bench press',
      rationale:
        'Your RPE has been consistently 6-7 for the last 3 weeks, indicating you have capacity for more volume. Research shows 10-20% volume increases are well-tolerated when RPE < 8.',
      confidence: 'high',
      patch: {
        patch: [
          {
            op: 'update-exercise',
            program_id: program.meta.id,
            workout_id: firstWorkout.id,
            exercise_id: firstExercise.id,
            set_target: {
              sets: (firstExercise.sets || 3) + 1,
              target_rpe: 7.5,
            },
          },
        ],
      },
    });
  }

  // Mock recommendation 2: Add deload week
  if (!program.progression?.deload) {
    recommendations.push({
      id: crypto.randomUUID(),
      title: 'Schedule Deload Week',
      description: 'Add a deload after 4 weeks to optimize recovery',
      rationale:
        'You have been progressing for 4+ weeks. A deload week (40% volume reduction) will optimize recovery and prevent overtraining.',
      confidence: 'medium',
      patch: {
        patch: [
          {
            op: 'update-program',
            program_id: program.meta.id,
            program: {
              progression: {
                rules: program.progression?.rules || [],
                deload: {
                  week: 5,
                  volume_reduction: '40%',
                },
              },
            },
          },
        ],
      },
    });
  }

  return {
    recommendations,
    summary: 'Program is progressing well. Consider volume increase and deload scheduling.',
  };
}

// ============================================
// AI GENERATION
// ============================================

/**
 * Real AI recommendations generation using Gemini via Genkit.
 */
async function generateRecommendationsWithAI(
  input: ProgramRecommendationsInput
): Promise<ProgramRecommendationsOutput> {
  // Prepare logs summary for prompt
  const logsSummary = input.recentLogs.slice(0, 20).map(log => {
    const exerciseStats = log.cycles.flatMap(c => c.exercises).map(ex => {
      const avgRPE = ex.sets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / ex.sets.filter(s => s.rpe).length || 0;
      const avgWeight = ex.sets.filter(s => s.weight).reduce((sum, s) => sum + (s.weight || 0), 0) / ex.sets.filter(s => s.weight).length || 0;
      const completionRate = (ex.sets.filter(s => s.completed).length / ex.sets.length) * 100;
      return `  - Exercise ${ex.exerciseId}: ${ex.sets.length} sets, avg RPE ${avgRPE.toFixed(1)}, avg weight ${avgWeight.toFixed(1)}kg, ${completionRate.toFixed(0)}% completed`;
    }).join('\n');
    return `Date: ${log.date}\n${exerciseStats}`;
  }).join('\n\n');

  const prompt = ai.definePrompt({
    name: 'programRecommendationsPrompt',
    input: { schema: ProgramRecommendationsInputSchema },
    output: { schema: ProgramRecommendationsOutputSchema },
    prompt: `You are an elite strength & conditioning coach AI. Analyze this training program and recent workout logs to generate actionable recommendations as ZTL patches.

PROGRAM ANALYSIS CHECKLIST:
1. **Progressive Overload**: Are weights/reps/volume increasing over time?
2. **RPE Patterns**:
   - Consistently low RPE (< 7): Increase volume or intensity
   - Consistently high RPE (> 9): Decrease volume or intensity
   - Optimal range: RPE 7-8.5
3. **Completion Rates**:
   - < 80%: Program too aggressive, reduce volume
   - > 95%: Too easy, increase challenge
4. **Recovery Indicators**:
   - Missing sessions, low RPE variability, or user feedback tags (tired, pain) → Add deload
5. **Volume Distribution**: Check balance across muscle groups

RECOMMENDATION RULES:
- **High confidence (90%+ completion, 5+ sessions, stable RPE)**: Suggest concrete changes
- **Medium confidence (3-4 sessions, moderate variability)**: Suggest conservative adjustments
- **Low confidence (< 3 sessions, high variability)**: Suggest monitoring or minor tweaks

OUTPUT FORMAT:
- Generate 2-5 recommendations prioritized by impact
- Each recommendation must include a valid ZTL patch
- Ensure all IDs (program_id, workout_id, exercise_id) match exactly from the input program
- Use specific numbers and data in rationale (e.g., "Last 5 sessions: RPE 7.2 avg")

PROGRAM:
${JSON.stringify(input.program, null, 2)}

RECENT LOGS (last ${input.recentLogs.length} sessions):
${logsSummary}

Generate structured JSON response matching ProgramRecommendationsOutputSchema.`,
  });

  try {
    const result = await prompt({
      program: input.program,
      recentLogs: input.recentLogs,
    });

    // Genkit returns a wrapper; use .output for typed result
    // @ts-expect-error - Genkit type wrapper issue
    const output = result.output ?? result;

    // Ensure IDs are set (Gemini might not generate them)
    output.recommendations = output.recommendations.map((rec: AIRecommendation) => ({
      ...rec,
      id: rec.id || crypto.randomUUID(),
    }));

    return output as ProgramRecommendationsOutput;
  } catch (error) {
    logger.error('AI Program Recommendations: Generation error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// ============================================
// MAIN EXPORT
// ============================================

/**
 * Generate AI-powered program recommendations with fallback logic.
 *
 * @param program - ZTL program to analyze
 * @param recentLogs - Recent workout logs (last 30-90 days recommended)
 * @returns Recommendations with ZTL patches ready to apply
 *
 * Usage:
 * ```ts
 * const { recommendations } = await getAIProgramRecommendations(program, logs);
 * // Display recommendations in AIRecommendationsDialog
 * ```
 */
export async function getAIProgramRecommendations(
  program: ZTLProgram,
  recentLogs: WorkoutLog[]
): Promise<ProgramRecommendationsOutput> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    logger.info('AI Program Recommendations: Using mock generator', { reason: 'NEXT_PUBLIC_AI_MOCK=1' });
    return generateMockRecommendations(program, recentLogs);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    logger.warn('AI Program Recommendations: No API key found, using mock', { key: 'GOOGLE_GENAI_API_KEY' });
    return generateMockRecommendations(program, recentLogs);
  }

  try {
    // Prepare input
    const input: ProgramRecommendationsInput = {
      program,
      recentLogs,
    };

    // Try AI generation with retry logic (3 attempts with exponential backoff)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateRecommendationsWithAI(input);
        logger.info('AI Program Recommendations: Successfully generated', {
          recommendationsCount: result.recommendations.length,
          attempt: attempt + 1,
        });
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Exponential backoff: 100ms, 200ms
          const delay = 100 * Math.pow(2, attempt);
          logger.warn(`AI Program Recommendations: Retry after ${delay}ms`, { attempt: attempt + 1, error: lastError.message });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, fall back to mock
    logger.error('AI Program Recommendations: AI generation failed after retries, using mock', lastError);
    return generateMockRecommendations(program, recentLogs);
  } catch (error) {
    // Any other error, fall back to mock
    logger.error('AI Program Recommendations: Unexpected error, using mock', error instanceof Error ? error : new Error(String(error)));
    return generateMockRecommendations(program, recentLogs);
  }
}
