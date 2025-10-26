import { weeklySchedule } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import type { LucideIcon } from 'lucide-react';

export function DailySchedule() {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={today} className="w-full">
          {weeklySchedule.map(({ day, items }) => (
            <AccordionItem value={day} key={day}>
              <AccordionTrigger className="font-semibold">
                {day}
                {day === today && <Badge className="ml-2">Today</Badge>}
              </AccordionTrigger>
              <AccordionContent>
                {items.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {items.map((item) => {
                        const Icon = item.icon as LucideIcon;
                        return (
                          <div key={item.id} className="flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{item.activityName}</p>
                                <p className="text-sm text-muted-foreground">{item.time}</p>
                            </div>
                            <Badge variant="outline">{item.duration}</Badge>
                          </div>
                        )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground pt-2">Rest day. Well deserved!</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
