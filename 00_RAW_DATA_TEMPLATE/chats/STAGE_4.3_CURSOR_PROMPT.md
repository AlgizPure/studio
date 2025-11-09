# 🎯 STAGE 4.3 - ADVANCED ANALYTICS & VISUALIZATIONS
## Cursor AI Implementation Prompt

---

## 📋 КОНТЕКСТ ПРОЕКТА

**Приложение:** Zenith Trainer - фитнес трекер с AI аналитикой  
**Стек:** Next.js 15, React 18, TypeScript, Firebase Firestore, Recharts  
**Текущий этап:** Stage 4.3 - расширенная визуализация и аналитика  

**Что уже реализовано (Stage 4.1-4.2.2):**
- ✅ `VolumeChart` - график объема с трендом
- ✅ `ExerciseProgressChart` - прогресс упражнений (вес + RPE)
- ✅ `StatsCards` - 4 карточки статистики
- ✅ `analytics-utils.ts` - утилиты расчетов
- ✅ AI insights (Gemini) + progression suggestions
- ✅ Export для Claude анализа

**Структура данных (`WorkoutLog`):**
```typescript
type WorkoutLog = {
  id: string;
  workoutId: string;
  programId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime: string;
  duration: number; // minutes
  status: 'completed' | 'skipped';
  totalVolume: number; // kg (weight × reps)
  cycles: CycleLog[];
  userFeedback?: string;
  feedbackTags?: string[];
};

type CycleLog = {
  cycleId: string;
  cycleNumber: number;
  exercises: ExerciseLog[];
  completed: boolean;
};

type ExerciseLog = {
  exerciseId: string;
  sets: SetLog[];
  skipped: boolean;
};

type SetLog = {
  setNumber: number;
  reps: number;
  weight?: number;
  rpe?: number; // 1-10
  completed: boolean;
  timestamp: string;
};
```

---

## 🎯 ЦЕЛЬ STAGE 4.3

Добавить 6 новых компонентов продвинутой аналитики:

1. **Frequency Heatmap** - тепловая карта активности
2. **PR Tracker** - трекер личных рекордов
3. **RPE Distribution** - распределение интенсивности
4. **Period Comparison** - сравнение периодов
5. **CSV Export** - экспорт данных
6. **Body Metrics** (опционально) - отслеживание показателей тела

---

## 📦 КОМПОНЕНТ 1: FREQUENCY HEATMAP

### Описание
Календарная тепловая карта показывающая активность тренировок по дням недели и времени.

### Расположение файла
`src/components/analytics/frequency-heatmap.tsx`

### Зависимости
- `recharts` (уже установлен)
- `@/lib/types` (WorkoutLog)
- `@/lib/analytics-utils` (getWorkoutsByDateRange, TimeRange)
- `@/components/ui/card`

### Интерфейс компонента
```typescript
interface FrequencyHeatmapProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}
```

### Логика работы
1. **Группировка по дням недели:**
   - Подсчет тренировок для каждого дня недели (Пн-Вс)
   - Диапазон: последние 90 дней или по выбранному timeRange

2. **Данные для визуализации:**
```typescript
type HeatmapData = {
  dayOfWeek: string; // 'Mon', 'Tue', ...
  count: number; // количество тренировок
  intensity: number; // 0-100% для цвета
};
```

3. **Цветовая шкала:**
   - 0 тренировок: `hsl(var(--muted))` (серый)
   - 1-2 тренировки: `hsl(var(--primary) / 0.3)` (светло-синий)
   - 3-4 тренировки: `hsl(var(--primary) / 0.6)` (средне-синий)
   - 5+ тренировок: `hsl(var(--primary))` (темно-синий)

4. **Recharts компонент:**
   - Используй `BarChart` с горизонтальной ориентацией
   - XAxis: количество тренировок
   - YAxis: дни недели
   - Tooltip с деталями

### Утилита для расчета
Добавь в `src/lib/analytics-utils.ts`:

