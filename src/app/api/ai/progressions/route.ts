import { NextRequest, NextResponse } from 'next/server';
import { getProgressionSuggestions } from '@/ai/flows/progression-suggestions';
import { getRecentWorkouts, getExerciseHistory, getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileoverview Обработчик API-маршрута для генерации предложений по прогрессии.
 */

/**
 * Обрабатывает POST-запросы для генерации предложений по прогрессии.
 * @param {NextRequest} req - Объект запроса Next.js.
 * @returns {Promise<NextResponse>} - Объект ответа Next.js.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, programId } = body;

    if (!userId || !programId) {
      return NextResponse.json({ error: 'userId и programId являются обязательными' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);

    // Проверка лимитов использования
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'progressions');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Дневной лимит достигнут. Попробуйте завтра.',
        usage: usageCheck.usage,
      }, { status: 429 });
    }

    // Сначала попытка получить кэшированные данные
    const cached = await getCachedInsights(firestore, userId, 'progressions', undefined, programId);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        lastAnalyzed: cached.generatedAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Запрос программы
    const programDoc = await firestore.collection(`users/${userId}/programs`).doc(programId).get();
    
    if (!programDoc.exists) {
      return NextResponse.json({
        error: 'Программа не найдена',
      }, { status: 404 });
    }

    const program = { id: programDoc.id, ...programDoc.data() };

    // Запрос недавних тренировок (за последние 30 дней)
    const recentWorkouts = await getRecentWorkouts(firestore, userId, 30);
    
    if (recentWorkouts.length === 0) {
      return NextResponse.json({
        error: 'Недостаточно данных. Требуется как минимум 1 тренировка из этой программы.',
      }, { status: 400 });
    }

    // Получение истории упражнений
    const exerciseHistory = await getExerciseHistory(firestore, userId, programId, 30);

    if (Object.keys(exerciseHistory).length === 0) {
      return NextResponse.json({
        error: 'История упражнений для этой программы не найдена.',
      }, { status: 400 });
    }

    // Генерация предложений
    try {
      const result = await getProgressionSuggestions(program as any, recentWorkouts as any, exerciseHistory);
      const tokensUsed = (result as any).tokensUsed || 0;

      // Обновление использования с количеством токенов
      if (tokensUsed > 0) {
        const today = new Date().toISOString().split('T')[0];
        const usageDoc = await firestore.collection(`users/${userId}/aiUsage`).doc(today).get();
        const currentUsage = usageDoc.exists && usageDoc.data()
          ? usageDoc.data() as { date: string; insightsCount: number; progressionsCount: number; tokensUsed: number }
          : { date: today, insightsCount: 0, progressionsCount: 0, tokensUsed: 0 };
        await firestore.collection(`users/${userId}/aiUsage`).doc(today).set({
          ...currentUsage,
          date: today,
          tokensUsed: (currentUsage.tokensUsed || 0) + tokensUsed,
        }, { merge: true });
      }

      // Кэширование результата
      await saveInsightsCache(firestore, userId, 'progressions', result, undefined, programId, tokensUsed);

      return NextResponse.json({
        ...result,
        lastAnalyzed: new Date().toISOString(),
        fromCache: false,
      });
    } catch (error) {
      console.error('[api/ai/progressions] Ошибка генерации:', error);
      
      // Попытка вернуть кэшированные данные, даже если они устарели
      const expiredCache = await getCachedInsights(firestore, userId, 'progressions', undefined, programId);
      if (expiredCache) {
        return NextResponse.json({
          ...expiredCache.data,
          lastAnalyzed: expiredCache.generatedAt.toDate().toISOString(),
          fromCache: true,
          warning: 'Свежий анализ недоступен, показаны кэшированные данные',
        });
      }

      return NextResponse.json({
        error: 'Анализ недоступен. Пожалуйста, попробуйте еще раз позже.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[api/ai/progressions] Ошибка запроса:', error);
    return NextResponse.json({
      error: 'Внутренняя ошибка сервера',
    }, { status: 500 });
  }
}
