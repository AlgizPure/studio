'use client';
import { weeklySchedule } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TodaySchedule() {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleString('en-US', { weekday: 'long' }));
  }, []);
  
  const todaySchedule = weeklySchedule.find((d) => d.day === today);

  if (!todaySchedule) {
    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle className="font-headline">Today's Activities</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Loading schedule...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline">Today's Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {todaySchedule.items.length > 0 ? (
          <div className="space-y-4">
            {todaySchedule.items.map((item) => {
              const Icon = item.icon as LucideIcon;
              const itemId = `today-${item.id}`;
              return (
                <div key={item.id} className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox id={itemId} className="mr-4" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={itemId} className="font-semibold cursor-pointer">{item.activityName}</Label>
                    <p className="text-sm text-muted-foreground">{item.time} &middot; {item.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Rest day. Well deserved!</p>
        )}
      </CardContent>
    </Card>
  );
}
