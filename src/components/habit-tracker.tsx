import { habits } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function HabitTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Daily Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => {
          const Icon = habit.icon;
          return (
            <div key={habit.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <Checkbox id={habit.id} defaultChecked={habit.completed} />
              <div className="flex-1">
                <Label htmlFor={habit.id} className="font-medium cursor-pointer">
                  {habit.name}
                </Label>
                <p className="text-xs text-muted-foreground">{habit.goal}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
