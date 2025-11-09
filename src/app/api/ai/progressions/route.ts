import { NextRequest, NextResponse } from 'next/server';
import { getProgressionSuggestions } from '@/ai/flows/progression-suggestions';
import { getRecentWorkouts, getExerciseHistory, getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, programId } = body;

    if (!userId || !programId) {
      return NextResponse.json({ error: 'userId and programId are required' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);

    // Check usage limits
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'progressions');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Daily limit reached. Try tomorrow.',
        usage: usageCheck.usage,
      }, { status: 429 });
    }

    // Try cached data first
    const cached = await getCachedInsights(firestore, userId, 'progressions', undefined, programId);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        lastAnalyzed: cached.generatedAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Fetch program
    const programDoc = await firestore.collection(`users/${userId}/programs`).doc(programId).get();
    
    if (!programDoc.exists) {
      return NextResponse.json({
        error: 'Program not found',
      }, { status: 404 });
    }

    const program = { id: programDoc.id, ...programDoc.data() };

    // Fetch recent workouts (last 30 days)
    const recentWorkouts = await getRecentWorkouts(firestore, userId, 30);
    
    if (recentWorkouts.length === 0) {
      return NextResponse.json({
        error: 'Insufficient data. Need at least 1 workout from this program.',
      }, { status: 400 });
    }

    // Get exercise history
    const exerciseHistory = await getExerciseHistory(firestore, userId, programId, 30);

    if (Object.keys(exerciseHistory).length === 0) {
      return NextResponse.json({
        error: 'No exercise history found for this program.',
      }, { status: 400 });
    }

    // Generate suggestions
    try {
      const result = await getProgressionSuggestions(program as any, recentWorkouts as any, exerciseHistory);
      const tokensUsed = (result as any).tokensUsed || 0;

      // Update usage with token count
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

      // Cache result
      await saveInsightsCache(firestore, userId, 'progressions', result, undefined, programId, tokensUsed);

      return NextResponse.json({
        ...result,
        lastAnalyzed: new Date().toISOString(),
        fromCache: false,
      });
    } catch (error) {
      logger.error('[api/ai/progressions] Generation error:', error);
      
      // Try to return cached data even if expired
      const expiredCache = await getCachedInsights(firestore, userId, 'progressions', undefined, programId);
      if (expiredCache) {
        return NextResponse.json({
          ...expiredCache.data,
          lastAnalyzed: expiredCache.generatedAt.toDate().toISOString(),
          fromCache: true,
          warning: 'Fresh analysis unavailable, showing cached data',
        });
      }

      return NextResponse.json({
        error: 'Analysis unavailable. Please try again later.',
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('[api/ai/progressions] Request error:', error);
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 });
  }
}
