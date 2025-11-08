import { AnalyticsCharts } from '@/components/analytics-charts';
import { AIInsightsCard } from '@/components/analytics/ai-insights-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useUserCollection } from '@/hooks/use-user-collection';
import { orderBy } from 'firebase/firestore';
import type { WorkoutLog, Program } from '@/lib/types';
import { generateFullAnalysisExport, downloadMarkdownFile } from '@/lib/ztl/export-full-analysis';
import { programToZTL, generateScheduledWorkouts, calculateCurrentWeek } from '@/lib/ztl/helpers';
import { convertWorkoutsToCSV, convertSetsToCSV, convertPRsToCSV, downloadCSV } from '@/lib/export-to-csv';
import { calculatePersonalRecords } from '@/lib/analytics';

export default function AnalyticsPage() {
  const { user } = useUser();

  const { data: workoutLogs } = useUserCollection<WorkoutLog>('workoutLogs', orderBy('startTime', 'desc'));
  const { data: programs } = useUserCollection<Program>('programs');

  const handleExportMarkdown = async () => {
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

  const handleExportWorkoutsCSV = () => {
    if (!workoutLogs || workoutLogs.length === 0) return;
    const csv = convertWorkoutsToCSV(workoutLogs);
    const filename = `zenith-workouts-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleExportSetsCSV = () => {
    if (!workoutLogs || workoutLogs.length === 0) return;
    const csv = convertSetsToCSV(workoutLogs);
    const filename = `zenith-sets-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleExportPRsCSV = () => {
    if (!workoutLogs || workoutLogs.length === 0) return;
    const records = calculatePersonalRecords(workoutLogs);
    const csv = convertPRsToCSV(records);
    const filename = `zenith-personal-records-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize your progress and trends.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleExportMarkdown}>
              <FileText className="mr-2 h-4 w-4" />
              Export for Claude Analysis
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleExportWorkoutsCSV}
              disabled={!workoutLogs || workoutLogs.length === 0}
            >
              <Table className="mr-2 h-4 w-4" />
              Export Workouts to CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportSetsCSV}
              disabled={!workoutLogs || workoutLogs.length === 0}
            >
              <Table className="mr-2 h-4 w-4" />
              Export Sets to CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportPRsCSV}
              disabled={!workoutLogs || workoutLogs.length === 0}
            >
              <Table className="mr-2 h-4 w-4" />
              Export Personal Records to CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AIInsightsCard />
      
      <AnalyticsCharts />
      
    </div>
  );
}
