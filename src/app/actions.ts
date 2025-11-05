'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { programTemplates } from '@/lib/program-templates';

/**
 * Получает оптимизированный распорядок дня от AI.
 * @param {AIRoutineOptimizerInput} input - Входные данные для оптимизатора распорядка.
 * @returns {Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }>} - Объект с результатом операции.
 */
export async function getOptimizedRoutine(
  input: AIRoutineOptimizerInput
): Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }> {
  console.log('[actions.ts] вызвана функция getOptimizedRoutine с входными данными:', input);
  try {
    const result = await aiRoutineOptimizer(input);
    console.log('[actions.ts] getOptimizedRoutine успешно выполнена с результатом:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('[actions.ts] Ошибка оптимизатора распорядка AI:', error);
    return { success: false, error: 'Не удалось сгенерировать новый распорядок. Пожалуйста, попробуйте еще раз.' };
  }
}

/**
 * Заполняет базу данных шаблонами программ тренировок.
 * @returns {Promise<{ success: boolean; message: string }>} - Объект с сообщением о результате.
 */
export async function seedProgramTemplates(): Promise<{ success: boolean; message: string }> {
  console.log('[actions.ts] вызвана функция seedProgramTemplates.');
  try {
    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const batch = firestore.batch();

    const programsCol = firestore.collection('programs');
    const existingTemplates = await programsCol.where('isTemplate', '==', true).get();

    if (!existingTemplates.empty) {
      console.log('[actions.ts] Шаблоны уже существуют. Действий не предпринято.');
      return { success: true, message: 'Шаблоны уже существуют. Действий не предпринято.' };
    }
    
    console.log('[actions.ts] Заполнение новыми шаблонами программ...');
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
    console.log('[actions.ts] Шаблоны программ успешно заполнены.');
    return { success: true, message: 'Шаблоны программ успешно заполнены.' };
  } catch (error: any) {
    console.error("[actions.ts] Ошибка при заполнении шаблонов программ:", error);
    return { success: false, message: `Не удалось заполнить шаблоны: ${error.message}` };
  }
}
