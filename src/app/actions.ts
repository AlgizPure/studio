'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { programTemplates } from '@/lib/program-templates';
import { logger } from '@/lib/logger';

export async function getOptimizedRoutine(
  input: AIRoutineOptimizerInput
): Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }> {
  logger.debug('[actions.ts] getOptimizedRoutine called with input:', input);
  try {
    const result = await aiRoutineOptimizer(input);
    logger.debug('[actions.ts] getOptimizedRoutine successful with result:', result);
    return { success: true, data: result };
  } catch (error) {
    logger.error('[actions.ts] AI Routine Optimizer Error:', error);
    return { success: false, error: 'Failed to generate a new routine. Please try again.' };
  }
}

export async function seedProgramTemplates(): Promise<{ success: boolean; message: string }> {
  logger.debug('[actions.ts] seedProgramTemplates called.');
  try {
    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const batch = firestore.batch();

    const programsCol = firestore.collection('programs');
    const existingTemplates = await programsCol.where('isTemplate', '==', true).get();

    if (!existingTemplates.empty) {
      logger.debug('[actions.ts] Templates already exist. No action taken.');
      return { success: true, message: 'Templates already exist. No action taken.' };
    }
    
    logger.debug('[actions.ts] Seeding new program templates...');
    for (const template of programTemplates) {
      const { workouts, ...programData } = template;
      const programRef = programsCol.doc();
      batch.set(programRef, { ...programData, isTemplate: true });

      if (workouts && workouts.length > 0) {
        const workoutsCol = programRef.collection('workouts');
        for (const workout of workouts) {
          batch.set(workoutsCol.doc(), workout);
        }
      }
    }

    await batch.commit();
    logger.debug('[actions.ts] Program templates seeded successfully.');
    return { success: true, message: 'Program templates seeded successfully.' };
  } catch (error: unknown) {
    logger.error("[actions.ts] Error seeding program templates:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to seed templates: ${message}` };
  }
}
