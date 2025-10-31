'use server';
/**
 * AI-powered daily reflection parser using Genkit + Gemini.
 * Falls back to mock parser if NEXT_PUBLIC_AI_MOCK=1 or API key is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { parseReflectionMock } from '@/lib/reflection';

const ParsedEntrySchema = z.object({
  habitId: z.string(),
  habitName: z.string(),
  extractedValue: z.number().positive().optional(),
  extractedDuration: z.number().positive().optional(),
  extractedNote: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
  energy: z.enum(['low', 'neutral', 'high']).optional(),
  confidence: z.number().min(0).max(1),
  suggestedStatus: z.enum(['done', 'partial', 'skipped', 'missed']),
});

const ParseReflectionInputSchema = z.object({
  rawText: z.string().min(1),
  habits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['boolean', 'quantity', 'duration', 'range']).optional(),
  })),
});

const ParseReflectionOutputSchema = z.object({
  entries: z.array(ParsedEntrySchema),
  summary: z.string().optional(),
});

export type ParseReflectionInput = z.infer<typeof ParseReflectionInputSchema>;
export type ParseReflectionOutput = z.infer<typeof ParseReflectionOutputSchema>;
export type ParsedEntry = z.infer<typeof ParsedEntrySchema>;

/**
 * Real AI parsing using Gemini via Genkit.
 */
async function parseReflectionWithAI(input: ParseReflectionInput): Promise<ParseReflectionOutput> {
  const habitsList = input.habits.map(h => `- ${h.name} (ID: ${h.id}, Type: ${h.type || 'boolean'})`).join('\n');
  
  const prompt = ai.definePrompt({
    name: 'parseReflectionPrompt',
    input: { schema: ParseReflectionInputSchema },
    output: { schema: ParseReflectionOutputSchema },
    prompt: `You are an AI assistant that parses daily reflection text to extract habit completion information.

User's habits:
${habitsList}

Instructions:
1. Analyze the reflection text and identify mentions of habits (by name or description).
2. For each habit mentioned, extract:
   - completion status (done/partial/skipped/missed)
   - numeric values if mentioned (quantity or duration in minutes)
   - mood/energy if mentioned
   - any relevant notes
3. Set confidence based on how clearly the habit is mentioned (0.0-1.0).
4. If a habit is mentioned but no status is clear, default to 'partial' with lower confidence.

Reflection text:
{{{rawText}}}

Return a structured JSON response with entries array matching the schema.`,
  });

  try {
    const result = await prompt({ 
      rawText: input.rawText,
      habits: input.habits,
    });
    // Genkit returns a wrapper; use .output for typed result
    // @ts-expect-error genkit type wrapper
    return result.output ?? result;
  } catch (error) {
    console.error('[parse-reflection] AI parsing error:', error);
    throw error;
  }
}

/**
 * Main parsing function with fallback logic.
 */
export async function parseDailyReflection(
  rawText: string,
  habits: Habit[]
): Promise<ParsedEntry[]> {
  // Check if mock mode is enabled
  if (process.env.NEXT_PUBLIC_AI_MOCK === '1') {
    console.log('[parse-reflection] Using mock parser (NEXT_PUBLIC_AI_MOCK=1)');
    return parseReflectionMock(rawText, habits);
  }

  // Check if API key is available
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('[parse-reflection] No GOOGLE_GENAI_API_KEY found, falling back to mock');
    return parseReflectionMock(rawText, habits);
  }

  try {
    // Prepare input
    const input: ParseReflectionInput = {
      rawText,
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        type: 'type' in h ? (h.type as 'boolean' | 'quantity' | 'duration' | 'range') : undefined,
      })),
    };

    // Try AI parsing with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await parseReflectionWithAI(input);
        return result.entries;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          // Exponential backoff: 100ms, 200ms, 400ms
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }

    // If all retries failed, fall back to mock
    console.error('[parse-reflection] AI parsing failed after retries, falling back to mock:', lastError);
    return parseReflectionMock(rawText, habits);
  } catch (error) {
    // Any other error, fall back to mock
    console.error('[parse-reflection] Unexpected error, falling back to mock:', error);
    return parseReflectionMock(rawText, habits);
  }
}

