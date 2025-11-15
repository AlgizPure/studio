import { NextRequest, NextResponse } from 'next/server';
import { getAIProgramRecommendations } from '@/ai/flows/ai-program-recommendations';
import { getRecentWorkouts, getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';
import type { ZTLProgram, WorkoutLog } from '@/lib/ztl/types';

/**
 * POST /api/ai/recommendations
 *
 * Generate AI-powered program recommendations based on program structure and recent workout logs.
 *
 * Request body:
 * - userId: string (required)
 * - programId: string (required)
 * - daysBack: number (optional, default 90) - How many days of workout logs to analyze
 *
 * Response:
 * - recommendations: AIRecommendation[] - Array of recommendations with ZTL patches
 * - summary: string - Overall program health summary
 * - generatedAt: string - ISO timestamp
 * - cacheUntil: string - ISO timestamp (24h cache)
 * - fromCache: boolean
 *
 * Error responses:
 * - 400: Missing required fields or insufficient data
 * - 429: Daily usage limit reached
 * - 500: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, programId, daysBack = 90 } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);

    // Check usage limits (use 'progressions' key for program recommendations)
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'progressions');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Daily limit reached. Try tomorrow.',
          usage: usageCheck.usage,
        },
        { status: 429 }
      );
    }

    // Try cached data first (cache key includes programId and daysBack)
    const cacheKey = `recommendations_${programId}_${daysBack}d`;
    const cached = await getCachedInsights(firestore, userId, cacheKey);
    if (cached) {
      logger.info('[api/ai/recommendations] Returning cached recommendations', {
        userId,
        programId,
        daysBack,
      });
      return NextResponse.json({
        ...cached.data,
        generatedAt: cached.generatedAt.toDate().toISOString(),
        cacheUntil: cached.expiresAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Fetch program from Firestore
    const programDoc = await firestore.collection(`users/${userId}/programs`).doc(programId).get();

    if (!programDoc.exists) {
      return NextResponse.json(
        { error: `Program not found: ${programId}` },
        { status: 400 }
      );
    }

    const programData = programDoc.data();

    // Check if program has ZTL structure (meta, workouts, etc.)
    if (!programData?.meta || !programData?.workouts) {
      return NextResponse.json(
        { error: 'Program does not have ZTL structure. Cannot generate recommendations.' },
        { status: 400 }
      );
    }

    const program = programData as ZTLProgram;

    // Fetch recent workout logs
    const workoutLogs = await getRecentWorkouts(firestore, userId, daysBack);

    // Filter logs for this program only
    const programLogs = workoutLogs.filter(
      log => log.programId === programId
    ) as WorkoutLog[];

    if (programLogs.length === 0) {
      return NextResponse.json(
        {
          error: 'Insufficient data. Need at least 1 workout log for this program.',
          suggestion: 'Complete a few workouts and try again.',
        },
        { status: 400 }
      );
    }

    logger.info('[api/ai/recommendations] Generating recommendations', {
      userId,
      programId,
      programName: program.meta.name,
      logsCount: programLogs.length,
      daysBack,
    });

    // Generate recommendations
    try {
      const result = await getAIProgramRecommendations(program, programLogs);
      const tokensUsed = 0; // TODO: Extract tokensUsed from Genkit metadata

      // Update usage with token count
      if (tokensUsed > 0) {
        const today = new Date().toISOString().split('T')[0];
        const usageDoc = await firestore
          .collection(`users/${userId}/aiUsage`)
          .doc(today)
          .get();
        const currentUsage = usageDoc.exists && usageDoc.data()
          ? (usageDoc.data() as {
              date: string;
              insightsCount: number;
              progressionsCount: number;
              tokensUsed: number;
            })
          : { date: today, insightsCount: 0, progressionsCount: 0, tokensUsed: 0 };
        await firestore
          .collection(`users/${userId}/aiUsage`)
          .doc(today)
          .set(
            {
              ...currentUsage,
              date: today,
              tokensUsed: (currentUsage.tokensUsed || 0) + tokensUsed,
            },
            { merge: true }
          );
      }

      // Cache result (24h cache)
      await saveInsightsCache(
        firestore,
        userId,
        cacheKey,
        result,
        undefined,
        undefined,
        tokensUsed
      );

      logger.info('[api/ai/recommendations] Successfully generated recommendations', {
        userId,
        programId,
        recommendationsCount: result.recommendations.length,
      });

      return NextResponse.json({
        ...result,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        fromCache: false,
      });
    } catch (error) {
      logger.error('[api/ai/recommendations] Generation error:', error);

      // Try to return cached data even if expired
      const expiredCache = await getCachedInsights(firestore, userId, cacheKey);
      if (expiredCache) {
        logger.warn('[api/ai/recommendations] Returning expired cache due to error', {
          userId,
          programId,
        });
        return NextResponse.json({
          ...expiredCache.data,
          generatedAt: expiredCache.generatedAt.toDate().toISOString(),
          cacheUntil: expiredCache.expiresAt.toDate().toISOString(),
          fromCache: true,
          warning: 'Fresh analysis unavailable, showing cached data',
        });
      }

      return NextResponse.json(
        {
          error: 'Analysis unavailable. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('[api/ai/recommendations] Request error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
