import { NextRequest, NextResponse } from 'next/server';
import { generateHabitInsights, type HabitInsightsInput } from '@/ai/flows/habit-insights';
import { getCachedInsights, saveInsightsCache, checkAndUpdateUsage } from '@/lib/ai-helpers';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';
import type { Habit, DailyReflection, WeeklyContext } from '@/lib/types';
import { subWeeks, formatISO } from 'date-fns';

/**
 * POST /api/ai/habit-insights
 *
 * Generates AI insights from habits, daily reflections, and weekly life balance data.
 *
 * Request body:
 * - userId: string (required)
 * - weeksBack: number (optional, default 8)
 *
 * Response:
 * - insights: Array of insight objects
 * - summary: Overall assessment
 * - generatedAt: ISO timestamp
 * - fromCache: boolean
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.8 - AI Insights (Stage 5)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, weeksBack = 8 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const firestore = getFirestore(adminApp);

    // Check usage limits
    const usageCheck = await checkAndUpdateUsage(firestore, userId, 'insights');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'Daily limit reached. Try tomorrow.',
        usage: usageCheck.usage,
      }, { status: 429 });
    }

    // Try cached data first (24 hour cache)
    const cacheKey = `habit_insights_${weeksBack}w`;
    const cached = await getCachedInsights(firestore, userId, cacheKey, undefined);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        generatedAt: cached.generatedAt.toDate().toISOString(),
        cacheUntil: cached.expiresAt.toDate().toISOString(),
        fromCache: true,
      });
    }

    // Fetch habits
    const habitsSnapshot = await firestore
      .collection(`users/${userId}/habits`)
      .get();
    const habits: Habit[] = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

    if (habits.length === 0) {
      return NextResponse.json({
        error: 'No habits found. Create some habits first!',
      }, { status: 400 });
    }

    // Fetch daily reflections (last N weeks)
    const cutoffDate = subWeeks(new Date(), weeksBack);
    const reflectionsSnapshot = await firestore
      .collection(`users/${userId}/dailyReflections`)
      .where('date', '>=', formatISO(cutoffDate, { representation: 'date' }))
      .orderBy('date', 'desc')
      .get();
    const reflections: DailyReflection[] = reflectionsSnapshot.docs.map(doc => doc.data() as DailyReflection);

    // Fetch weekly contexts (last N weeks)
    const weeklyContextsSnapshot = await firestore
      .collection(`users/${userId}/weeklyContexts`)
      .where('weekStart', '>=', formatISO(cutoffDate, { representation: 'date' }))
      .orderBy('weekStart', 'desc')
      .limit(weeksBack)
      .get();
    const weeklyContexts: WeeklyContext[] = weeklyContextsSnapshot.docs.map(doc => doc.data() as WeeklyContext);

    // Calculate completion rates for habits (last 30 days)
    const thirtyDaysAgo = subWeeks(new Date(), 4);
    const habitLogsSnapshot = await firestore
      .collection(`users/${userId}/habitLogs`)
      .where('date', '>=', formatISO(thirtyDaysAgo, { representation: 'date' }))
      .get();

    const habitCompletionCounts = new Map<string, { completed: number; total: number }>();
    habitLogsSnapshot.docs.forEach(doc => {
      const log = doc.data();
      const habitId = log.habitId;
      if (!habitCompletionCounts.has(habitId)) {
        habitCompletionCounts.set(habitId, { completed: 0, total: 0 });
      }
      const counts = habitCompletionCounts.get(habitId)!;
      counts.total++;
      if (log.status === 'done') {
        counts.completed++;
      }
    });

    // Prepare AI input
    const input: HabitInsightsInput = {
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        type: h.type,
        completed: h.completed,
        completionRate: habitCompletionCounts.has(h.id)
          ? habitCompletionCounts.get(h.id)!.completed / habitCompletionCounts.get(h.id)!.total
          : undefined,
        currentStreak: h.currentStreak,
      })),
      reflections: reflections.map(r => ({
        date: r.date,
        mood: r.mood,
        energy: r.energy,
        stress: r.stress,
        sleepQuality: r.sleepQuality,
      })),
      weeklyContexts: weeklyContexts.map(wc => ({
        weekStart: wc.weekStart,
        fitness: wc.contexts.fitness,
        career: wc.contexts.career,
        relationships: wc.contexts.relationships,
        growth: wc.contexts.growth,
        environment: wc.contexts.environment,
        fun: wc.contexts.fun,
        contribution: wc.contexts.contribution,
        spirituality: wc.contexts.spirituality,
      })),
    };

    // Generate insights
    try {
      const result = await generateHabitInsights(input);

      // Cache result (24 hours)
      await saveInsightsCache(firestore, userId, cacheKey, result, undefined, undefined, 0);

      return NextResponse.json({
        ...result,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fromCache: false,
      });
    } catch (error) {
      logger.error('[api/ai/habit-insights] Generation error:', error);

      // Try to return cached data even if expired
      const expiredCache = await getCachedInsights(firestore, userId, cacheKey, undefined);
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
    logger.error('[api/ai/habit-insights] Request error:', error);
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 });
  }
}
