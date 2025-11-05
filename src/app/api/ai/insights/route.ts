import { NextRequest, NextResponse } from 'next/server';
import { getQuickInsights } from '@/ai/flows/quick-insights';
import { getRecentWorkouts, getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileoverview Обработчик API-маршрута для генерации быстрых инсайтов.
 */

/**
 * Обрабатывает POST-запросы для генерации быстрых инсайтов.
 * @param {NextRequest} req - Объект запроса Next.js.
 * @returns {Promise<NextResponse>} - Объект ответа Next.js.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, timeframe = '2weeks' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId является обязательным' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const days = timeframe === '2weeks' ? 14 : 28;

    // Проверка лимитов использования
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'insights');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Дневной лимит достигнут. Попробуйте завтра.',
        usage: usageCheck.usage,
      }, { status: 429 });
    }

    // Сначала попытка получить кэшированные данные
    const cached = await getCachedInsights(firestore, userId, 'quick_insights', timeframe);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        generatedAt: cached.generatedAt.toDate().toISOString(),
        cacheUntil: cached.expiresAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Запрос данных
    const workoutLogs = await getRecentWorkouts(firestore, userId, days);
    
    if (workoutLogs.length === 0) {
      return NextResponse.json({
        error: 'Недостаточно данных. Требуется как минимум 1 тренировка.',
      }, { status: 400 });
    }

    // Запрос активных программ
    const programsSnapshot = await firestore.collection(`users/${userId}/programs`)
      .where('status', '==', 'active')
      .get();
    const programs = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Запрос цели пользователя (если хранится в профиле пользователя)
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userGoal = userDoc.exists ? userDoc.data()?.goal : undefined;

    // Генерация инсайтов
    try {
      const result = await getQuickInsights(workoutLogs as any, programs as any[], userGoal, timeframe);
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
      await saveInsightsCache(firestore, userId, 'quick_insights', result, timeframe, undefined, tokensUsed);

      return NextResponse.json({
        ...result,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
        fromCache: false,
      });
    } catch (error) {
      console.error('[api/ai/insights] Ошибка генерации:', error);
      
      // Попытка вернуть кэшированные данные, даже если они устарели
      const expiredCache = await getCachedInsights(firestore, userId, 'quick_insights', timeframe);
      if (expiredCache) {
        return NextResponse.json({
          ...expiredCache.data,
          generatedAt: expiredCache.generatedAt.toDate().toISOString(),
          cacheUntil: expiredCache.expiresAt.toDate().toISOString(),
          fromCache: true,
          warning: 'Свежий анализ недоступен, показаны кэшированные данные',
        });
      }

      return NextResponse.json({
        error: 'Анализ недоступен. Пожалуйста, попробуйте еще раз позже.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[api/ai/insights] Ошибка запроса:', error);
    return NextResponse.json({
      error: 'Внутренняя ошибка сервера',
    }, { status: 500 });
  }
}
