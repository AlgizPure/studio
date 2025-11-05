import { AnalyticsCharts } from '@/components/analytics-charts';
import { AIInsightsCard } from '@/components/analytics/ai-insights-card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, orderBy, query } from 'firebase/firestore';
import type { WorkoutLog, Program } from '@/lib/types';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { generateFullAnalysisExport, downloadMarkdownFile } from '@/lib/ztl/export-full-analysis';
import { programToZTL, generateScheduledWorkouts, calculateCurrentWeek } from '@/lib/ztl/helpers';

/**
 * @fileoverview Страница аналитики.
 * Отображает диаграммы прогресса, инсайты от AI и позволяет экспортировать данные.
 */

/**
 * Компонент страницы аналитики.
 * @returns {JSX.Element} - Страница аналитики.
 */
export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const workoutLogsQuery = useMemoFirebase(
    () =>
      user
        ? query(collection(firestore, `users/${user.uid}/workoutLogs`), orderBy('startTime', 'desc'))
        : null,
    [user, firestore]
  );
  const programsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/programs`)) : null),
    [user, firestore]
  );

  const { data: workoutLogs } = useCollection<WorkoutLog>(workoutLogsQuery);
  const { data: programs } = useCollection<Program>(programsQuery);

  /**
   * Обрабатывает экспорт данных для анализа.
   * Генерирует markdown-файл с полным анализом и загружает его.
   */
  const handleExport = async () => {
    if (!user) return;
    const activePrograms = await Promise.all(
      (programs || [])
        .filter((p) => p.status === 'active')
        .map(async (program) => {
          const ztl = programToZTL(program);
          const scheduledWorkouts = generateScheduledWorkouts(program, 90);
          return {
            program,
            ztl,
            currentWeek: calculateCurrentWeek(program),
            totalWeeks: program.durationType === 'fixed' ? Math.max(1, Math.ceil(((program as any)?.duration?.weeks || 0))) : 0,
            scheduledWorkouts,
          };
        })
    );

    const markdown = await generateFullAnalysisExport({
      userId: user.uid,
      userGoal: (user as any)?.goal,
      pastWorkouts: workoutLogs || [],
      activePrograms,
    });
    const filename = `zenith-analysis-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdownFile(markdown, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Аналитика
          </h1>
          <p className="text-muted-foreground">
            Визуализируйте свой прогресс и тенденции.
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт для анализа Claude
        </Button>
      </div>
      
      <AIInsightsCard />
      
      <AnalyticsCharts />
      
    </div>
  );
}
