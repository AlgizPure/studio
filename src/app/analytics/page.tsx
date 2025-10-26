import { AnalyticsCharts } from '@/components/analytics-charts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AnalyticsPage() {
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
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <AnalyticsCharts />
      
    </div>
  );
}
