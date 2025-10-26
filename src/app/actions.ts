'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { programTemplates } from '@/lib/program-templates';

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

export async function seedProgramTemplates(): Promise<{ success: boolean; message: string }> {
  try {
    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const batch = firestore.batch();

    const programsCol = firestore.collection('programs');
    const existingTemplates = await programsCol.where('isTemplate', '==', true).get();

    if (!existingTemplates.empty) {
      return { success: true, message: 'Templates already exist. No action taken.' };
    }
    
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
    return { success: true, message: 'Program templates seeded successfully.' };
  } catch (error: any) {
    console.error("Error seeding program templates:", error);
    return { success: false, message: `Failed to seed templates: ${error.message}` };
  }
}
