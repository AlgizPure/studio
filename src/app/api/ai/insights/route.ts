import { NextRequest, NextResponse } from 'next/server';
import { getQuickInsights } from '@/ai/flows/quick-insights';
import { getRecentWorkouts, getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';
import type { Program } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, timeframe = '2weeks' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);
    const days = timeframe === '2weeks' ? 14 : 28;

    // Check usage limits
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'insights');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Daily limit reached. Try tomorrow.',
        usage: usageCheck.usage,
      }, { status: 429 });
    }

    // Try cached data first
    const cached = await getCachedInsights(firestore, userId, 'quick_insights', timeframe);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        generatedAt: cached.generatedAt.toDate().toISOString(),
        cacheUntil: cached.expiresAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Fetch data
    const workoutLogs = await getRecentWorkouts(firestore, userId, days);
    
    if (workoutLogs.length === 0) {
      return NextResponse.json({
        error: 'Insufficient data. Need at least 1 workout.',
      }, { status: 400 });
    }

    // Fetch active programs
    const programsSnapshot = await firestore.collection(`users/${userId}/programs`)
      .where('status', '==', 'active')
      .get();
    const programs: Program[] = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));

    // Fetch user goal (if stored in user profile)
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userGoal = userDoc.exists ? userDoc.data()?.goal : undefined;

    // Generate insights
    try {
      const result = await getQuickInsights(workoutLogs, programs, userGoal, timeframe);
      const tokensUsed = 0; // TODO: Extract tokensUsed from AI provider metadata

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
      await saveInsightsCache(firestore, userId, 'quick_insights', result, timeframe, undefined, tokensUsed);

      return NextResponse.json({
        ...result,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        fromCache: false,
      });
    } catch (error) {
      logger.error('[api/ai/insights] Generation error:', error);
      
      // Try to return cached data even if expired
      const expiredCache = await getCachedInsights(firestore, userId, 'quick_insights', timeframe);
      if (expiredCache) {
        return NextResponse.json({
          ...expiredCache.data,
          generatedAt: expiredCache.generatedAt.toDate().toISOString(),
          cacheUntil: expiredCache.expiresAt.toDate().toISOString(),
          fromCache: true,
          warning: 'Fresh analysis unavailable, showing cached data',
        });
      }

      return NextResponse.json({
        error: 'Analysis unavailable. Please try again later.',
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('[api/ai/insights] Request error:', error);
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 });
  }
}