```typescript
export type DayFrequency = {
  dayOfWeek: string;
  dayIndex: number; // 0-6 (Mon=0)
  count: number;
  avgVolume: number;
  avgDuration: number;
};

export function calculateDayFrequency(workouts: WorkoutLog[]): DayFrequency[] {
  const dayMap = new Map<number, { count: number; volume: number; duration: number }>();
  
  // Инициализация всех дней недели
  for (let i = 0; i < 7; i++) {
    dayMap.set(i, { count: 0, volume: 0, duration: 0 });
  }
  
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0
    
    const day = dayMap.get(dayIndex)!;
    day.count++;
    day.volume += workout.totalVolume || 0;
    day.duration += workout.duration || 0;
  });
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return Array.from(dayMap.entries()).map(([index, data]) => ({
    dayOfWeek: dayNames[index],
    dayIndex: index,
    count: data.count,
    avgVolume: data.count > 0 ? Math.round(data.volume / data.count) : 0,
    avgDuration: data.count > 0 ? Math.round(data.duration / data.count) : 0,
  }));
}
```

### UI структура
```tsx
<Card>
  <CardHeader>
    <CardTitle>Training Frequency</CardTitle>
    <CardDescription>
      Workouts by day of week (last {timeRangeLabel})
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={heatmapData}
        layout="horizontal"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="dayOfWeek" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### Empty state
Если нет данных - показать:
```tsx
<div className="flex h-[300px] items-center justify-center text-muted-foreground">
  <p>Complete more workouts to see frequency patterns</p>
