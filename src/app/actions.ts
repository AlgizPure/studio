'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { programTemplates } from '@/lib/program-templates';

/**
 * Вызывает поток оптимизатора тренировок ИИ для создания персонализированного расписания.
 * @param {AIRoutineOptimizerInput} input - Входные данные для оптимизатора, включая цели, доступность и предпочтения.
 * @returns {Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }>} Объект, указывающий на успех,
 * и содержащий либо оптимизированные данные о тренировках, либо сообщение об ошибке.
 */
export async function getOptimizedRoutine(
  input: AIRoutineOptimizerInput
): Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }> {
  console.log('[actions.ts] getOptimizedRoutine called with input:', input);
  try {
    const result = await aiRoutineOptimizer(input);
    console.log('[actions.ts] getOptimizedRoutine successful with result:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('[actions.ts] AI Routine Optimizer Error:', error);
    return { success: false, error: 'Не удалось сгенерировать новую программу. Пожалуйста, попробуйте еще раз.' };
  }
}

/**
 * Заполняет базу данных Firestore предопределенными шаблонами программ, если они еще не существуют.
 * Эта функция идемпотентна и выполняется только один раз.
 * @returns {Promise<{ success: boolean; message: string }>} Объект, указывающий на успех и сообщение.
 */
export async function seedProgramTemplates(): Promise<{ success: boolean; message: string }> {
  console.log('[actions.ts] seedProgramTemplates called.');
  try {
    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const batch = firestore.batch();

    const programsCol = firestore.collection('programs');
    const existingTemplates = await programsCol.where('isTemplate', '==', true).get();

    if (!existingTemplates.empty) {
      console.log('[actions.ts] Templates already exist. No action taken.');
      return { success: true, message: 'Templates already exist. No action taken.' };
    }
    
    console.log('[actions.ts] Seeding new program templates...');
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
    console.log('[actions.ts] Program templates seeded successfully.');
    return { success: true, message: 'Program templates seeded successfully.' };
  } catch (error: any) {
    console.error("[actions.ts] Error seeding program templates:", error);
    return { success: false, message: `Failed to seed templates: ${error.message}` };
  }
}
