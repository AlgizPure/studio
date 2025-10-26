'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const workoutData = [
  { day: 'Mon', workouts: 1 },
  { day: 'Tue', workouts: 1 },
  { day: 'Wed', workouts: 2 },
  { day: 'Thu', workouts: 1 },
  { day: 'Fri', workouts: 2 },
  { day: 'Sat', workouts: 2 },
  { day: 'Sun', workouts: 0 },
];

const habitData = [
  { name: 'Mindfulness', completed: 6, total: 7 },
  { name: 'Study', completed: 4, total: 7 },
  { name: 'Morning Run', completed: 5, total: 5 },
];

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Weekly Workout Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Habit Completion Rate (This Week)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habitData.map((habit) => (
            <div key={habit.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{habit.name}</span>
                <span className="text-sm text-muted-foreground">{habit.completed}/{habit.total}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(habit.completed / habit.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
