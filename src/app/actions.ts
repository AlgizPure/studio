'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';

export async function getOptimizedRoutine(
  input: AIRoutineOptimizerInput
): Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }> {
  try {
    const result = await aiRoutineOptimizer(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Routine Optimizer Error:', error);
    return { success: false, error: 'Failed to generate a new routine. Please try again.' };
  }
}
