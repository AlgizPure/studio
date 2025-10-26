import { DailySchedule } from '@/components/daily-schedule';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Weekly Schedule
        </h1>
        <p className="text-muted-foreground">
          Your plan for the entire week.
        </p>
      </div>
      <DailySchedule />
    </div>
  );
}