</div>
```

---

## 📦 КОМПОНЕНТ 2: PR TRACKER

### Описание
Таблица личных рекордов (Personal Records) по каждому упражнению.

### Расположение файла
`src/components/analytics/pr-tracker.tsx`

### Зависимости
- `@/lib/types` (WorkoutLog, ExerciseLog)
- `@/components/ui/card`, `@/components/ui/table`
- `@/components/ui/badge`

### Интерфейс компонента
```typescript
interface PRTrackerProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}
```

### Типы данных
```typescript
type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxVolume: number; // за одну тренировку
  maxReps: number; // за один подход
  date: string; // дата установки рекорда
  recentProgress: 'improving' | 'stable' | 'declining';
};
```

### Логика работы

1. **Расчет рекордов:**
```typescript
export function calculatePersonalRecords(workouts: WorkoutLog[]): PersonalRecord[] {
  const exerciseRecords = new Map<string, PersonalRecord>();
  
  workouts.forEach(workout => {
    workout.cycles.forEach(cycle => {
      cycle.exercises.forEach(exercise => {
        const exId = exercise.exerciseId;
        
        // Максимальный вес за один подход
        const maxWeightInSession = Math.max(
          ...exercise.sets
            .filter(s => s.completed && s.weight)
            .map(s => s.weight!)
        );
        
        // Максимальные повторения
        const maxRepsInSession = Math.max(
          ...exercise.sets.map(s => s.reps)
        );
        
        // Объем за тренировку
        const volumeInSession = exercise.sets
          .filter(s => s.completed && s.weight)
          .reduce((sum, s) => sum + s.weight! * s.reps, 0);
        
        const existing = exerciseRecords.get(exId);
        
        if (!existing || maxWeightInSession > existing.maxWeight) {
          exerciseRecords.set(exId, {
            exerciseId: exId,
            exerciseName: exId, // TODO: resolve exercise name
            maxWeight: maxWeightInSession,
            maxVolume: volumeInSession,
            maxReps: maxRepsInSession,
            date: workout.date,
            recentProgress: 'stable',
          });
        }
        
        // Обновляем максимальный объем если больше
        if (existing && volumeInSession > existing.maxVolume) {
          existing.maxVolume = volumeInSession;
        }
      });
    });
  });
  
  return Array.from(exerciseRecords.values())
    .sort((a, b) => b.maxWeight - a.maxWeight);
}
```

2. **Определение прогресса:**
```typescript
function calculateRecentProgress(
  exerciseId: string,
  workouts: WorkoutLog[],
  daysBack: number = 30
): 'improving' | 'stable' | 'declining' {
  const recent = workouts
    .filter(w => {
      const date = new Date(w.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);
      return date >= cutoff;
    })
    .slice(0, 5); // последние 5 тренировок
    
  // Извлекаем максимальные веса
  const weights: number[] = [];
  recent.forEach(workout => {
    workout.cycles.forEach(cycle => {
      cycle.exercises.forEach(ex => {
        if (ex.exerciseId === exerciseId) {
          const maxW = Math.max(
            ...ex.sets
              .filter(s => s.completed && s.weight)
              .map(s => s.weight!)
          );
          if (maxW > 0) weights.push(maxW);
        }
      });
    });
  });
  
  if (weights.length < 2) return 'stable';
  
  const trend = calculateTrend(weights);
  if (trend.changePercentage > 2) return 'improving';
  if (trend.changePercentage < -2) return 'declining';
  return 'stable';
}
```

### UI структура
```tsx
<Card>
  <CardHeader>
    <CardTitle>Personal Records</CardTitle>
    <CardDescription>
      Your best performances across all exercises
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exercise</TableHead>
          <TableHead>Max Weight</TableHead>
          <TableHead>Max Volume</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map(record => (
          <TableRow key={record.exerciseId}>
            <TableCell className="font-medium">
              {record.exerciseName}
            </TableCell>
            <TableCell>{record.maxWeight} kg</TableCell>
            <TableCell>{formatVolume(record.maxVolume)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(record.date)}
            </TableCell>
            <TableCell>
              <Badge variant={
                record.recentProgress === 'improving' ? 'default' :
                record.recentProgress === 'declining' ? 'destructive' : 
                'secondary'
              }>
                {record.recentProgress === 'improving' ? '📈 Improving' :
                 record.recentProgress === 'declining' ? '📉 Declining' :
                 '➡️ Stable'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Добавь в analytics-utils.ts
```typescript
export function calculatePersonalRecords(workouts: WorkoutLog[]): PersonalRecord[];
```

---

## 📦 КОМПОНЕНТ 3: RPE DISTRIBUTION CHART

### Описание
Гистограмма распределения интенсивности тренировок по шкале RPE (1-10).

### Расположение файла
`src/components/analytics/rpe-distribution-chart.tsx`

### Зависимости
- `recharts` - `BarChart`
- `@/lib/types`, `@/lib/analytics-utils`
- `@/components/ui/card`

### Интерфейс
```typescript
interface RPEDistributionChartProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}
```

### Типы данных
```typescript
type RPEDistribution = {
  rpe: number; // 1-10
  count: number; // количество подходов
  percentage: number; // процент от общего
};
```

### Логика расчета

Добавь в `analytics-utils.ts`:

```typescript
export function calculateRPEDistribution(workouts: WorkoutLog[]): RPEDistribution[] {
  const rpeCounts = new Map<number, number>();
  let totalSets = 0;
  
  // Инициализация всех значений RPE
  for (let i = 1; i <= 10; i++) {
    rpeCounts.set(i, 0);
  }
  
  workouts.forEach(workout => {
    workout.cycles.forEach(cycle => {
      cycle.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && set.rpe) {
            const rpeRounded = Math.round(set.rpe);
            rpeCounts.set(rpeRounded, (rpeCounts.get(rpeRounded) || 0) + 1);
            totalSets++;
          }
        });
      });
    });
  });
  
  return Array.from(rpeCounts.entries()).map(([rpe, count]) => ({
    rpe,
    count,
    percentage: totalSets > 0 ? Math.round((count / totalSets) * 100) : 0,
  }));
}
```

### UI структура
```tsx
<Card>
  <CardHeader>
    <CardTitle>RPE Distribution</CardTitle>
    <CardDescription>
      Training intensity distribution (Rate of Perceived Exertion)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={distributionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="rpe" 
          label={{ value: 'RPE (1-10)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Sets Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="count" 
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
        {/* Оптимальная зона (RPE 6-8) */}
        <ReferenceLine 
          x={6} 
          stroke="hsl(var(--chart-2))" 
          strokeDasharray="3 3"
          label="Optimal Zone"
        />
        <ReferenceLine 
          x={8} 
          stroke="hsl(var(--chart-2))" 
          strokeDasharray="3 3"
        />
      </BarChart>
    </ResponsiveContainer>
    
    {/* Инсайты */}
    <div className="mt-4 space-y-2">
      <p className="text-sm text-muted-foreground">
        <strong>Optimal Zone (RPE 6-8):</strong> {optimalPercentage}% of your sets
      </p>
      <p className="text-sm text-muted-foreground">
        <strong>High Intensity (RPE 9-10):</strong> {highIntensityPercentage}%
      </p>
    </div>
  </CardContent>
</Card>
```

### Custom Tooltip
```tsx
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="text-sm font-medium">RPE {data.rpe}</p>
        <p className="text-sm text-muted-foreground">
          {data.count} sets ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};
```

---

## 📦 КОМПОНЕНТ 4: PERIOD COMPARISON

### Описание
Сравнение двух временных периодов (текущий vs предыдущий месяц).

### Расположение файла
`src/components/analytics/period-comparison.tsx`

### Зависимости
- `recharts` - `BarChart` с группировкой
- `@/lib/analytics-utils`
- `@/components/ui/card`, `@/components/ui/select`

### Интерфейс
```typescript
interface PeriodComparisonProps {
  workouts: WorkoutLog[];
}
```

### Типы данных
```typescript
type ComparisonData = {
  metric: string;
  current: number;
  previous: number;
  change: number; // процент изменения
  changeType: 'positive' | 'negative' | 'neutral';
};
```

### Логика расчета

Добавь в `analytics-utils.ts`:

```typescript
export type PeriodStats = {
  totalWorkouts: number;
  totalVolume: number;
  avgDuration: number;
  avgRPE: number;
  consistency: number;
};

export function calculatePeriodStats(
  workouts: WorkoutLog[],
  startDate: Date,
  endDate: Date
): PeriodStats {
  const filtered = workouts.filter(w => {
    const date = new Date(w.date);
    return date >= startDate && date <= endDate;
  });
  
  const totalWorkouts = filtered.length;
  const totalVolume = calculateTotalVolume(filtered);
  const totalDuration = filtered.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  
  // Средний RPE
  let totalRPE = 0;
  let rpeCount = 0;
  filtered.forEach(w => {
    w.cycles.forEach(c => {
      c.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed && s.rpe) {
            totalRPE += s.rpe;
            rpeCount++;
          }
        });
      });
    });
  });
  const avgRPE = rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0;
  
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const consistency = Math.round((totalWorkouts / days) * 100);
  
  return {
    totalWorkouts,
    totalVolume,
    avgDuration,
    avgRPE,
    consistency: Math.min(consistency, 100),
  };
}

export function comparePeriods(
  currentStats: PeriodStats,
  previousStats: PeriodStats
): ComparisonData[] {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  return [
    {
      metric: 'Workouts',
      current: currentStats.totalWorkouts,
      previous: previousStats.totalWorkouts,
      change: calculateChange(currentStats.totalWorkouts, previousStats.totalWorkouts),
      changeType: currentStats.totalWorkouts > previousStats.totalWorkouts ? 'positive' : 
                  currentStats.totalWorkouts < previousStats.totalWorkouts ? 'negative' : 'neutral',
    },
    {
      metric: 'Volume',
      current: currentStats.totalVolume,
      previous: previousStats.totalVolume,
      change: calculateChange(currentStats.totalVolume, previousStats.totalVolume),
      changeType: currentStats.totalVolume > previousStats.totalVolume ? 'positive' : 
                  currentStats.totalVolume < previousStats.totalVolume ? 'negative' : 'neutral',
    },
    {
      metric: 'Avg Duration',
      current: currentStats.avgDuration,
      previous: previousStats.avgDuration,
      change: calculateChange(currentStats.avgDuration, previousStats.avgDuration),
      changeType: 'neutral',
    },
    {
      metric: 'Avg RPE',
      current: currentStats.avgRPE,
      previous: previousStats.avgRPE,
      change: calculateChange(currentStats.avgRPE, previousStats.avgRPE),
      changeType: 'neutral',
    },
  ];
}
```

### UI структура
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>
          Current period vs previous period
        </CardDescription>
      </div>
      <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month vs Month</SelectItem>
          <SelectItem value="week">Week vs Week</SelectItem>
          <SelectItem value="quarter">Quarter vs Quarter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {comparisonData.map(item => (
        <div key={item.metric} className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{item.metric}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-2xl font-bold">
                {formatMetricValue(item.current, item.metric)}
              </span>
              <Badge variant={
                item.changeType === 'positive' ? 'default' :
                item.changeType === 'negative' ? 'destructive' :
                'secondary'
              }>
                {item.change > 0 ? '+' : ''}{item.change}%
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Previous:</p>
            <p className="font-medium">
              {formatMetricValue(item.previous, item.metric)}
            </p>
          </div>
        </div>
      ))}
    </div>
    
    {/* Grouped Bar Chart */}
    <ResponsiveContainer width="100%" height={250} className="mt-6">
      <BarChart data={comparisonData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="metric" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" />
        <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" name="Previous" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

## 📦 КОМПОНЕНТ 5: CSV EXPORT

### Описание
Функционал экспорта данных тренировок в CSV формат.

### Расположение файла
`src/lib/export-to-csv.ts`

### Зависимости
Нет внешних зависимостей - используй встроенный JavaScript.

### Функции экспорта

```typescript
import type { WorkoutLog, PersonalRecord } from './types';
import { formatVolume, formatDuration } from './analytics-utils';

/**
 * Конвертирует workout logs в CSV формат
 */
export function convertWorkoutsToCSV(workouts: WorkoutLog[]): string {
  const headers = [
    'Date',
    'Workout',
    'Duration (min)',
    'Total Volume (kg)',
    'Status',
    'Feedback',
  ];
  
  const rows = workouts.map(workout => [
    workout.date,
    workout.workoutId,
    workout.duration.toString(),
    workout.totalVolume.toString(),
    workout.status,
    workout.userFeedback || '',
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Конвертирует детальные данные подходов в CSV
 */
export function convertSetsToCSV(workouts: WorkoutLog[]): string {
  const headers = [
    'Date',
    'Workout',
    'Cycle',
    'Exercise',
    'Set',
    'Reps',
    'Weight (kg)',
    'RPE',
    'Completed',
  ];
  
  const rows: string[][] = [];
  
  workouts.forEach(workout => {
    workout.cycles.forEach((cycle, cycleIndex) => {
      cycle.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          rows.push([
            workout.date,
            workout.workoutId,
            `Cycle ${cycleIndex + 1}`,
            exercise.exerciseId,
            set.setNumber.toString(),
            set.reps.toString(),
            set.weight?.toString() || '',
            set.rpe?.toString() || '',
            set.completed ? 'Yes' : 'No',
          ]);
        });
      });
    });
  });
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Конвертирует личные рекорды в CSV
 */
export function convertPRsToCSV(records: PersonalRecord[]): string {
  const headers = [
    'Exercise',
    'Max Weight (kg)',
    'Max Volume (kg)',
    'Max Reps',
    'Date Achieved',
    'Recent Progress',
  ];
  
  const rows = records.map(record => [
    record.exerciseName,
    record.maxWeight.toString(),
    record.maxVolume.toString(),
    record.maxReps.toString(),
    record.date,
    record.recentProgress,
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Экранирование специальных символов для CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Скачивание CSV файла
 */
export function downloadCSV(content: string, filename: string): void {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
```

### Интеграция в UI

Обнови `src/app/analytics/page.tsx`:

```tsx
import { 
  convertWorkoutsToCSV, 
  convertSetsToCSV, 
  convertPRsToCSV,
  downloadCSV 
} from '@/lib/export-to-csv';
import { calculatePersonalRecords } from '@/lib/analytics-utils';

// В компоненте:
const handleExportCSV = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Export workouts summary
  const workoutsCSV = convertWorkoutsToCSV(workoutLogs || []);
  downloadCSV(workoutsCSV, `zenith-workouts-${today}.csv`);
  
  // Export detailed sets
  const setsCSV = convertSetsToCSV(workoutLogs || []);
  downloadCSV(setsCSV, `zenith-sets-${today}.csv`);
  
  // Export PRs
  const records = calculatePersonalRecords(workoutLogs || []);
  const prsCSV = convertPRsToCSV(records);
  downloadCSV(prsCSV, `zenith-prs-${today}.csv`);
};

// В JSX:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleExportCSV}>
      Export to CSV
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleExport}>
      Export for Claude Analysis
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 📦 КОМПОНЕНТ 6: BODY METRICS (ОПЦИОНАЛЬНО)

### Описание
Отслеживание метрик тела (вес, процент жира, обхваты). **Требует расширения базы данных.**

### Расположение файла
`src/components/analytics/body-metrics-chart.tsx`

### Новый тип данных

Добавь в `src/lib/types.ts`:

```typescript
export type BodyMetric = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  bodyFat?: number; // процент
  measurements?: {
    chest?: number; // см
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Firestore коллекция
`users/{uid}/bodyMetrics/{metricId}`

### Интерфейс компонента
```typescript
interface BodyMetricsChartProps {
  metrics: BodyMetric[];
  timeRange: TimeRange;
}
```

### UI структура
```tsx
<Card>
  <CardHeader>
    <CardTitle>Body Metrics</CardTitle>
    <CardDescription>Track your body composition over time</CardDescription>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="weight">
      <TabsList>
        <TabsTrigger value="weight">Weight</TabsTrigger>
        <TabsTrigger value="bodyFat">Body Fat</TabsTrigger>
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
      </TabsList>
      
      <TabsContent value="weight">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Weight (kg)', angle: -90 }} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>
      
      {/* Similar for bodyFat and measurements */}
    </Tabs>
  </CardContent>
</Card>
```

**Примечание:** Это опциональный компонент, реализуй только если пользователь хочет трекать метрики тела.

---

## 🔄 ИНТЕГРАЦИЯ ВСЕХ КОМПОНЕНТОВ

### Обнови `src/components/analytics-charts.tsx`

```tsx
import { FrequencyHeatmap } from './analytics/frequency-heatmap';
import { PRTracker } from './analytics/pr-tracker';
import { RPEDistributionChart } from './analytics/rpe-distribution-chart';
import { PeriodComparison } from './analytics/period-comparison';
import { BodyMetricsChart } from './analytics/body-metrics-chart'; // опционально

export function AnalyticsCharts() {
  // ... existing code
  
  return (
    <div className="space-y-6">
      {/* Existing: Header, Stats Cards */}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* Existing tabs */}
        
        <TabsContent value="advanced" className="space-y-6">
          <FrequencyHeatmap workouts={workoutLogs} timeRange={timeRange} />
          <RPEDistributionChart workouts={workoutLogs} timeRange={timeRange} />
          <PRTracker workouts={workoutLogs} timeRange={timeRange} />
          <PeriodComparison workouts={workoutLogs} />
          {/* Опционально: <BodyMetricsChart metrics={bodyMetrics} timeRange={timeRange} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📝 ЧЕКЛИСТ РЕАЛИЗАЦИИ

### Phase 1: Утилиты (30 мин)
- [ ] Добавить `calculateDayFrequency` в `analytics-utils.ts`
- [ ] Добавить `calculatePersonalRecords` в `analytics-utils.ts`
- [ ] Добавить `calculateRPEDistribution` в `analytics-utils.ts`
- [ ] Добавить `calculatePeriodStats` и `comparePeriods` в `analytics-utils.ts`

### Phase 2: CSV Export (20 мин)
- [ ] Создать `export-to-csv.ts`
- [ ] Реализовать `convertWorkoutsToCSV`, `convertSetsToCSV`, `convertPRsToCSV`
- [ ] Добавить кнопку Export в analytics page

### Phase 3: Компоненты (2 часа)
- [ ] Создать `frequency-heatmap.tsx`
- [ ] Создать `pr-tracker.tsx`
- [ ] Создать `rpe-distribution-chart.tsx`
- [ ] Создать `period-comparison.tsx`
- [ ] (Опционально) Создать `body-metrics-chart.tsx`

### Phase 4: Интеграция (30 мин)
- [ ] Добавить новый таб "Advanced" в `analytics-charts.tsx`
- [ ] Подключить все новые компоненты
- [ ] Тестирование с реальными данными

### Phase 5: Полировка (20 мин)
- [ ] Empty states для всех компонентов
- [ ] Loading states
- [ ] Responsive design
- [ ] Accessibility (ARIA labels)

---

## 🎨 ДИЗАЙН ТРЕБОВАНИЯ

### Цветовая палитра
Используй существующие CSS переменные:
- Primary: `hsl(var(--primary))`
- Muted: `hsl(var(--muted))`
- Foreground: `hsl(var(--foreground))`
- Border: `hsl(var(--border))`
- Chart colors: `hsl(var(--chart-1))` до `hsl(var(--chart-5))`

### Spacing
- Card padding: `p-6`
- Gap между компонентами: `space-y-6`
- Gap внутри карточек: `space-y-4`

### Typography
- Заголовки: `text-3xl font-headline font-bold`
- Подзаголовки: `text-muted-foreground`
- Метрики: `text-2xl font-bold`

### Responsive
- Mobile: full width
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-4`

---

## 🧪 ТЕСТИРОВАНИЕ

### Unit тесты для утилит
```typescript
// Пример теста для calculateDayFrequency
describe('calculateDayFrequency', () => {
  it('should count workouts by day of week', () => {
    const mockWorkouts: WorkoutLog[] = [
      { date: '2025-01-01', ... }, // Thursday
      { date: '2025-01-03', ... }, // Saturday
      { date: '2025-01-08', ... }, // Thursday
    ];
    
    const result = calculateDayFrequency(mockWorkouts);
    
    expect(result.find(d => d.dayOfWeek === 'Thu')?.count).toBe(2);
    expect(result.find(d => d.dayOfWeek === 'Sat')?.count).toBe(1);
  });
});
```

### Мануальное тестирование
1. **С данными:**
   - Все графики отображаются корректно
   - Нет ошибок в консоли
   - Tooltip'ы работают

2. **Без данных:**
   - Показываются empty states
   - Нет JavaScript ошибок

3. **CSV Export:**
   - Файлы скачиваются
   - Формат валидный (открывается в Excel)
   - Данные корректные

---

## 🚀 DEPLOYMENT

### Проверки перед коммитом
```bash
# TypeScript check
npm run typecheck

# Build check
npm run build

# Dev server
npm run dev
```

### Git workflow
```bash
git checkout -b feature/stage-4.3-advanced-analytics

# Commit по частям
git add src/lib/analytics-utils.ts
git commit -m "feat(analytics): add frequency, PR, and RPE calculation utils"

git add src/lib/export-to-csv.ts
git commit -m "feat(analytics): add CSV export functionality"

git add src/components/analytics/frequency-heatmap.tsx
git commit -m "feat(analytics): add frequency heatmap component"

git add src/components/analytics/pr-tracker.tsx
git commit -m "feat(analytics): add personal records tracker"

git add src/components/analytics/rpe-distribution-chart.tsx
git commit -m "feat(analytics): add RPE distribution chart"

git add src/components/analytics/period-comparison.tsx
git commit -m "feat(analytics): add period comparison component"

git add src/components/analytics-charts.tsx src/app/analytics/page.tsx
git commit -m "feat(analytics): integrate Stage 4.3 advanced components"

# Final push
git push origin feature/stage-4.3-advanced-analytics
```

---

## 📚 ДОКУМЕНТАЦИЯ

После завершения создай `docs/STAGE_4.3_SUMMARY.md`:

```markdown
# Stage 4.3 - Advanced Analytics Summary

## Implemented Components

### 1. Frequency Heatmap
- Shows training frequency by day of week
- Color-coded intensity
- Location: `src/components/analytics/frequency-heatmap.tsx`

### 2. PR Tracker
- Personal records table
- Progress indicators (improving/stable/declining)
- Location: `src/components/analytics/pr-tracker.tsx`

### 3. RPE Distribution
- Training intensity histogram
- Optimal zone indicators (RPE 6-8)
- Location: `src/components/analytics/rpe-distribution-chart.tsx`

### 4. Period Comparison
- Current vs previous period
- Grouped bar chart comparison
- Location: `src/components/analytics/period-comparison.tsx`

### 5. CSV Export
- Export workouts summary
- Export detailed sets
- Export personal records
- Location: `src/lib/export-to-csv.ts`

## New Utilities (analytics-utils.ts)

- `calculateDayFrequency()`
- `calculatePersonalRecords()`
- `calculateRPEDistribution()`
- `calculatePeriodStats()`
- `comparePeriods()`

## Integration

All components integrated into "Advanced" tab in Analytics page.

## Testing

- ✅ TypeScript compilation
- ✅ Build successful
- ✅ Manual testing with real data
- ✅ Empty states tested
- ✅ CSV export validated

## Next Steps

Optional: Body Metrics tracking (Stage 4.4)
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **TypeScript Strict Mode:**
   - Все компоненты должны быть строго типизированы
   - Избегай `any` типов
   - Используй `Optional Chaining` (`?.`) для безопасного доступа

2. **Performance:**
   - Используй `useMemo` для тяжелых расчетов
   - Не пересчитывай данные при каждом рендере
   - Recharts уже оптимизирован

3. **Accessibility:**
   - Добавь `aria-label` на интерактивные элементы
   - Убедись что графики читаются screen readers
   - Keyboard navigation должна работать

4. **Error Handling:**
   - Обработай случай пустого массива workouts
   - Обработай отсутствие RPE данных
   - Graceful degradation при ошибках

5. **Mobile Responsiveness:**
   - Все графики должны быть responsive
   - На мобильных устройствах может потребоваться упрощенная версия

---

## 🎯 ACCEPTANCE CRITERIA

Stage 4.3 считается завершенным когда:

- ✅ Все 5 компонентов созданы и работают
- ✅ CSV Export функционирует корректно
- ✅ Новый таб "Advanced" добавлен в Analytics
- ✅ Все утилиты добавлены в `analytics-utils.ts`
- ✅ TypeScript компилируется без ошибок
- ✅ Build проходит успешно
- ✅ Тесты с реальными данными пройдены
- ✅ Empty states реализованы
- ✅ Responsive design работает
- ✅ Документация создана

---

## 💡 СОВЕТЫ ПО РЕАЛИЗАЦИИ

1. **Начни с утилит** - сначала реализуй все функции расчета
2. **Один компонент за раз** - не пытайся сделать все сразу
3. **Тестируй по ходу** - проверяй каждый компонент отдельно
4. **Переиспользуй паттерны** - смотри на существующие компоненты (VolumeChart, ExerciseProgressChart)
5. **Recharts documentation** - используй официальные примеры

---

**ГОТОВ К РЕАЛИЗАЦИИ!** 🚀

Следуй этому промпту шаг за шагом, и Stage 4.3 будет реализован качественно и быстро.
