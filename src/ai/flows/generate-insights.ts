'use server';
/**
 * AI-powered insights generation using Genkit + Gemini.
 * Falls back to mock generator if NEXT_PUBLIC_AI_MOCK=1 or API key is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { HabitLog, HabitInsight, AnalysisSystem } from '@/lib/types';
import { generateInsightsFromLogsMock } from '@/lib/insights';

const HabitInsightSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  systemId: z.string(),
  type: z.enum(['warning', 'recommendation', 'achievement']),
  priority: z.number().min(1).max(5),
  title: z.string(),
  description: z.string(),
  data: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

const GenerateInsightsInputSchema = z.object({
  logs: z.array(z.object({
    id: z.string(),
    habitId: z.string(),
    date: z.string(),
    status: z.enum(['done', 'partial', 'skipped', 'missed']),
    value: z.number().optional(),
    durationMin: z.number().optional(),
    contextData: z.record(z.any()).optional(),
  })),
  activeSystems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    habitParameters: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).optional(),
  })),
});

const GenerateInsightsOutputSchema = z.object({
  insights: z.array(HabitInsightSchema),
  summary: z.string().optional(),
});

export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

/**
 * Real AI insights generation using Gemini via Genkit.
 */
async function generateInsightsWithAI(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  const systemsList = input.activeSystems.map(s => 
    `- ${s.name} (ID: ${s.id}): ${s.description || 'No description'}`
  ).join('\n');
  
  // Prepare logs summary
  const logsSummary = input.logs.slice(0, 100).map(l => {
    const date = l.date;
    const status = l.status;
    const context = l.contextData ? JSON.stringify(l.contextData) : '';
    return `Date: ${date}, Status: ${status}${context ? `, Context: ${context}` : ''}`;
  }).join('\n');

  const prompt = ai.definePrompt({
    name: 'generateInsightsPrompt',
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `You are an AI life coach that analyzes habit completion logs and generates actionable insights.

Active analysis systems:
${systemsList}

Recent logs (sample):
${logsSummary}

Instructions:
1. Analyze the logs and identify patterns, imbalances, or opportunities.
2. For each active system, check if there are any warnings, recommendations, or achievements.
3. Generate insights based on:
   - Wheel of Life: Check if any life areas (health, career, relationships, growth, finance, recreation, environment, spirituality) are consistently weak (<40% completion).
   - Maslow Hierarchy: Check if base needs (physiological, safety) are unstable (<60% completion).
   - Any other active systems: Generate insights based on their specific parameters.
4. Each insight should have:
   - type: 'warning' (urgent issues), 'recommendation' (suggestions), or 'achievement' (positive milestones)
   - priority: 1-5 (5 is most urgent)
   - title: Short, actionable title
   - description: Detailed explanation with specific data
   - data: Optional metrics/numbers to support the insight
5. Limit to top 5 most important insights.

Return structured JSON response with insights array matching the schema.`,
  });

  try {
    const result = await prompt({
      logs: input.logs,
      activeSystems: input.activeSystems,
    });
    // Genkit returns a wrapper; use .output for typed result
    // @ts-expect-error - Genkit type wrapper issue
    return result.output ?? result;
  } catch (error) {
    console.error('[generate-insights] AI generation error:', error);
    throw error;
  }
}

/**
 * Main insights generation function with fallback logic.
 */
export async function generateInsights(
  logs: HabitLog[],
  activeSystems: AnalysisSystem[]
): Promise<HabitInsight[]> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[generate-insights] Using mock generator (NEXT_PUBLIC_AI_MOCK=1)');
    return generateInsightsFromLogsMock(logs);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[generate-insights] No GOOGLE_GENAI_API_KEY found, falling back to mock');
    return generateInsightsFromLogsMock(logs);
  }

  try {
    // Prepare input
    const input: GenerateInsightsInput = {
      logs: logs.map(l => ({
        id: l.id,
        habitId: l.habitId,
        date: l.date,
        status: l.status,
        value: l.value,
        durationMin: l.durationMin,
        contextData: l.contextData,
      })),
      activeSystems: activeSystems.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        habitParameters: (s.habitParameters || []).map(p => ({
          id: p.id,
          name: (p as any).name ?? p.label ?? p.id,
          type: p.type,
        })),
      })),
    };

    // Try AI generation with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateInsightsWithAI(input);
        // Add IDs if missing and coerce priority to 1..5 union
        return result.insights.map(ins => ({
          ...ins,
          id: (ins as any).id || crypto.randomUUID(),
          createdAt: (ins as any).createdAt || new Date().toISOString(),
          priority: (Math.max(1, Math.min(5, (ins as any).priority ?? 3)) as 1 | 2 | 3 | 4 | 5),
        })) as HabitInsight[];
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // If all retries failed, fall back to mock
    console.error('[generate-insights] AI generation failed after retries, falling back to mock:', lastError);
    return generateInsightsFromLogsMock(logs);
  } catch (error) {
    // Any other error, fall back to mock
    console.error('[generate-insights] Unexpected error, falling back to mock:', error);
    return generateInsightsFromLogsMock(logs);
  }
}

