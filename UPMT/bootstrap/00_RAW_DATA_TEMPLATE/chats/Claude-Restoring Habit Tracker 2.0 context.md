# Restoring Habit Tracker 2.0 context

**Created:** 10/31/2025 15:37:21  
**Updated:** 10/31/2025 19:44:53  
**Exported:** 11/15/2025 0:27:10  
**Link:** [https://claude.ai/chat/910704a1-b512-497b-b804-a202f5fb2ed1](https://claude.ai/chat/910704a1-b512-497b-b804-a202f5fb2ed1)  

## Prompt:
31.10.2025, 15:37:25

полностью восстанови контекст из чата Habit Tracker 2.0.
как восстановишь, напиши мне - готово



## Response:
31.10.2025, 15:37:43

````plaintext
Thought process: Размышляю о восстановлении контекста из недоступного чата Habit Tracker 2.0

Пользователь просит меня полностью восстановить контекст из чата под названием "Habit Tracker 2.0". Он говорит на русском языке и хочет, чтобы я написал "готово" когда восстановлю контекст.

Мне нужно использовать инструмент conversation_search, чтобы найти этот чат. Я буду искать по ключевым словам "Habit Tracker 2.0".
````

**conversation_search**

*Request*

````javascript
{
  "query": "Habit Tracker 2.0"
}
````

*Response*

````plaintext
<chat url='https://claude.ai/chat/24e59151-1b89-4b8c-b5a3-41cf3de36111' updated_at=2025-10-30T15:48:28.958056+00:00>Habit Tracker 2.0.
<chat_conversation>Title: Habit Tracker 2.0.

Human: восстанови контекст чата Habше tracker AI enchancement strategy

Assistant: Сейчас поищу информацию о чате "Habше tracker AI enhancement strategy".
<tool name="conversation_search">
<parameter name="query">tracker AI enhancement strategy</parameter>
</tool>
Нашел ваш чат! [Habit tracker AI enhancement strategy](https://claude.ai/chat/8c2b59db-eeb6-46f7-8fdc-df61c2ea1062)

## 📋 Контекст чата:

В этом разговоре вы работали над **масштабным расширением модуля Habit Tracker** в приложении Zenith Trainer. Основные направления:

### 🎯 Ключевые идеи:
1. **AI-аналитика привычек** с использованием Gemini
   - Анализ частоты выполнения и паттернов
   - Рекомендации по корректировке параметров (время медитации, количество воды и т.д.)

2. **Life Management Frameworks**
   - Колесо баланса (Wheel of Life)
   - Треугольник Карпмана
   - Другие системы анализа жизненных аспектов

3. **Ежевечерняя рефлексия (Daily Reflection)**
   - Пользователь пишет один общий отчет за день
   - AI разбирает текст и распределяет по логам соответствующих привычек
   - Возможность дописать/изменить отчеты за предыдущий день

4. **Двусторонняя система экспорта/импорта**
   - Экспорт привычек через ZTL DSL (как workout programs)
   - AI может корректировать параметры активных привычек
   - Добавление новых и архивирование освоенных привычек

### 🏗️ Программа интеграции:
Была разработана поэтапная программа интеграции с учетом текущей архитектуры (Next.js, Firebase, Genkit).

**Хотите продолжить работу над этим модулем?** Могу напомнить детали конкретных фаз или начать реализацию с того места, где остановились.

Human: я добавил еще материалов по треккеру привычек, изучи внимательно, выяви зоны роста, на основании этих дополнительных данных предложи усовершенствованный план улучшений, мне нужно описание функционала и механик, не пиши пока никакого кода, просто соедени все имеющиеся данные и выбери самое актуальное чтобы наш треккер привычек был лучшим и удобным. далее разбей предложенный функционал на фазы, опиши их, чтобы при необбходимости с помощбю этого описания восстанавливать контекст в других чатах.  повторюсь не пиши пока код, полько концепцию. при необходимости задавай мне дополнительные вопросы перед началом, чтобы у тебя сформировалось однозначное понимание нашего модуля привычек

I'll scan the codebase to locate the current habit tracker implementation and related entities, then search the web for top habit trackers to compare features.
[4 tools called]
I found the habit tracker UI and creation dialog, and I'll open the types and components to analyze current fields and capabilities to compare with best-in-class products.
[5 tools called]
Я нашёл текущую реализацию трекера привычек в проекте и посмотрел типы/формы — сейчас это простой чекбокс-трекер с днями недели, категорией, текстовой целью и (опционально) помодоро.</chat>

<chat url='https://claude.ai/chat/24e59151-1b89-4b8c-b5a3-41cf3de36111' updated_at=2025-10-30T15:48:28.958056+00:00>Habit Tracker 2.0.
✅ Этап 2 (Напоминания + Stacking) - **удобство**

### Можно отложить (nice-to-have):
6. 🔄 Этап 7 (Heatmap + Теги) - **после MVP**

---

## ✅ ЧЕКЛИСТ ДЛЯ СТАРТА РАЗРАБОТКИ

Перед началом Этапа 1 убедитесь:
- [ ] Все члены команды прочитали этот план
- [ ] Согласован дизайн UI/UX
- [ ] Настроен Genkit + Gemini API
- [ ] Firestore security rules обновлены
- [ ] Создан репозиторий для типов
- [ ] Определены KPI для каждого этапа

---

**Этот план создан для восстановления контекста в любом чате. Сохраните этот документ и используйте как single source of truth при разработке Habit Tracker 2.0.** 🚀</chat_conversation></chat>

<chat url='https://claude.ai/chat/8c2b59db-eeb6-46f7-8fdc-df61c2ea1062' updated_at=2025-10-30T14:38:01.692900+00:00>Habit tracker AI enhancement strategy
✅ Расширить Habit типы (Фаза 1)
2. ✅ Миграция данных (Фаза 2)
3. ✅ HabitLog компонент (Фаза 3.1-3.2)
4. ✅ Basic Export (Фаза 5.1-5.2)

### **Full Feature Set** - 20-29 часов:
+ Daily Reflection Dialog
+ AI Processing
+ Life Areas & Wheel of Life
+ Streaks & Analytics
+ Advanced visualizations

---

## 🚦 СЛЕДУЮЩИЕ ШАГИ

**Готовы начать?** Предлагаю такой план:

1. **Сейчас**: Я создам все файлы для **MVP** (Фазы 0-3 + базовый Export)
2. **Вы**: Тестируете, запускаете миграцию
3. **Далее**: Добавляем AI функции (Фаза 4) поэтапно

**Начинаем с MVP? Или сразу делаем Full Implementation?** 🚀</chat_conversation></chat>

<chat url='https://claude.ai/chat/24e59151-1b89-4b8c-b5a3-41cf3de36111' updated_at=2025-10-30T15:48:28.958056+00:00>Habit Tracker 2.0.
менное окно:                   │
│   С [06:00] до [09:00] (опц)       │
│ • Старт: [дата]                     │
│ • Финиш: [дата] или ∞              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Шаг 4: Habit Stacking (опц)        │
│ • Привязать к существующей:        │
│   [dropdown: выбор привычки]       │
│ • Позиция: ○ До  ○ После          │
│ • Задержка: [число] минут          │
│                                     │
│ Пример: "После Медитации (утро)"   │
│ → выполнять Журналинг через 5 мин │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Шаг 5: Напоминания                  │
│ • Время: [08:00] [+добавить]       │
│ • Умные напоминания: □             │
│   (AI оптимизирует время)          │
│ • Snooze: □ разрешить              │
│ • Настойчивость: □ до выполнения   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Шаг 6: Гибкость                     │
│ • Приоритет: ◆◆◆◇◇ (1-5)          │
│ • Сложность: ○ Легко  ○ Средне    │
│               ○ Сложно             │
│ • Пропуски без штрафа: [2] в месяц │
│ • Grace period: [1] день           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Шаг 7: Системы анализа (опц)       │
│                                     │
│ 📊 Колесо баланса жизни (активно) │
│   ├─ Область: [dropdown]           │
│   │   💪 Здоровье                  │
│   │   💼 Карьера                   │
│   │   ❤️ Отношения                │
│   │   ... (остальные 5)            │
│   └─ Важность: ▓▓▓▓▓▓▓▓░░ (8/10)  │
│                                     │
│ 🏔️ Пирамида Маслоу (активно)      │
│   └─ Уровень: [dropdown]           │
│       🍎 Физиологические           │
│       🛡️ Безопасность             │
│       ... (остальные 3)            │
│                                     │
│ [+ Активировать систему]           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 💡 AI-подсказки                    │
│                                     │
│ "Я проанализировал вашу привычку   │
│ 'Медитация 20 минут':              │
│                                     │
│ • Предлагаю area: Духовность       │
│ • Уровень Маслоу: Самоактуализация │
│ • Связать с 'Утренняя зарядка'?   │
│                                     │
│ [Принять] [Изменить вручную]       │
└─────────────────────────────────────┘
`​`​`

**Механики:**

1. **Автоматическое назначение параметров систем:**
   - При создании привычки AI (быстрый Gemini Flash) анализирует название + описание
   - Предлагает значения для параметров активных систем
   - Пользователь может принять или изменить вручную
   - Если пользователь не заполнил → сохраняется предложение AI

2. **Habit Stacking:**
   - Выбор привычки-якоря из существующих
   - Задать позицию (до/после) и задержку
   - Система автоматически предлагает выполнение связанной привычки
   - В UI визуализация цепочки привычек

3.</chat>

<chat url='https://claude.ai/chat/8c2b59db-eeb6-46f7-8fdc-df61c2ea1062' updated_at=2025-10-30T14:38:01.692900+00:00>Habit tracker AI enhancement strategy
<chat_conversation>Title: Habit tracker AI enhancement strategy

Human: В программе вшит Habbit tracker. Проведи поиск по статьям, рейтингам и отзывам в интернет про передовые и самы удобные и гибкие треккеры привычек. Проанализируй функционал нашего треккера и сравни с лучшими. Предложи программу улучшений, касаемо всего функционала, принципа работы, элементов и сущностей модуля треккинга, параметров самой привычки, аналитики. Учитывая наш планируемый функционал по AI аналитике, предложи добавление аналогичного и для привычек. мне нужно чтобы gemini смог анализировать привычки частоту их выполнения и расматривать хронологию с точки зрения различных систем лайф мэнеджмента, затрагивающих разные аспекты жизни ( например колесо баланса, треугольник харпмана и так далее, мы добавим различные контексты анализа позже, главное сразу закладывай такую возможность) также мне нужно чтобы ты продумал такой же принцип экспорта привычек ( и их серий) через нашу систему экспорта, чтобы можно было посредством ИИ корректировать параметры активных привычек, ( например увеличивать рекомендуемое время медитации, или количество выпитой воды) и добавлять новые привычки, как и убирать уже освоенные и неактуальные. также включить возможность в лог по привычкам писать отчет , обратную связь, по жеданию, наверное вечером каждый день, а не при завершении каждой ( что может быть не удобным) но возможность такая присутствовать должна. Тоесть пользователь может оставить обратную связь о всех активностях за текущий день и наверное прошлый ( что то дописать или написать заново, если не писал по каким то активностям). А потом ИИ определяет что в оч к чему относится и разбрасывает эти элементы по логам для дальнейшего экспорта и глубокого анализа.

как тебе эти идеи?

Assistant: Отличные и очень продуманные идеи! Особенно интересен подход с ежевечерней рефлексией и AI-распределением обратной связи по логам. Давайте я сначала изучу ваш текущий функционал, а затем проведу исследование рынка.
<tool name="project_knowledge_search">
<parameter name="query">habit tracker привычки функционал трекер</parameter>
<parameter name="max_text_results">10</parameter>
</tool>
<tool name="web_search">
<parameter name="query">best habit tracker apps 2025 features comparison</parameter>
</tool>
<tool name="web_search">
<parameter name="query">habit tracker advanced features analytics AI insights 2025</parameter>
</tool>
<tool name="web_search">
<parameter name="query">habit tracking life balance wheel karpman triangle life management frameworks</parameter>
</tool>
Отлично! Я провел исследование и готов дать детальную оценку. Ваши идеи очень прогрессивные и соответствуют последним трендам в habit tracking. Давайте разберем все по порядку.</chat>
````

````plaintext
Thought process: Восстанавливая контекст проекта улучшения трекера привычек.

Отлично, я нашел чат "Habit Tracker 2.0". Теперь мне нужно изучить его содержимое и восстановить полный контекст. Я вижу, что это обширный проект по улучшению модуля трекера привычек в приложении Zenith Trainer.

Основные моменты:
1. Расширение типов привычек (не только чекбоксы)
2. AI-аналитика с Gemini
3. Системы анализа жизни (колесо баланса, пирамида Маслоу и т.д.)
4. Habit Stacking (связывание привычек)
5. Ежевечерняя рефлексия с AI-распределением отчетов
6. Экспорт/импорт через ZTL DSL
7. Напоминания и умные уведомления
8. Heatmap и визуализация
9. Приоритеты и гибкость (пропуски без штрафа)

Также упоминается исходный чат "Habit tracker AI enhancement strategy" где началась работа.

Мне нужно дать пользователю понять, что я восстановил контекст.
````

готово



## Prompt:
31.10.2025, 15:40:58

я сделал изменения в проекте, внимательно прочитай репозитарий в файлах нашего проекта и коротко дай свой вердикт по следующим критериям, все ли функции habbit tracker 2 я реализовал, качество кода, твои рекомендации относительно моей работы

далее список того что мы хотели сделать потом с треккером привычек



## Response:
31.10.2025, 15:42:21

````plaintext
Thought process: Анализируя реализацию функционала и оценивая качество кода.

Пользователь просит меня:
1. Изучить репозиторий проекта
2. Проверить, реализован ли весь функционал Habit Tracker 2.0 из предыдущего чата
3. Оценить качество кода
4. Дать рекомендации

Затем он упоминает, что будет список того, что планировалось сделать потом.

Мне нужно сначала поискать в project knowledge информацию о habit tracker, затем посмотреть файлы в репозитории.
````

**project_knowledge_search**

*Request*

````javascript
{
  "query": "habit tracker implementation реализация привычки",
  "max_text_results": 15
}
````

*Response*

````plaintext
src/components/habit-tracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
import type { HabitLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { HabitLogModal } from './habit-log-modal';
import { DailyReflectionDialog } from './daily-reflection-dialog';
import { DailyReflectionReview } from './daily-reflection-review';
import { SystemLibraryDialog } from './system-library-dialog';
import { AnalyticsDialog } from './analytics-dialog';
import { ExportDialog } from './export-dialog';
import { InsightsDialog } from './insights-dialog';
import { ImportClaudeDialog } from './import-claude-dialog';
import { useToast } from '@/hooks/use-toast';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/habit-tracker.tsx
dHabits.filter(h => isHabitDueToday(h));
  }, [trackedHabits]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits]);
  
  const isLoading = habitsLoading || categoriesLoading;

  const streaksMap = useMemo(() => {
    if (!trackedHabits || !habitLogs) return new Map<string, { current: number; longest: number; hss: number }>();
    const byHabit = new Map<string, HabitLog[]>();
    for (const log of habitLogs) {
      if (!log.habitId) continue;
      const arr = byHabit.get(log.habitId) || [];
      arr.push(log);
      byHabit.set(log.habitId, arr);
    }
    const result = new Map<string, { current: number; longest: number; hss: number }>();
    const now = new Date();
    const from90 = new Date(now.getTime());
    from90.setDate(from90.getDate() - 90);
    for (const h of trackedHabits) {
      const logs = byHabit.get(h.id) || [];
      const { current, longest } = computeStreakFromLogs(logs);
      const completion = computeCompletionRate(logs, from90, now);
      const consistency = computeConsistencyScore(logs, from90, now);
      const hss = calculateHabitStrengthScore({ currentStreak: current, longestStreak: longest, completionRate90d: completion, consistencyScore: consistency });
      result.set(h.id, { current, longest, hss });
    }
    return result;
  }, [trackedHabits, habitLogs]);

  // Today's progress map for quantity/duration
  const todaysProgress = useMemo(() => {
    if (!habitLogs) return new Map<string, { value?: number; durationMin?: number }>();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const map = new Map<string, { value?: number; durationMin?: number }>();
    for (const log of habitLogs) {
      if (log.date !== todayStr || log.status !== 'done') continue;
      const cur = map.get(log.habitId) || {};
      if (typeof log.value === 'number') cur.value = (cur.value || 0) + log.value;
      if (typeof log.durationMin === 'number') cur.durationMin = (cur.durationMin || 0) + log.durationMin;
      map.set(log.habitId, cur);
    }
    return map;
  }, [habitLogs]);

  // Dev-only reminder simulator (checks every minute)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REMINDER_SIMULATOR !== '1') return;
    if (!trackedHabits) return;
    const shown = new Set<string>();
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const keyTime = `${hh}:${mm}`;
      for (const habit of trackedHabits) {
        const anyHabit = habit as any;
        const times: string[] = (anyHabit?.reminders?.
````

````plaintext
src/components/habit-tracker.tsx
collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: habitLogs } = useCollection<HabitLog>(logsQuery);

  const [today, setToday] = useState<Day | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [logModal, setLogModal] = useState<{ open: boolean; habit: Habit | null }>(() => ({ open: false, habit: null }));

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  const commitToggleCompletion = (habit: Habit) => {
    if (!user || !firestore || !habit.id) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = { completed: !habit.completed };
    updateDoc(habitDoc, updatedData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const promptStackingIfAny = (trigger: Habit) => {
    if (!trackedHabits) return;
    const dependents = trackedHabits.filter((h) => {
      const anyH = h as any;
      const rule = anyH?.stackingRule as { triggerId: string; position: 'before'|'after'; delay?: number } | undefined;
      if (!rule) return false;
      return rule.triggerId === trigger.id;
    });
    for (const dep of dependents) {
      if (dep.completed) continue;
      if (!isHabitDueToday(dep)) continue;
      const anyDep = dep as any;
      const t = anyDep?.type as string | undefined;
      const proceed = typeof window !== 'undefined' ? window.confirm(`Start next habit: ${dep.name}?`) : false;
      if (!proceed) continue;
      if (t === 'quantity' || t === 'duration') {
        setLogModal({ open: true, habit: dep });
      } else {
        commitToggleCompletion(dep);
      }
    }
  };

  const handleToggleCompletion = (habit: Habit) => {
    const anyHabit = habit as any;
    const type = anyHabit?.type as string | undefined;
    if (type === 'quantity' || type === 'duration') {
      setLogModal({ open: true, habit });
      return;
    }
    commitToggleCompletion(habit);
    promptStackingIfAny(habit);
  };

  const createHabitLog = async (habit: Habit, value?: number, unit?
````

````plaintext
src/lib/types.ts
: number; // использованный вес
  rpe?: number; // RPE (Rate of Perceived Exertion)
  completed: boolean;
  timestamp: string; // когда выполнен
};

export type ExerciseLog = {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
  skipped: boolean;
  startTime?: string;
  endTime?: string;
};

export type CycleLog = {
  cycleId: string;
  cycleNumber: number; // какое повторение цикла (для repetitions > 1)
  exercises: ExerciseLog[];
  completed: boolean;
};

export type WorkoutLog = {
  id: string;
  workoutId: string;
  programId?: string;
  userId: string;
  date: string; // ISO date
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration?: number; // минуты
  status: WorkoutExecutionStatus;
  cycles: CycleLog[];
  notes?: string;
  totalVolume?: number; // килограммы (сумма weight * reps)
  createdAt: string;
  updatedAt: string;
  userFeedback?: string;
  feedbackTags?: string[];
};

// ===============================
// HABIT TRACKER V2 - CORE TYPES
// ===============================

export type HabitType = 'boolean' | 'quantity' | 'duration' | 'range';

export type HabitTarget = {
  type: HabitType;
  unit?: string; // 'min' | 'ml' | 'km' | 'steps' | 'pages' | ...
  value?: number; // целевое значение (для quantity/duration)
  min?: number; // для диапазона
  max?: number; // для диапазона
  progressive?: {
    enabled: boolean;
    step: number; // величина изменения
    interval: number; // дней между изменениями
    maxValue?: number; // потолок цели
  };
};

export type HabitIntervalType = 'days_of_week' | 'every_n_days' | 'n_per_week' | 'custom';

export type HabitSchedule = {
  intervalType: HabitIntervalType;
  days?: Day[]; // для days_of_week
  everyNDays?: number; // для every_n_days
  nPerWeek?: number; // для n_per_week
  preferredDays?: Day[]; // предпочтительные дни для n_per_week
  timeWindow?: { start: string; end: string }; // 'HH:MM'
  startDate?: string; // ISO date
  endDate?: string; // ISO date
};

export type Reminder = {
  id: string;
  times: string[]; // список времени 'HH:MM'
  smart?: boolean;
  snooze?: boolean;
  untilDone?: boolean;
};

export type HabitV2 = {
  id: string;
  name: string;
  categoryId?: string;
  tags?: string[];
  type: HabitType;
  target?: HabitTarget;
  schedule?: HabitSchedule;
  reminders?: Reminder[];
  dependencies?: string[]; // habit stacking
  stackingRule?: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?
````

````plaintext
src/components/habit-tracker.tsx
[0]?.times as string[] | undefined) || [];
                      if (reminders.length > 0) {
                        return (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">⏰ {reminders.length}</span>
                        );
                      }
                      return null;
                    })()}
                    {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={!!habit.completed} />}
                  </div>
                </div>
              );
            })}
             {!isLoading && sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      <HabitLogModal 
        open={logModal.open}
        onOpenChange={(open) => setLogModal(s => ({ ...s, open }))}
        habitName={logModal.habit?.name || ''}
        type={(logModal.habit as any)?.type === 'duration' ? 'duration' : 'quantity'}
        unitPlaceholder={(logModal.habit as any)?.target?.unit}
        onSubmit={async (val, unit) => {
          if (logModal.habit) {
            await createHabitLog(logModal.habit, val, unit);
            commitToggleCompletion(logModal.habit);
            promptStackingIfAny(logModal.habit);
          }
          setLogModal({ open: false, habit: null });
        }}
      />
        <ManageCategoriesDialog 
            open={isManageCategoriesOpen} 
            onOpenChange={setIsManageCategoriesOpen} 
            categories={habitCategories || []}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            categoryType="Habit"
        />
    </>
  );
}
````

````plaintext
src/components/habit-tracker.tsx
!habit.completed}
                    onCheckedChange={() => handleToggleCompletion(habit)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={habit.id} 
                      className={cn(
                        "font-medium cursor-pointer",
                        habit.completed && "line-through"
                      )}
                    >
                      {habit.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const anyHabit = habit as any;
                        const t = anyHabit?.type as string | undefined;
                        const target = (anyHabit?.target?.value as number | undefined) || undefined;
                        const unit = (anyHabit?.target?.unit as string | undefined) || undefined;
                        if ((t === 'quantity' || t === 'duration') && typeof target === 'number') {
                          const prog = todaysProgress.get(habit.id);
                          const val = t === 'duration' ? prog?.durationMin : prog?.value;
                          if (typeof val === 'number') {
                            return `${val}/${target}${unit ? ' ' + unit : t === 'duration' ? ' min' : ''}`;
                          }
                        }
                        return formatHabitTarget(habit) || habit.goal;
                      })()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {Array.isArray((habit as any)?.tags) && (habit as any).tags.map((t: string) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">#{t}</span>
                      ))}
                      {(habit as any)?.priority && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">P{(habit as any).priority}</span>
                      )}
                      {(habit as any)?.difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">{(habit as any).difficulty}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const anyHabit = habit as any;
                      const reminders = (anyHabit?.reminders?.[0]?.times as string[] | undefined) || [];
                      if (reminders.length > 0) {
                        return (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">⏰ {reminders.length}</span>
                        );
                      }
                      return null;
                    })()}
                    {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={!
````

````plaintext
src/components/habit-tracker.tsx
: number, unit?: string) => {
    if (!user || !firestore) return;
    try {
      const logsCol = collection(firestore, `users/${user.uid}/habitLogs`);
      const today = format(new Date(), 'yyyy-MM-dd');
      const anyHabit = habit as any;
      const type = anyHabit?.type as string | undefined;
      const payload: any = {
        habitId: habit.id,
        date: today,
        status: 'done',
        note: undefined,
        extractedFrom: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (anyHabit?.contextParams) {
        payload.contextData = anyHabit.contextParams;
      }
      if (type === 'duration' && typeof value === 'number') {
        payload.durationMin = value;
        if (unit && unit !== 'min') payload.note = `unit: ${unit}`;
      } else if (type === 'quantity' && typeof value === 'number') {
        payload.value = value;
        if (unit) payload.note = unit;
      }
      await addDoc(logsCol, payload);
    } catch (err) {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: `users/${user?.uid}/habitLogs`,
        requestResourceData: {},
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    addDoc(habitsCollection, newHabit).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: habitsCollection.path,
````

````plaintext
docs/backend.json
",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the habit tracker."
        },
        "userId": {
          "type": "string",
          "description": "Reference to UserProfile. (Relationship: UserProfile 1:1 HabitTracker)"
        },
        "habitItemIds": {
          "type": "array",
          "description": "References to HabitItem. (Relationship: HabitTracker 1:N HabitItem)",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "id",
        "userId"
      ]
    },
    "HabitItem": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "HabitItem",
      "type": "object",
      "description": "Represents a single item in the habit tracker, such as mindfulness or study lesson.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the habit item."
        },
        "habitTrackerId": {
          "type": "string",
          "description": "Reference to HabitTracker. (Relationship: HabitTracker 1:N HabitItem)"
        },
        "name": {
          "type": "string",
          "description": "Name of the habit item (e.g., Mindfulness, Study Lesson)."
        },
        "program": {
          "type": "string",
          "description": "Name of the program (e.g., Mathematics, Language)."
        },
        "lessons": {
          "type": "number",
          "description": "Number of lessons for the program."
        },
        "completed": {
          "type": "boolean",
          "description": "Indicates whether the habit item is completed for the day."
        }
      },
      "required": [
        "id",
        "habitTrackerId",
        "name"
      ]
    }
  },
  "auth": {
    "providers": [
      "password",
      "anonymous",
      "google.com"
    ]
  },
  "firestore": {
    "structure": [
      {
        "path": "/users/{userId}",
        "definition": {
          "entityName": "UserProfile",
          "schema": {
            "$ref": "#/backend/entities/UserProfile"
          },
          "description": "Stores user profile information.  Root path for all user-owned data.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/workoutPlans/{workoutPlanId}",
        "definition": {
          "entityName": "WorkoutPlan",
          "schema": {
            "$ref": "#/backend/entities/WorkoutPlan"
          },
          "description": "Stores workout plans created by the user. Includes denormalized 'userId' for authorization independence.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
````

````plaintext
src/components/habit-tracker.tsx
 requestResourceData: newHabit,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/habitCategories`);
    addDoc(catCollection, { name }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateCategory = (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, categoryId);
    deleteDoc(catDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const todaysHabits = useMemo(() => {
    if (!trackedHabits) return [];
    return tracke
````

````plaintext
src/components/habit-tracker.tsx
[0]?.times as string[] | undefined) || [];
        if (!times.includes(keyTime)) continue;
        if (habit.completed) continue;
        if (!isHabitDueToday(habit, now)) continue;
        const key = `${habit.id}:${keyTime}:${now.toDateString()}`;
        if (shown.has(key)) continue;
        shown.add(key);
        toast({
          title: 'Reminder',
          description: `Time for: ${habit.name}`,
        });
      }
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [trackedHabits, toast]);

  return (
      <>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Habits</CardTitle>
            <div className="flex items-center gap-2" aria-label="Header actions">
              <SystemLibraryDialog />
              <AnalyticsDialog />
              <ExportDialog />
              <InsightsDialog />
              <ImportClaudeDialog />
              <DailyReflectionDialog habits={trackedHabits || []} />
              <DailyReflectionReview habits={trackedHabits || []} />
              <AddHabitDialog onHabitAdd={handleAddHabit} openManageCategories={() => setIsManageCategoriesOpen(true)} categories={habitCategories || []} habits={trackedHabits || []} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sortedHabits.map((habit) => {
              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all",
                    habit.completed && "opacity-50"
                  )}
                >
                  <Checkbox 
                    id={habit.id} 
                    checked={!
````

````plaintext
docs/backend.json
Includes denormalized 'userId' for authorization independence.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "habitTrackerId",
              "description": "The unique identifier of the habit tracker."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/habitTrackers/{habitTrackerId}/habitItems/{habitItemId}",
        "definition": {
          "entityName": "HabitItem",
          "schema": {
            "$ref": "#/backend/entities/HabitItem"
          },
          "description": "Stores individual habit items within a habit tracker. Includes denormalized 'userId' for authorization independence.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "habitTrackerId",
              "description": "The unique identifier of the habit tracker."
            },
            {
              "name": "habitItemId",
              "description": "The unique identifier of the habit item."
            }
          ]
        }
      }
    ],
    "reasoning": "The Firestore structure is designed to support the Zenith Trainer application's core features, focusing on user-specific data and collaborative elements. The structure prioritizes Authorization Independence by denormalizing user ownership.  It leverages path-based ownership for WorkoutPlans, ScheduledWorkouts, HabitTrackers and HabitItems.  This approach simplifies security rules and ensures atomic operations.\n\nUser profiles are stored under `/users/{userId}` which ensures clear ownership. Workout plans, scheduled workouts, habit trackers, and habit items are structured as subcollections of the user's document, enabling easy retrieval and management of user-specific data. This also supports the QAPs by allowing secure `list` operations within a user's own data.\n\nThis design eliminates the need for complex `get()` calls in security rules, enhancing security and performance. It provides a scalable and maintainable structure for the application's data."
  }
}
````

````plaintext
docs/blueprint.md
# **App Name**: Zenith Trainer

## Core Features:

- Custom Workout Builder: Create and customize workout routines, including strength training, bio-dynamics, TRX exercises, and static exercises based on user preferences.
- Workout Schedule: Schedule workouts for specific days and times (Monday, Wednesday, Friday for strength; Tuesday, Thursday, Saturday for bio-dynamics, including running and static exercises).
- Exercise Library: Browse a database of exercises with descriptions, videos, and instructions, and with ability for the user to add custom exercises and re-organize the catalog.
- Habit Tracker: Track mindfulness, study lessons (specifying the program and number of lessons), and other activities in a checkbox-based habit tracker.
- Performance Analytics: Visualize your progress with charts and graphs displaying workout frequency, habit completion, and overall trends, and offering the ability to export data in a format suitable for AI analysis.
- AI Routine Optimizer: Suggests a balanced exercise schedule that includes: strength training, bio-dynamics, running, mindfulness, study lessons and static exercises from the user library based on user input, schedule availability, and the primary goal of muscle definition and fat loss. This feature will operate as a tool and suggest exercise schedule including custom exercises provided by user
- User profile and data management: Functionality that allows users to maintain profile with general information and workout plans to be accessible anywhere and synchronized.

## Style Guidelines:

- Primary color: Soft Olive (#BDBDBD), inspired by natural elements.
- Background color: Off White (#F5F5F5), providing a clean and calming base.
- Accent color: Terracotta (#E07A5F), used for highlighting important interactive elements.
- Font pairing: 'Inter' (sans-serif) for body text and 'Alegreya' (serif) for headlines.
- Use minimalistic and clean icons related to fitness, mindfulness, and study.
- Implement a 'liquid glass' style with a modern and minimalist layout, using пастельные тона (pastel tones) for a visually appealing interface.
- Subtle and smooth animations to enhance user experience, providing visual feedback during interactions and transitions.
````

````plaintext
src/lib/types.ts
: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?: number; // для quantity
  durationMin?: number; // для duration
  percentage?: number; // степень выполнения (0..100)
  note?: string;
  mood?: 'low' | 'neutral' | 'high';
  energy?: 'low' | 'neutral' | 'high';
  contextData?: { [systemId: string]: { [paramId: string]: any } };
  extractedFrom?: 'reflection' | 'manual' | 'auto';
  aiConfidence?: number;
  manuallyEdited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitStreak = {
  habitId: string;
  current: number;
  longest: number;
  frozenUntil?: string; // ISO date
  skipTokens?: number;
  maxSkipTokens?: number;
  lastCompletedDate?: string; // ISO date
  history?: {
    date: string; // ISO date
    action: 'completed' | 'skipped' | 'frozen' | 'broken';
    note?: string;
  }[];
};

export type DailyReflection = {
  date: string; // YYYY-MM-DD
  rawText: string;
  parsedEntries: {
    habitId: string;
    habitName?: string;
    extractedValue?: number;
    extractedDuration?: number;
    extractedNote?: string;
    mood?: 'low' | 'neutral' | 'high';
    energy?: 'low' | 'neutral' | 'high';
    confidence: number; // 0..1
    suggestedStatus: HabitLogStatus;
  }[];
  manualCorrections: boolean;
  correctedEntries?: {
    habitId: string;
    originalParsed: any;
    userCorrected: any;
  }[];
  createdAt: string;
  updatedAt: string;
};

// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?
````

````plaintext
src/lib/habits.ts
new Date(h.schedule.startDate) : undefined;
    if (!start || !h.schedule?.everyNDays) return true;
    const diff = differenceInCalendarDays(date, start);
    return diff >= 0 && diff % h.schedule.everyNDays === 0;
  }

  if (intervalType === 'n_per_week') {
    // basic approximation: if preferredDays provided, due on those days; else assume every day as candidate
    if (h.schedule?.preferredDays && h.schedule.preferredDays.length > 0) {
      const weekday = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
      return h.schedule.preferredDays.includes(weekday);
    }
    return true;
  }

  // custom/cron - treat as always due until implemented
  return true;
}

export function isHabitDueNow(habit: HabitV2 | HabitLegacy, date: Date = new Date()): boolean {
  const h: HabitV2 = (habit as HabitV2).type ? (habit as HabitV2) : toHabitV2(habit as HabitLegacy);
  if (!isHabitDueToday(h, date)) return false;
  return isWithinTimeWindow(date, h.schedule?.timeWindow);
}

export function formatHabitTarget(habit: HabitV2 | HabitLegacy): string | null {
  const h: any = habit as any;
  if (h?.target?.type === 'quantity') {
    const v = h.target.value;
    const u = h.target.unit || '';
    if (typeof v === 'number') return `${v}${u ? ' ' + u : ''}`;
  }
  if (h?.target?.type === 'duration') {
    const v = h.target.value;
    const u = h.target.unit || 'min';
    if (typeof v === 'number') return `${v} ${u}`;
  }
  return null;
}

// ===============================
// Analytics helpers (pure)
// ===============================

export function computeCompletionRate(logs: HabitLog[], from: Date, to: Date): number {
  const inRange = logs.filter(l => {
    const d = new Date(l.date);
    return d >= from && d <= to;
  });
  if (inRange.length === 0) return 0;
  const completed = inRange.filter(l => l.status === 'done').length;
  return (completed / inRange.length) * 100;
}

export function computeConsistencyScore(logs: HabitLog[], from: Date, to: Date): number {
  // Consistency: lower variance by weekday means more consistent. Return 0..100 where 100 is very consistent.
````

````plaintext
docs/backend.json
",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the scheduled workout."
        },
        "workoutPlanId": {
          "type": "string",
          "description": "Reference to WorkoutPlan. (Relationship: WorkoutPlan 1:N ScheduledWorkout)"
        },
        "exerciseIds": {
          "type": "array",
          "description": "References to Exercise. (Relationship: ScheduledWorkout N:N Exercise)",
          "items": {
            "type": "string"
          }
        },
        "dayOfWeek": {
          "type": "string",
          "description": "Day of the week for the scheduled workout (e.g., Monday, Tuesday)."
        },
        "timeOfDay": {
          "type": "string",
          "description": "Time of day for the scheduled workout (e.g., Morning, Afternoon, Evening)."
        },
        "durationMinutes": {
          "type": "number",
          "description": "Duration of the workout in minutes."
        }
      },
      "required": [
        "id",
        "workoutPlanId",
        "dayOfWeek",
        "timeOfDay"
      ]
    },
    "Exercise": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Exercise",
      "type": "object",
      "description": "Represents a specific exercise with details such as name, description, and instructions.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the exercise."
        },
        "name": {
          "type": "string",
          "description": "Name of the exercise."
        },
        "description": {
          "type": "string",
          "description": "Description of the exercise."
        },
        "instructions": {
          "type": "string",
          "description": "Instructions on how to perform the exercise."
        },
        "exerciseType": {
          "type": "string",
          "description": "The type of exercise, e.g., strength training, bio-dynamics, TRX, static."
        },
        "equipment": {
          "type": "string",
          "description": "Equipment required for the exercise (e.g., dumbbells, resistance bands, TRX)."
        },
        "videoUrl": {
          "type": "string",
          "description": "URL of a video demonstrating the exercise.",
          "format": "uri"
        }
      },
      "required": [
        "id",
        "name",
        "exerciseType"
      ]
    },
    "HabitTracker": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "HabitTracker",
      "type": "object",
      "description": "Represents a habit tracker for tracking mindfulness, study lessons, and other activities.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the habit tracker."
        },
        "userId": {
          "type": "string",
          "description": "Reference to UserProfile.
````

````plaintext
Thought process: Анализирую структуру проекта и типы компонентов.

Хорошо, я получил много информации из project knowledge. Теперь мне нужно понять текущее состояние проекта. Я вижу:

1. Основные типы в src/lib/types.ts - определены HabitV2, HabitLog, DailyReflection, AnalysisSystem
2. Компонент habit-tracker.tsx - основной UI компонент
3. Функции-хелперы в src/lib/habits.ts

Мне нужно еще посмотреть на файлы компонентов, которые упоминаются в habit-tracker.tsx:
- AddHabitDialog
- DailyReflectionDialog
- DailyReflectionReview
- SystemLibraryDialog
- AnalyticsDialog
- ExportDialog
- InsightsDialog
- ImportClaudeDialog
- HabitLogModal

Давайте поищу эти компоненты.
````

**project_knowledge_search**

*Request*

````javascript
{
  "query": "add-habit-dialog daily-reflection system-library analytics export insights import",
  "max_text_results": 15
}
````

*Response*

````plaintext
src/lib/types.ts
: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveSystem = {
  systemId: string;
  userId: string;
  activatedAt: string;
  isPremium: boolean;
  expiresAt?: string;
  settings?: {
    notificationsEnabled?: boolean;
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    customParams?: any;
  };
};

// ===============================
// INSIGHTS
// ===============================

export type InsightType = 'recommendation' | 'warning' | 'achievement' | 'pattern';

export type HabitInsight = {
  id: string;
  date: string; // ISO date
  systemId?: string;
  type: InsightType;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  data?: {
    habitIds?: string[];
    metrics?: { [key: string]: number };
    suggestions?: {
      action: 'add' | 'modify' | 'remove' | 'pause' | 'change_schedule';
      habitId?: string;
      newParams?: any;
      reason?: string;
    }[];
  };
  dismissed?: boolean;
  actionTaken?: string;
  createdAt: string;
};

// ===============================
// EXPORT / IMPORT
// ===============================

export type HabitExportV1 = {
  version: '1.0';
  exportDate: string;
  userId: string;
  habits: HabitV2[];
  logs: HabitLog[];
  streaks: HabitStreak[];
  insights: HabitInsight[];
  activeSystems: { systemId: string; systemVersion: string }[];
  systemDefinitions?: AnalysisSystem[];
  metadata: {
    totalHabits: number;
    dateRange: { from: string; to: string };
    completionRate: number;
  };
};
````

````plaintext
src/components/habit-tracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
import type { HabitLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { HabitLogModal } from './habit-log-modal';
import { DailyReflectionDialog } from './daily-reflection-dialog';
import { DailyReflectionReview } from './daily-reflection-review';
import { SystemLibraryDialog } from './system-library-dialog';
import { AnalyticsDialog } from './analytics-dialog';
import { ExportDialog } from './export-dialog';
import { InsightsDialog } from './insights-dialog';
import { ImportClaudeDialog } from './import-claude-dialog';
import { useToast } from '@/hooks/use-toast';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/daily-reflection-dialog.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Habit, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailyReflectionDialogProps {
  habits: Habit[];
  trigger?: React.ReactNode;
}

export function DailyReflectionDialog({ habits, trigger }: DailyReflectionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => {
    const today = new Date();
    const weekday = today.toLocaleString('en-US', { weekday: 'long' }) as Day;
    const todaysHabits = (habits || []).filter(h => !h.days || h.days.length === 0 || h.days.includes(weekday));
    const completed = todaysHabits.filter(h => !!h.completed);
    const notCompleted = todaysHabits.filter(h => !h.completed);
    let t = `📅 Reflection for ${format(today, 'yyyy-MM-dd')}\n`;
    if (completed.length) {
      t += `\n✅ DONE:\n\n`;
      for (const h of completed) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    if (notCompleted.length) {
      t += `\n❌ NOT DONE:\n\n`;
      for (const h of notCompleted) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    return t.trim();
  }, [habits]);

  useEffect(() => {
    if (open) setText(template);
  }, [open, template]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      const col = collection(firestore, `users/${user.uid}/dailyReflections`);
      await setDoc(doc(col, dateStr), {
        date: dateStr,
        rawText: text,
        parsedEntries: [],
        manualCorrections: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection saved', description: 'Your daily reflection has been saved.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ??
````

````plaintext
src/components/daily-reflection-review.tsx
'Saving…' : 'Save Logs'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/daily-reflection-review.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { parseReflectionMock } from '@/lib/reflection';

interface DailyReflectionReviewProps {
  habits: Habit[];
  trigger?: React.ReactNode;
}

type EditableEntry = {
  habitId: string;
  habitName: string;
  status: HabitLogStatus;
  value?: string;
  durationMin?: string;
};

export function DailyReflectionReview({ habits, trigger }: DailyReflectionReviewProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const loadAndParse = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
    const snap = await getDoc(ref);
    const rawText = snap.exists() ? (snap.data()?.rawText as string) : '';
    const parsed = parseReflectionMock(rawText || '', habits || []);
    setEntries(parsed.map(p => ({
      habitId: p.habitId,
      habitName: p.habitName,
      status: p.suggestedStatus,
      value: p.extractedValue != null ? String(p.extractedValue) : '',
      durationMin: p.extractedDuration != null ? String(p.extractedDuration) : '',
    })));
  };

  useEffect(() => {
    if (open) {
      loadAndParse();
    }
  }, [open]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      // write logs
      const logsCol = collection(firestore, `users/${user.uid}/habitLogs`);
      for (const e of entries) {
        const matched = (habits || []).find(h => h.id === e.habitId) as any;
        const contextData = matched?.contextParams ? matched.contextParams : undefined;
        await addDoc(logsCol, {
          habitId: e.habitId,
          date: dateStr,
          status: e.status,
          value: e.value ? Number(e.value) : undefined,
          durationMin: e.durationMin ?
````

````plaintext
src/lib/types.ts
: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?: number; // для quantity
  durationMin?: number; // для duration
  percentage?: number; // степень выполнения (0..100)
  note?: string;
  mood?: 'low' | 'neutral' | 'high';
  energy?: 'low' | 'neutral' | 'high';
  contextData?: { [systemId: string]: { [paramId: string]: any } };
  extractedFrom?: 'reflection' | 'manual' | 'auto';
  aiConfidence?: number;
  manuallyEdited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitStreak = {
  habitId: string;
  current: number;
  longest: number;
  frozenUntil?: string; // ISO date
  skipTokens?: number;
  maxSkipTokens?: number;
  lastCompletedDate?: string; // ISO date
  history?: {
    date: string; // ISO date
    action: 'completed' | 'skipped' | 'frozen' | 'broken';
    note?: string;
  }[];
};

export type DailyReflection = {
  date: string; // YYYY-MM-DD
  rawText: string;
  parsedEntries: {
    habitId: string;
    habitName?: string;
    extractedValue?: number;
    extractedDuration?: number;
    extractedNote?: string;
    mood?: 'low' | 'neutral' | 'high';
    energy?: 'low' | 'neutral' | 'high';
    confidence: number; // 0..1
    suggestedStatus: HabitLogStatus;
  }[];
  manualCorrections: boolean;
  correctedEntries?: {
    habitId: string;
    originalParsed: any;
    userCorrected: any;
  }[];
  createdAt: string;
  updatedAt: string;
};

// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?
````

````plaintext
src/components/insights-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc } from 'firebase/firestore';
import type { HabitLog, HabitInsight } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';

export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs = [] } = useCollection<HabitLog>(logsQuery);

  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const insights = generateInsightsFromLogs(logs);
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, ins as any);
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Generate insights</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>AI Insights (basic)</DialogTitle>
          <DialogDescription>Create recommendations based on current logs and active systems.</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This will analyze your logs and store insights in your account.
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/add-habit-dialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { AnalysisSystem } from '@/lib/types';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
  // V2 fields (optional, backward compatible)
  type: z.enum(['boolean', 'quantity', 'duration']).default('boolean').optional(),
  targetValue: z.number().min(0).optional(),
  targetUnit: z.string().optional(),
  reminderTimes: z.array(z.string()).default([]).optional(),
  stackingEnabled: z.boolean().default(false).optional(),
  stackingTriggerId: z.string().optional(),
  stackingPosition: z.enum(['before', 'after']).optional(),
  stackingDelay: z.number().min(0).optional(),
  // tags/priority/difficulty
  tags: z.array(z.string()).default([]).optional(),
  priority: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy','medium','hard']).optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  onHabitAdd: (habit: Omit<Habit, 'id'>) => void;
  onHabitUpdate?: (habit: Habit) => void;
  onHabitDelete?: (habitId: string) => void;
  habitToEdit?: Habit;
  trigger?: React.ReactNode;
  openManageCategories: () => void;
  categories: HabitCategory[];
  habits?: Habit[];
}

export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories, habits = [] }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !
````

````plaintext
src/components/daily-reflection-review.tsx
matched.contextParams : undefined;
        await addDoc(logsCol, {
          habitId: e.habitId,
          date: dateStr,
          status: e.status,
          value: e.value ? Number(e.value) : undefined,
          durationMin: e.durationMin ? Number(e.durationMin) : undefined,
          ...(contextData && { contextData }),
          extractedFrom: 'reflection',
          aiConfidence: 0.7,
          manuallyEdited: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      // update reflection doc
      const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
      await updateDoc(ref, {
        parsedEntries: entries.map(e => ({
          habitId: e.habitId,
          habitName: e.habitName,
          extractedValue: e.value ? Number(e.value) : undefined,
          extractedDuration: e.durationMin ? Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection processed', description: 'Logs created from reflection.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ??
````

````plaintext
src/app/schedule/page.tsx
'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DailySchedule } from '@/components/daily-schedule';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import type { Exercise, Habit, HabitCategory, ExerciseCategory } from '@/lib/types';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Data fetching from Firestore
  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises, isLoading: exercisesLoading } = useCollection<Exercise>(exercisesQuery);

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);

  const habitCatQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: habitCatLoading } = useCollection<HabitCategory>(habitCatQuery);
  
  const exerciseCatQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/system-library-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUILTIN_SYSTEMS } from '@/lib/systems';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';

export function SystemLibraryDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  const isActive = (systemId: string) => !!(activeSystems || []).find(s => s.systemId === systemId);

  const handleToggle = async (systemId: string) => {
    if (!user || !firestore) return;
    const ref = doc(firestore, `users/${user.uid}/activeSystems/${systemId}`);
    if (isActive(systemId)) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        systemId,
        activatedAt: new Date().toISOString(),
        isPremium: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Systems</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Analysis Systems</DialogTitle>
          <DialogDescription>Activate systems to add context and analytics.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUILTIN_SYSTEMS.map(sys => (
            <Card key={sys.id} className="border">
              <CardHeader>
                <CardTitle className="text-base">{sys.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{sys.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">v{sys.version}</span>
                  <Button size="sm" variant={isActive(sys.id) ? 'outline' : 'default'} onClick={() => handleToggle(sys.id)}>
                    {isActive(sys.id) ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/daily-reflection-dialog.tsx
});
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Evening reflection</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Daily Reflection</DialogTitle>
          <DialogDescription>Write your notes for today. We will parse it later with AI.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-label="Cancel reflection" aria-disabled={busy}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={busy} aria-busy={busy} aria-label="Save reflection">{busy ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/daily-reflection-review.tsx
Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection processed', description: 'Logs created from reflection.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Process reflection</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Review parsed entries</DialogTitle>
          <DialogDescription>Adjust values or status, then save to create logs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {entries.map((e, idx) => (
            <div key={e.habitId} className="grid grid-cols-6 items-center gap-2 p-2 border rounded">
              <div className="col-span-2 text-sm font-medium truncate">{e.habitName}</div>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="value" value={e.value} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], value: ev.target.value };
                  setEntries(next);
                }} />
                <Input placeholder="minutes" value={e.durationMin} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], durationMin: ev.target.value };
                  setEntries(next);
                }} />
              </div>
              <div className="col-span-2">
                <Select value={e.status} onValueChange={(v) => {
                  const next = [...entries] as EditableEntry[];
                  next[idx] = { ...next[idx], status: v as HabitLogStatus };
                  setEntries(next);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground">No entries parsed from today’s reflection.</div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={entries.length === 0 || busy} aria-busy={busy}>{busy ?
````

````plaintext
docs/blueprint.md
# **App Name**: Zenith Trainer

## Core Features:

- Custom Workout Builder: Create and customize workout routines, including strength training, bio-dynamics, TRX exercises, and static exercises based on user preferences.
- Workout Schedule: Schedule workouts for specific days and times (Monday, Wednesday, Friday for strength; Tuesday, Thursday, Saturday for bio-dynamics, including running and static exercises).
- Exercise Library: Browse a database of exercises with descriptions, videos, and instructions, and with ability for the user to add custom exercises and re-organize the catalog.
- Habit Tracker: Track mindfulness, study lessons (specifying the program and number of lessons), and other activities in a checkbox-based habit tracker.
- Performance Analytics: Visualize your progress with charts and graphs displaying workout frequency, habit completion, and overall trends, and offering the ability to export data in a format suitable for AI analysis.
- AI Routine Optimizer: Suggests a balanced exercise schedule that includes: strength training, bio-dynamics, running, mindfulness, study lessons and static exercises from the user library based on user input, schedule availability, and the primary goal of muscle definition and fat loss. This feature will operate as a tool and suggest exercise schedule including custom exercises provided by user
- User profile and data management: Functionality that allows users to maintain profile with general information and workout plans to be accessible anywhere and synchronized.

## Style Guidelines:

- Primary color: Soft Olive (#BDBDBD), inspired by natural elements.
- Background color: Off White (#F5F5F5), providing a clean and calming base.
- Accent color: Terracotta (#E07A5F), used for highlighting important interactive elements.
- Font pairing: 'Inter' (sans-serif) for body text and 'Alegreya' (serif) for headlines.
- Use minimalistic and clean icons related to fitness, mindfulness, and study.
- Implement a 'liquid glass' style with a modern and minimalist layout, using пастельные тона (pastel tones) for a visually appealing interface.
- Subtle and smooth animations to enhance user experience, providing visual feedback during interactions and transitions.
````

````plaintext
src/components/export-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase/provider';
import { buildHabitExport } from '@/lib/export';

export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const data = await buildHabitExport({ firestore, userId: user.uid, dateRange: (from && to) ? { from, to } : undefined });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Export for AI analysis</DialogTitle>
          <DialogDescription>Download HabitExportV1 JSON. Optionally set date range.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">From</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">To</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleExport} disabled={busy}>{busy ? 'Building…' : 'Download JSON'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
Thought process: Разыскивая недостающие компоненты для полной оценки проекта.

Хорошо, я вижу, что у пользователя реализованы многие компоненты. Давайте теперь посмотрим на дополнительные компоненты и файлы, чтобы понять полную картину. Мне нужно увидеть:

1. ImportClaudeDialog
2. AnalyticsDialog 
3. Файлы библиотек (export.ts, insights.ts, systems.ts, reflection.ts)

Давайте продолжим поиск.
````

**project_knowledge_search**

*Request*

````javascript
{
  "query": "import-claude-dialog analytics-dialog export insights systems reflection library",
  "max_text_results": 15
}
````

*Response*

````plaintext
src/components/insights-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc } from 'firebase/firestore';
import type { HabitLog, HabitInsight } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';

export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs = [] } = useCollection<HabitLog>(logsQuery);

  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const insights = generateInsightsFromLogs(logs);
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, ins as any);
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Generate insights</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>AI Insights (basic)</DialogTitle>
          <DialogDescription>Create recommendations based on current logs and active systems.</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This will analyze your logs and store insights in your account.
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/lib/types.ts
: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?: number; // для quantity
  durationMin?: number; // для duration
  percentage?: number; // степень выполнения (0..100)
  note?: string;
  mood?: 'low' | 'neutral' | 'high';
  energy?: 'low' | 'neutral' | 'high';
  contextData?: { [systemId: string]: { [paramId: string]: any } };
  extractedFrom?: 'reflection' | 'manual' | 'auto';
  aiConfidence?: number;
  manuallyEdited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitStreak = {
  habitId: string;
  current: number;
  longest: number;
  frozenUntil?: string; // ISO date
  skipTokens?: number;
  maxSkipTokens?: number;
  lastCompletedDate?: string; // ISO date
  history?: {
    date: string; // ISO date
    action: 'completed' | 'skipped' | 'frozen' | 'broken';
    note?: string;
  }[];
};

export type DailyReflection = {
  date: string; // YYYY-MM-DD
  rawText: string;
  parsedEntries: {
    habitId: string;
    habitName?: string;
    extractedValue?: number;
    extractedDuration?: number;
    extractedNote?: string;
    mood?: 'low' | 'neutral' | 'high';
    energy?: 'low' | 'neutral' | 'high';
    confidence: number; // 0..1
    suggestedStatus: HabitLogStatus;
  }[];
  manualCorrections: boolean;
  correctedEntries?: {
    habitId: string;
    originalParsed: any;
    userCorrected: any;
  }[];
  createdAt: string;
  updatedAt: string;
};

// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?
````

````plaintext
src/components/import-claude-dialog.tsx
[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- pause:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      if (idMatch) recs.push({ action: 'pause', habitId: idMatch[1] });
    }
  }
  return recs;
}

export function ImportClaudeDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState('');
  const [busy, setBusy] = useState(false);

  const handleApply = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const recs = parseRecommendations(md);
      const habitsCol = collection(firestore, `users/${user.uid}/habits`);
      for (const r of recs) {
        if (r.action === 'add' && r.name) {
          const payload: any = { name: r.name, categoryId: '', completed: false };
          if (r.params?.type) payload.type = r.params.type;
          if (r.params?.target) payload.target = { type: r.params?.type || 'quantity', value: r.params.target, unit: r.params?.unit };
          await addDoc(habitsCol, payload);
        } else if (r.action === 'modify' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          const update: any = {};
          if (r.params?.targetType === 'duration' && typeof r.params.value === 'number') update.target = { type: 'duration', value: r.params.value, unit: r.params?.unit || 'min' };
          if (r.params?.targetType === 'quantity' && typeof r.params.value === 'number') update.target = { type: 'quantity', value: r.params.value, unit: r.params?.unit };
          await updateDoc(ref, update);
        } else if (r.action === 'pause' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          await updateDoc(ref, { archived: true });
        }
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Import Claude report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Import recommendations</DialogTitle>
          <DialogDescription>Paste key bullet points from Claude report.
````

````plaintext
src/lib/types.ts
: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveSystem = {
  systemId: string;
  userId: string;
  activatedAt: string;
  isPremium: boolean;
  expiresAt?: string;
  settings?: {
    notificationsEnabled?: boolean;
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    customParams?: any;
  };
};

// ===============================
// INSIGHTS
// ===============================

export type InsightType = 'recommendation' | 'warning' | 'achievement' | 'pattern';

export type HabitInsight = {
  id: string;
  date: string; // ISO date
  systemId?: string;
  type: InsightType;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  data?: {
    habitIds?: string[];
    metrics?: { [key: string]: number };
    suggestions?: {
      action: 'add' | 'modify' | 'remove' | 'pause' | 'change_schedule';
      habitId?: string;
      newParams?: any;
      reason?: string;
    }[];
  };
  dismissed?: boolean;
  actionTaken?: string;
  createdAt: string;
};

// ===============================
// EXPORT / IMPORT
// ===============================

export type HabitExportV1 = {
  version: '1.0';
  exportDate: string;
  userId: string;
  habits: HabitV2[];
  logs: HabitLog[];
  streaks: HabitStreak[];
  insights: HabitInsight[];
  activeSystems: { systemId: string; systemVersion: string }[];
  systemDefinitions?: AnalysisSystem[];
  metadata: {
    totalHabits: number;
    dateRange: { from: string; to: string };
    completionRate: number;
  };
};
````

````plaintext
src/components/import-claude-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import type { Habit } from '@/lib/types';

type Recommendation = {
  action: 'add' | 'modify' | 'pause';
  name?: string;
  habitId?: string;
  params?: any;
};

function parseRecommendations(markdown: string): Recommendation[] {
  const lines = markdown.split(/\r?\n/);
  const recs: Recommendation[] = [];
  for (const l of lines) {
    const s = l.trim();
    // Examples:
    // - add: habit "Drink Water" type=quantity target=2000 unit=ml
    // - modify: habitId=abc target=duration value=25 unit=min
    // - pause: habitId=xyz
    if (s.startsWith('- add:')) {
      const nameMatch = s.match(/"([^"]+)"/);
      const name = nameMatch?.[1];
      const targetMatch = s.match(/target=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/type=(\w+)/);
      recs.push({ action: 'add', name, params: { type: typeMatch?.[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.
````

````plaintext
src/components/import-claude-dialog.tsx
Basic parser will extract add/modify/pause actions.</DialogDescription>
        </DialogHeader>
        <Textarea rows={12} value={md} onChange={(e) => setMd(e.target.value)} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleApply} disabled={busy || !md.trim()}>{busy ? 'Applying…' : 'Apply'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/analytics-dialog.tsx
collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: rawLogs = [] } = useCollection<HabitLog>(logsQuery);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const logs = useMemo(() => {
    if (!from && !to) return rawLogs;
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return rawLogs.filter(l => {
      const d = new Date(l.date);
      if (f && d < f) return false;
      if (t && d > t) return false;
      return true;
    });
  }, [rawLogs, from, to]);

  const wheel = useMemo(() => computeWheelOfLife(logs), [logs]);
  const maslow = useMemo(() => computeMaslowBase(logs), [logs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Analytics</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Analytics (basic)</DialogTitle>
          <DialogDescription>Early metrics based on active systems context.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">From</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">To</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Wheel of Life</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {wheel.metrics.map(m => (
                <div key={m.area} className="flex items-center justify-between p-2 rounded border">
                  <span className="capitalize">{m.area}</span>
                  <span>{m.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Balance score: {wheel.balanceScore}%</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Maslow Base</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded border">Physiological: {maslow.physiological}%</div>
              <div className="p-2 rounded border">Safety: {maslow.safety}%</div>
              <div className="p-2 rounded border">Base stability: {maslow.baseStability}%</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/analytics-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HabitLog } from '@/lib/types';

function computeWheelOfLife(logs: HabitLog[]) {
  const areas = ['health','career','relationships','growth','finance','recreation','environment','spirituality'] as const;
  const counters: Record<string, { total: number; done: number }> = Object.fromEntries(areas.map(a => [a, { total: 0, done: 0 }])) as any;
  for (const l of logs) {
    const area = (l.contextData && (l.contextData['wheel-of-life-v1'] as any)?.life_area) as string | undefined;
    if (!area || !(area in counters)) continue;
    counters[area].total += 1;
    if (l.status === 'done') counters[area].done += 1;
  }
  const metrics = areas.map(a => ({ area: a, value: counters[a].total ? Math.round((counters[a].done / counters[a].total) * 100) : 0 }));
  const values = metrics.map(m => m.value);
  const avg = values.reduce((s,v)=>s+v,0) / (values.length || 1);
  const variance = values.reduce((s,v)=> s + Math.pow(v-avg,2), 0) / (values.length || 1);
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 10)));
  return { metrics, balanceScore };
}

function computeMaslowBase(logs: HabitLog[]) {
  const base = ['physiological','safety'] as const;
  const counters: Record<string, { total: number; done: number }> = { physiological: { total: 0, done: 0 }, safety: { total: 0, done: 0 } };
  for (const l of logs) {
    const level = (l.contextData && (l.contextData['maslow-hierarchy-v1'] as any)?.need_level) as string | undefined;
    if (!level || !(level in counters)) continue;
    counters[level].total += 1;
    if (l.status === 'done') counters[level].done += 1;
  }
  const phys = counters.physiological.total ? (counters.physiological.done / counters.physiological.total) * 100 : 0;
  const saf = counters.safety.total ? (counters.safety.done / counters.safety.total) * 100 : 0;
  const baseStability = Math.round((phys + saf) / 2);
  return { physiological: Math.round(phys), safety: Math.round(saf), baseStability };
}

export function AnalyticsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/habit-tracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
import type { HabitLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { HabitLogModal } from './habit-log-modal';
import { DailyReflectionDialog } from './daily-reflection-dialog';
import { DailyReflectionReview } from './daily-reflection-review';
import { SystemLibraryDialog } from './system-library-dialog';
import { AnalyticsDialog } from './analytics-dialog';
import { ExportDialog } from './export-dialog';
import { InsightsDialog } from './insights-dialog';
import { ImportClaudeDialog } from './import-claude-dialog';
import { useToast } from '@/hooks/use-toast';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/system-library-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUILTIN_SYSTEMS } from '@/lib/systems';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';

export function SystemLibraryDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  const isActive = (systemId: string) => !!(activeSystems || []).find(s => s.systemId === systemId);

  const handleToggle = async (systemId: string) => {
    if (!user || !firestore) return;
    const ref = doc(firestore, `users/${user.uid}/activeSystems/${systemId}`);
    if (isActive(systemId)) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        systemId,
        activatedAt: new Date().toISOString(),
        isPremium: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Systems</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Analysis Systems</DialogTitle>
          <DialogDescription>Activate systems to add context and analytics.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUILTIN_SYSTEMS.map(sys => (
            <Card key={sys.id} className="border">
              <CardHeader>
                <CardTitle className="text-base">{sys.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{sys.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">v{sys.version}</span>
                  <Button size="sm" variant={isActive(sys.id) ? 'outline' : 'default'} onClick={() => handleToggle(sys.id)}>
                    {isActive(sys.id) ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/daily-reflection-review.tsx
'Saving…' : 'Save Logs'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/lib/export.ts
import { collection, getDocs } from 'firebase/firestore';
import type { AnalysisSystem, Habit, HabitExportV1, HabitLog, HabitStreak, HabitInsight } from './types';
import { BUILTIN_SYSTEMS } from './systems';

type DateRange = { from: string; to: string };

export async function buildHabitExport(opts: {
  firestore: any;
  userId: string;
  dateRange?: DateRange;
}): Promise<HabitExportV1> {
  const { firestore, userId, dateRange } = opts;
  const habitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const logsSnap = await getDocs(collection(firestore, `users/${userId}/habitLogs`));
  const streaksSnap = await getDocs(collection(firestore, `users/${userId}/habitStreaks`));
  const insightsSnap = await getDocs(collection(firestore, `users/${userId}/habitInsights`));
  const activeSnap = await getDocs(collection(firestore, `users/${userId}/activeSystems`));

  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as Habit[];
  let logs = logsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitLog[];
  const streaks = streaksSnap.docs.map(d => ({ ...(d.data() as any) })) as unknown as HabitStreak[];
  const insights = insightsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitInsight[];
  const activeSystems = activeSnap.docs.map(d => ({ systemId: (d.data() as any).systemId || d.id, systemVersion: '1.0' }));

  if (dateRange) {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    logs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= from && d <= to;
    });
  }

  const systemDefinitions: AnalysisSystem[] = BUILTIN_SYSTEMS.filter(s => activeSystems.find(a => a.systemId === s.id));

  const totalHabits = habits.length;
  const completionRate = logs.length
    ? Math.round((logs.filter(l => l.status === 'done').length / logs.length) * 100)
    : 0;

  const exportData: HabitExportV1 = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
    habits: habits as any,
    logs,
    streaks,
    insights,
    activeSystems,
    systemDefinitions,
    metadata: {
      totalHabits,
      dateRange: dateRange || { from: '1970-01-01', to: new Date().toISOString().slice(0, 10) },
      completionRate,
    },
  };
  return exportData;
}
````

````plaintext
src/components/daily-reflection-dialog.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Habit, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailyReflectionDialogProps {
  habits: Habit[];
  trigger?: React.ReactNode;
}

export function DailyReflectionDialog({ habits, trigger }: DailyReflectionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => {
    const today = new Date();
    const weekday = today.toLocaleString('en-US', { weekday: 'long' }) as Day;
    const todaysHabits = (habits || []).filter(h => !h.days || h.days.length === 0 || h.days.includes(weekday));
    const completed = todaysHabits.filter(h => !!h.completed);
    const notCompleted = todaysHabits.filter(h => !h.completed);
    let t = `📅 Reflection for ${format(today, 'yyyy-MM-dd')}\n`;
    if (completed.length) {
      t += `\n✅ DONE:\n\n`;
      for (const h of completed) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    if (notCompleted.length) {
      t += `\n❌ NOT DONE:\n\n`;
      for (const h of notCompleted) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    return t.trim();
  }, [habits]);

  useEffect(() => {
    if (open) setText(template);
  }, [open, template]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      const col = collection(firestore, `users/${user.uid}/dailyReflections`);
      await setDoc(doc(col, dateStr), {
        date: dateStr,
        rawText: text,
        parsedEntries: [],
        manualCorrections: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection saved', description: 'Your daily reflection has been saved.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ??
````

````plaintext
src/lib/systems.ts
import type { AnalysisSystem } from './types';

export const BUILTIN_SYSTEMS: AnalysisSystem[] = [
  {
    id: 'wheel-of-life-v1',
    name: 'Wheel of Life',
    description: 'Balance across 8 life areas',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'life_area',
        label: 'Life area',
        type: 'select',
        options: [
          { value: 'health', label: 'Health' },
          { value: 'career', label: 'Career' },
          { value: 'relationships', label: 'Relationships' },
          { value: 'growth', label: 'Growth' },
          { value: 'finance', label: 'Finance' },
          { value: 'recreation', label: 'Recreation' },
          { value: 'environment', label: 'Environment' },
          { value: 'spirituality', label: 'Spirituality' },
        ],
        required: false,
        aiAssignable: true,
      },
      {
        id: 'impact_score',
        label: 'Impact score',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'wheel',
      metrics: [
        { id: 'area_completion', label: 'Area completion', calculation: 'done/total per area' },
        { id: 'balance_score', label: 'Balance score', calculation: '100 - stddev(area_completion)*10' },
      ],
      insights: ['weak areas', 'strong areas', 'balance']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'maslow-hierarchy-v1',
    name: 'Maslow Pyramid',
    description: 'Needs hierarchy focus',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'need_level',
        label: 'Need level',
        type: 'select',
        options: [
          { value: 'physiological', label: 'Physiological' },
          { value: 'safety', label: 'Safety' },
          { value: 'belonging', label: 'Belonging' },
          { value: 'esteem', label: 'Esteem' },
          { value: 'self_actualization', label: 'Self-actualization' },
        ],
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'pyramid',
      metrics: [
        { id: 'base_stability', label: 'Base stability', calculation: 'avg(physiological, safety)' },
      ],
      insights: ['base weak', 'upper strong']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
````

````plaintext
src/components/export-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase/provider';
import { buildHabitExport } from '@/lib/export';

export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const data = await buildHabitExport({ firestore, userId: user.uid, dateRange: (from && to) ? { from, to } : undefined });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Export for AI analysis</DialogTitle>
          <DialogDescription>Download HabitExportV1 JSON. Optionally set date range.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">From</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">To</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleExport} disabled={busy}>{busy ? 'Building…' : 'Download JSON'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
Thought process: Изучаю вспомогательные файлы для полного анализа проекта.

Отлично! Теперь мне нужно посмотреть еще на некоторые вспомогательные файлы, чтобы получить полную картину. Мне нужно посмотреть на:
- src/lib/insights.ts
- src/lib/reflection.ts
- Возможно AddHabitDialog компонент для понимания как создаются привычки

Давайте продолжим поиск.
````

**project_knowledge_search**

*Request*

````javascript
{
  "query": "insights.ts reflection.ts parseReflection generateInsights",
  "max_text_results": 10
}
````

*Response*

````plaintext
src/lib/types.ts
: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?: number; // для quantity
  durationMin?: number; // для duration
  percentage?: number; // степень выполнения (0..100)
  note?: string;
  mood?: 'low' | 'neutral' | 'high';
  energy?: 'low' | 'neutral' | 'high';
  contextData?: { [systemId: string]: { [paramId: string]: any } };
  extractedFrom?: 'reflection' | 'manual' | 'auto';
  aiConfidence?: number;
  manuallyEdited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitStreak = {
  habitId: string;
  current: number;
  longest: number;
  frozenUntil?: string; // ISO date
  skipTokens?: number;
  maxSkipTokens?: number;
  lastCompletedDate?: string; // ISO date
  history?: {
    date: string; // ISO date
    action: 'completed' | 'skipped' | 'frozen' | 'broken';
    note?: string;
  }[];
};

export type DailyReflection = {
  date: string; // YYYY-MM-DD
  rawText: string;
  parsedEntries: {
    habitId: string;
    habitName?: string;
    extractedValue?: number;
    extractedDuration?: number;
    extractedNote?: string;
    mood?: 'low' | 'neutral' | 'high';
    energy?: 'low' | 'neutral' | 'high';
    confidence: number; // 0..1
    suggestedStatus: HabitLogStatus;
  }[];
  manualCorrections: boolean;
  correctedEntries?: {
    habitId: string;
    originalParsed: any;
    userCorrected: any;
  }[];
  createdAt: string;
  updatedAt: string;
};

// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?
````

````plaintext
src/lib/types.ts
: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveSystem = {
  systemId: string;
  userId: string;
  activatedAt: string;
  isPremium: boolean;
  expiresAt?: string;
  settings?: {
    notificationsEnabled?: boolean;
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    customParams?: any;
  };
};

// ===============================
// INSIGHTS
// ===============================

export type InsightType = 'recommendation' | 'warning' | 'achievement' | 'pattern';

export type HabitInsight = {
  id: string;
  date: string; // ISO date
  systemId?: string;
  type: InsightType;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  data?: {
    habitIds?: string[];
    metrics?: { [key: string]: number };
    suggestions?: {
      action: 'add' | 'modify' | 'remove' | 'pause' | 'change_schedule';
      habitId?: string;
      newParams?: any;
      reason?: string;
    }[];
  };
  dismissed?: boolean;
  actionTaken?: string;
  createdAt: string;
};

// ===============================
// EXPORT / IMPORT
// ===============================

export type HabitExportV1 = {
  version: '1.0';
  exportDate: string;
  userId: string;
  habits: HabitV2[];
  logs: HabitLog[];
  streaks: HabitStreak[];
  insights: HabitInsight[];
  activeSystems: { systemId: string; systemVersion: string }[];
  systemDefinitions?: AnalysisSystem[];
  metadata: {
    totalHabits: number;
    dateRange: { from: string; to: string };
    completionRate: number;
  };
};
````

````plaintext
src/lib/reflection.ts
import type { Habit, DailyReflection, HabitLog, HabitLogStatus } from './types';

type ParsedEntry = {
  habitId: string;
  habitName: string;
  extractedValue?: number;
  extractedDuration?: number;
  extractedNote?: string;
  suggestedStatus: HabitLogStatus;
  confidence: number;
};

// Very simple mock parser: looks for habit names in text and first integer following the line
export function parseReflectionMock(rawText: string, habits: Habit[]): ParsedEntry[] {
  const lines = rawText.split(/\r?\n/);
  const results: ParsedEntry[] = [];
  for (const habit of habits) {
    const idx = lines.findIndex((l) => l.toLowerCase().includes(habit.name.toLowerCase()));
    if (idx === -1) continue;
    const windowLines = lines.slice(idx, Math.min(idx + 3, lines.length));
    const joined = windowLines.join(' ');
    const match = joined.match(/(\d+)(?:\s*(min|minutes|ml|km|steps))?/i);
    let value: number | undefined;
    let duration: number | undefined;
    if (match) {
      const n = parseInt(match[1], 10);
      const unit = (match[2] || '').toLowerCase();
      if (unit === 'min' || unit === 'minutes') duration = n;
      else value = n;
    }
    const note = windowLines.join('\n');
    const suggestedStatus: HabitLogStatus = duration != null || value != null ? 'done' : 'partial';
    results.push({
      habitId: habit.id,
      habitName: habit.name,
      extractedValue: value,
      extractedDuration: duration,
      extractedNote: note,
      suggestedStatus,
      confidence: 0.7,
    });
  }
  return results;
}
````

````plaintext
src/components/insights-dialog.tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc } from 'firebase/firestore';
import type { HabitLog, HabitInsight } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';

export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs = [] } = useCollection<HabitLog>(logsQuery);

  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const insights = generateInsightsFromLogs(logs);
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, ins as any);
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Generate insights</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>AI Insights (basic)</DialogTitle>
          <DialogDescription>Create recommendations based on current logs and active systems.</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This will analyze your logs and store insights in your account.
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/lib/insights.ts
import type { HabitLog, HabitInsight } from './types';

export function generateInsightsFromLogs(logs: HabitLog[]): HabitInsight[] {
  const insights: HabitInsight[] = [] as any;
  // Wheel of Life weak areas
  const areas = ['health','career','relationships','growth','finance','recreation','environment','spirituality'] as const;
  const counters: Record<string, { total: number; done: number }> = Object.fromEntries(areas.map(a => [a, { total: 0, done: 0 }])) as any;
  for (const l of logs) {
    const area = (l.contextData && (l.contextData['wheel-of-life-v1'] as any)?.life_area) as string | undefined;
    if (area && counters[area]) {
      counters[area].total += 1;
      if (l.status === 'done') counters[area].done += 1;
    }
  }
  const metrics = areas.map(a => ({ area: a, value: counters[a].total ? (counters[a].done / counters[a].total) * 100 : 0 }));
  const weak = metrics.filter(m => m.value > 0 && m.value < 40).sort((a,b)=>a.value-b.value).slice(0,2);
  if (weak.length > 0) {
    insights.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0,10),
      systemId: 'wheel-of-life-v1',
      type: 'warning',
      priority: 4,
      title: 'Weak life areas detected',
      description: `Low completion in: ${weak.map(w=>w.area).join(', ')}`,
      data: { metrics: Object.fromEntries(metrics.map(m=>[m.area, Math.round(m.value)])) },
      createdAt: new Date().toISOString(),
    } as any);
  }
  // Maslow base stability
  const physLogs = logs.filter(l => (l.contextData && (l.contextData['maslow-hierarchy-v1'] as any)?.need_level) === 'physiological');
  const safLogs = logs.filter(l => (l.contextData && (l.contextData['maslow-hierarchy-v1'] as any)?.need_level) === 'safety');
  const phys = physLogs.length ? physLogs.filter(l=>l.status==='done').length / physLogs.length * 100 : 0;
  const saf = safLogs.length ? safLogs.filter(l=>l.status==='done').length / safLogs.length * 100 : 0;
  const baseStability = Math.round((phys + saf) / 2);
  if (baseStability > 0 && baseStability < 60) {
    insights.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0,10),
      systemId: 'maslow-hierarchy-v1',
      type: 'recommendation',
      priority: 5,
      title: 'Base needs unstable',
      description: 'Focus on sleep, nutrition, financial safety before advanced goals.',
      data: { metrics: { physiological: Math.round(phys), safety: Math.round(saf), baseStability } },
      createdAt: new Date().toISOString(),
    } as any);
  }
  return insights;
}
````

````plaintext
src/components/habit-tracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
import type { HabitLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { HabitLogModal } from './habit-log-modal';
import { DailyReflectionDialog } from './daily-reflection-dialog';
import { DailyReflectionReview } from './daily-reflection-review';
import { SystemLibraryDialog } from './system-library-dialog';
import { AnalyticsDialog } from './analytics-dialog';
import { ExportDialog } from './export-dialog';
import { InsightsDialog } from './insights-dialog';
import { ImportClaudeDialog } from './import-claude-dialog';
import { useToast } from '@/hooks/use-toast';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ?
````

````plaintext
src/components/daily-reflection-review.tsx
matched.contextParams : undefined;
        await addDoc(logsCol, {
          habitId: e.habitId,
          date: dateStr,
          status: e.status,
          value: e.value ? Number(e.value) : undefined,
          durationMin: e.durationMin ? Number(e.durationMin) : undefined,
          ...(contextData && { contextData }),
          extractedFrom: 'reflection',
          aiConfidence: 0.7,
          manuallyEdited: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      // update reflection doc
      const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
      await updateDoc(ref, {
        parsedEntries: entries.map(e => ({
          habitId: e.habitId,
          habitName: e.habitName,
          extractedValue: e.value ? Number(e.value) : undefined,
          extractedDuration: e.durationMin ? Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection processed', description: 'Logs created from reflection.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ??
````

````plaintext
src/lib/export.ts
import { collection, getDocs } from 'firebase/firestore';
import type { AnalysisSystem, Habit, HabitExportV1, HabitLog, HabitStreak, HabitInsight } from './types';
import { BUILTIN_SYSTEMS } from './systems';

type DateRange = { from: string; to: string };

export async function buildHabitExport(opts: {
  firestore: any;
  userId: string;
  dateRange?: DateRange;
}): Promise<HabitExportV1> {
  const { firestore, userId, dateRange } = opts;
  const habitsSnap = await getDocs(collection(firestore, `users/${userId}/habits`));
  const logsSnap = await getDocs(collection(firestore, `users/${userId}/habitLogs`));
  const streaksSnap = await getDocs(collection(firestore, `users/${userId}/habitStreaks`));
  const insightsSnap = await getDocs(collection(firestore, `users/${userId}/habitInsights`));
  const activeSnap = await getDocs(collection(firestore, `users/${userId}/activeSystems`));

  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as Habit[];
  let logs = logsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitLog[];
  const streaks = streaksSnap.docs.map(d => ({ ...(d.data() as any) })) as unknown as HabitStreak[];
  const insights = insightsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as unknown as HabitInsight[];
  const activeSystems = activeSnap.docs.map(d => ({ systemId: (d.data() as any).systemId || d.id, systemVersion: '1.0' }));

  if (dateRange) {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    logs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= from && d <= to;
    });
  }

  const systemDefinitions: AnalysisSystem[] = BUILTIN_SYSTEMS.filter(s => activeSystems.find(a => a.systemId === s.id));

  const totalHabits = habits.length;
  const completionRate = logs.length
    ? Math.round((logs.filter(l => l.status === 'done').length / logs.length) * 100)
    : 0;

  const exportData: HabitExportV1 = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
    habits: habits as any,
    logs,
    streaks,
    insights,
    activeSystems,
    systemDefinitions,
    metadata: {
      totalHabits,
      dateRange: dateRange || { from: '1970-01-01', to: new Date().toISOString().slice(0, 10) },
      completionRate,
    },
  };
  return exportData;
}
````

````plaintext
src/components/daily-reflection-review.tsx
Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Reflection processed', description: 'Logs created from reflection.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process reflection' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Process reflection</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Review parsed entries</DialogTitle>
          <DialogDescription>Adjust values or status, then save to create logs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {entries.map((e, idx) => (
            <div key={e.habitId} className="grid grid-cols-6 items-center gap-2 p-2 border rounded">
              <div className="col-span-2 text-sm font-medium truncate">{e.habitName}</div>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="value" value={e.value} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], value: ev.target.value };
                  setEntries(next);
                }} />
                <Input placeholder="minutes" value={e.durationMin} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], durationMin: ev.target.value };
                  setEntries(next);
                }} />
              </div>
              <div className="col-span-2">
                <Select value={e.status} onValueChange={(v) => {
                  const next = [...entries] as EditableEntry[];
                  next[idx] = { ...next[idx], status: v as HabitLogStatus };
                  setEntries(next);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground">No entries parsed from today’s reflection.</div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={entries.length === 0 || busy} aria-busy={busy}>{busy ?
````

````plaintext
src/lib/systems.ts
import type { AnalysisSystem } from './types';

export const BUILTIN_SYSTEMS: AnalysisSystem[] = [
  {
    id: 'wheel-of-life-v1',
    name: 'Wheel of Life',
    description: 'Balance across 8 life areas',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'life_area',
        label: 'Life area',
        type: 'select',
        options: [
          { value: 'health', label: 'Health' },
          { value: 'career', label: 'Career' },
          { value: 'relationships', label: 'Relationships' },
          { value: 'growth', label: 'Growth' },
          { value: 'finance', label: 'Finance' },
          { value: 'recreation', label: 'Recreation' },
          { value: 'environment', label: 'Environment' },
          { value: 'spirituality', label: 'Spirituality' },
        ],
        required: false,
        aiAssignable: true,
      },
      {
        id: 'impact_score',
        label: 'Impact score',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'wheel',
      metrics: [
        { id: 'area_completion', label: 'Area completion', calculation: 'done/total per area' },
        { id: 'balance_score', label: 'Balance score', calculation: '100 - stddev(area_completion)*10' },
      ],
      insights: ['weak areas', 'strong areas', 'balance']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'maslow-hierarchy-v1',
    name: 'Maslow Pyramid',
    description: 'Needs hierarchy focus',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'need_level',
        label: 'Need level',
        type: 'select',
        options: [
          { value: 'physiological', label: 'Physiological' },
          { value: 'safety', label: 'Safety' },
          { value: 'belonging', label: 'Belonging' },
          { value: 'esteem', label: 'Esteem' },
          { value: 'self_actualization', label: 'Self-actualization' },
        ],
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'pyramid',
      metrics: [
        { id: 'base_stability', label: 'Base stability', calculation: 'avg(physiological, safety)' },
      ],
      insights: ['base weak', 'upper strong']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
````

````plaintext
Thought process

Отлично! Теперь у меня есть достаточно полная картина. Дайте мне проанализировать AddHabitDialog, чтобы понять как создаются привычки и какие поля поддерживаются.
````

**project_knowledge_search**

*Request*

````javascript
{
  "query": "add-habit-dialog form fields stackingEnabled reminderTimes type quantity duration",
  "max_text_results": 15
}
````

*Response*

````plaintext
src/components/add-habit-dialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { AnalysisSystem } from '@/lib/types';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
  // V2 fields (optional, backward compatible)
  type: z.enum(['boolean', 'quantity', 'duration']).default('boolean').optional(),
  targetValue: z.number().min(0).optional(),
  targetUnit: z.string().optional(),
  reminderTimes: z.array(z.string()).default([]).optional(),
  stackingEnabled: z.boolean().default(false).optional(),
  stackingTriggerId: z.string().optional(),
  stackingPosition: z.enum(['before', 'after']).optional(),
  stackingDelay: z.number().min(0).optional(),
  // tags/priority/difficulty
  tags: z.array(z.string()).default([]).optional(),
  priority: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy','medium','hard']).optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  onHabitAdd: (habit: Omit<Habit, 'id'>) => void;
  onHabitUpdate?: (habit: Habit) => void;
  onHabitDelete?: (habitId: string) => void;
  habitToEdit?: Habit;
  trigger?: React.ReactNode;
  openManageCategories: () => void;
  categories: HabitCategory[];
  habits?: Habit[];
}

export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories, habits = [] }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !
````

````plaintext
src/components/add-habit-dialog.tsx
ontroller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v) => field.onChange(v)} value={field.value || 'boolean'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Habit Type</SelectLabel>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Target fields for quantity/duration */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              const t = field.value || 'boolean';
              if (t === 'quantity' || t === 'duration') {
                return (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="targetValue" className="text-right">
                      {t === 'quantity' ? 'Target value' : 'Minutes'}
                    </Label>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                      <Input type="number" step="1" id="targetValue" placeholder={t === 'quantity' ? 'e.g., 2000' : 'e.g., 20'} {...register('targetValue', { valueAsNumber: true })} />
                      <div className="col-span-2">
                        <Input id="targetUnit" placeholder={t === 'quantity' ?
````

````plaintext
src/components/add-habit-dialog.tsx
(habitToEdit.pomodoro || { cycles: 1 }) : undefined,
          };
          // Attach V2 fields in a backward-compatible way
          const updatedWithV2 = {
            ...updatedHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ? { delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitUpdate(updatedWithV2 as Habit);
          toast({
              title: 'Habit Updated',
              description: `${data.name} has been updated.`,
          });
      } else {
          const newHabit: Omit<Habit, 'id'> = {
            name: data.name,
            categoryId: data.categoryId,
            goal: data.goal,
            completed: false,
            days: data.days as Day[],
            ...(data.usePomodoro && { pomodoro: { cycles: 1 } }),
          };
          const newWithV2 = {
            ...newHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ?
````

````plaintext
src/components/add-habit-dialog.tsx
!habitToEdit.pomodoro);
      } else {
          reset({
              name: '',
              categoryId: '',
              goal: '',
              days: [],
              usePomodoro: false,
              type: 'boolean',
              targetValue: undefined,
              targetUnit: undefined,
              reminderTimes: [],
              stackingEnabled: false,
              stackingTriggerId: undefined,
              stackingPosition: undefined,
              stackingDelay: undefined,
              tags: [],
              priority: 3,
              difficulty: 'medium',
          });
      }
    }
  }, [isEditMode, habitToEdit, setValue, reset, isOpen]);


  const watchedDays = watch('days') || [];

  const handleAllDaysChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setValue('days', daysOfWeek, { shouldValidate: true });
    } else {
      setValue('days', [], { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    try {
      // collect system params to contextParams
      const contextParams: Record<string, Record<string, any>> = {};
      (activeSystems || []).forEach((sys) => {
        const sysParams: Record<string, any> = {};
        Object.keys((data as any) || {}).forEach((k) => {
          const prefix = `sys_${sys.systemId}_`;
          if (k.startsWith(prefix)) {
            const pid = k.substring(prefix.length);
            (sysParams as any)[pid] = (data as any)[k];
          }
        });
        if (Object.keys(sysParams).length > 0) {
          contextParams[sys.systemId] = sysParams;
        }
      });
      if(isEditMode && habitToEdit && onHabitUpdate) {
          const updatedHabit: Habit = {
              ...habitToEdit,
              name: data.name,
              categoryId: data.categoryId,
              goal: data.goal,
              days: data.days as Day[],
              pomodoro: data.usePomodoro ?
````

````plaintext
src/components/add-habit-dialog.tsx
'Target value' : 'Minutes'}
                    </Label>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                      <Input type="number" step="1" id="targetValue" placeholder={t === 'quantity' ? 'e.g., 2000' : 'e.g., 20'} {...register('targetValue', { valueAsNumber: true })} />
                      <div className="col-span-2">
                        <Input id="targetUnit" placeholder={t === 'quantity' ? 'e.g., ml, km, steps' : 'min'} {...register('targetUnit')} />
                      </div>
                    </div>
                  </div>
                );
              }
              return <div className="hidden" />;
            }}
          />

          {/* Reminders */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Reminders</Label>
            <div className="col-span-3 space-y-2">
              <Controller
                name="reminderTimes"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {(field.value || []).map((t: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={t}
                          placeholder="HH:MM"
                          onChange={(e) => {
                            const next = [...(field.value || [])];
                            next[idx] = e.target.value;
                            field.onChange(next);
                          }}
                        />
                        <Button type="button" variant="ghost" onClick={() => {
                          const next = [...(field.value || [])];
                          next.splice(idx, 1);
                          field.onChange(next);
                        }}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => field.onChange([...(field.value || []), '08:00'])}>+ Add
````

````plaintext
src/components/add-habit-dialog.tsx
   />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Priority</Label>
            <Input className="col-span-3" type="number" step="1" min={1} max={5} {...register('priority', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v)=>field.onChange(v)} value={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Stacking</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Controller
                  name="stackingEnabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="stackingEnabled" checked={!
````

````plaintext
src/components/import-claude-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import type { Habit } from '@/lib/types';

type Recommendation = {
  action: 'add' | 'modify' | 'pause';
  name?: string;
  habitId?: string;
  params?: any;
};

function parseRecommendations(markdown: string): Recommendation[] {
  const lines = markdown.split(/\r?\n/);
  const recs: Recommendation[] = [];
  for (const l of lines) {
    const s = l.trim();
    // Examples:
    // - add: habit "Drink Water" type=quantity target=2000 unit=ml
    // - modify: habitId=abc target=duration value=25 unit=min
    // - pause: habitId=xyz
    if (s.startsWith('- add:')) {
      const nameMatch = s.match(/"([^"]+)"/);
      const name = nameMatch?.[1];
      const targetMatch = s.match(/target=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/type=(\w+)/);
      recs.push({ action: 'add', name, params: { type: typeMatch?.[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.
````

````plaintext
src/components/add-habit-dialog.tsx
!field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="stackingEnabled" className="text-sm font-normal">Enable habit stacking</Label>
              </div>
              <Controller
                name="stackingTriggerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger habit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Habits</SelectLabel>
                        {habits.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="stackingPosition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Before or After" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stackingDelay" className="text-right">Delay (min)</Label>
                <Input id="stackingDelay" className="col-span-3" type="number" step="1" placeholder="e.g., 5" {...register('stackingDelay', { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          {/* Active systems parameters */}
          {(activeSystems || []).length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Analysis systems</div>
              {(activeSystems || []).map((sys) => (
                <div key={sys.systemId} className="space-y-2 p-2 rounded border">
                  <div className="text-sm font-medium">{sys.systemId}</div>
                  {(sys.parameters || sys.habitParameters || []).map((p: any) => (
                    <div key={p.id} className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">{p.label || p.id}</Label>
                      <div className="col-span-3">
                        {p.type === 'select' ?
````

````plaintext
src/components/habit-log-modal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HabitLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  type: 'quantity' | 'duration';
  unitPlaceholder?: string;
  onSubmit: (value: number, unit?: string) => void;
}

export function HabitLogModal({ open, onOpenChange, habitName, type, unitPlaceholder, onSubmit }: HabitLogModalProps) {
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  const handleSubmit = () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onSubmit(parsed, unit || undefined);
    setValue('');
    setUnit('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log {habitName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="log-value" className="text-right">
              {type === 'quantity' ? 'Value' : 'Minutes'}
            </Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input id="log-value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'quantity' ? 'e.g., 2000' : 'e.g., 20'} />
              <div className="col-span-2">
                <Input id="log-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={unitPlaceholder || (type === 'quantity' ? 'ml, km, steps' : 'min')} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/import-claude-dialog.tsx
[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- pause:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      if (idMatch) recs.push({ action: 'pause', habitId: idMatch[1] });
    }
  }
  return recs;
}

export function ImportClaudeDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState('');
  const [busy, setBusy] = useState(false);

  const handleApply = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const recs = parseRecommendations(md);
      const habitsCol = collection(firestore, `users/${user.uid}/habits`);
      for (const r of recs) {
        if (r.action === 'add' && r.name) {
          const payload: any = { name: r.name, categoryId: '', completed: false };
          if (r.params?.type) payload.type = r.params.type;
          if (r.params?.target) payload.target = { type: r.params?.type || 'quantity', value: r.params.target, unit: r.params?.unit };
          await addDoc(habitsCol, payload);
        } else if (r.action === 'modify' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          const update: any = {};
          if (r.params?.targetType === 'duration' && typeof r.params.value === 'number') update.target = { type: 'duration', value: r.params.value, unit: r.params?.unit || 'min' };
          if (r.params?.targetType === 'quantity' && typeof r.params.value === 'number') update.target = { type: 'quantity', value: r.params.value, unit: r.params?.unit };
          await updateDoc(ref, update);
        } else if (r.action === 'pause' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          await updateDoc(ref, { archived: true });
        }
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Import Claude report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Import recommendations</DialogTitle>
          <DialogDescription>Paste key bullet points from Claude report.
````

````plaintext
src/components/add-habit-dialog.tsx
{ delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitAdd(newWithV2 as Omit<Habit, 'id'>);
          toast({
            title: 'Habit Added',
            description: `${data.name} has been added to your list.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error saving the habit.'
      });
    }
  };

  const handleDelete = () => {
    if(isEditMode && habitToEdit && onHabitDelete) {
      try {
        onHabitDelete(habitToEdit.id);
        toast({
            title: 'Habit Deleted',
            description: `${habitToEdit.name} has been removed.`,
            variant: 'destructive',
        });
        setIsOpen(false);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was an error deleting the habit.'
        });
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
        setIsOpen(false);
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }

  const dialogTrigger = trigger ? trigger : (
    <Button variant="ghost" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Habit' : 'Add Custom Habit'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for your habit.' : "Add a new habit to your personal list. Click save when you're done."}
````

````plaintext
src/components/add-program-dialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Program } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  durationType: z.enum(['fixed', 'infinite']),
  startDate: z.date(),
  duration: z.object({
    value: z.preprocess(val => Number(val), z.number().min(1).optional()),
    unit: z.enum(['days', 'weeks', 'months']).optional(),
  }).optional(),
  goal: z.string().optional(),
  tags: z.string().optional(), // we'll parse this as a comma-separated string
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface AddProgramDialogProps {
  onProgramAdd: (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workouts'>) => void;
  programToEdit?: Program;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AddProgramDialog({ 
  onProgramAdd, 
  programToEdit, 
  open,
  onOpenChange,
  children
}: AddProgramDialogProps) {
  const { toast } = useToast();
  const isEditMode = !
````

````plaintext
src/components/add-habit-dialog.tsx
: (habit: Habit) => void;
  onHabitDelete?: (habitId: string) => void;
  habitToEdit?: Habit;
  trigger?: React.ReactNode;
  openManageCategories: () => void;
  categories: HabitCategory[];
  habits?: Habit[];
}

export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories, habits = [] }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!habitToEdit;
  const { user } = useUser();
  const firestore = useFirestore();
  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && habitToEdit) {
        setValue('name', habitToEdit.name);
        setValue('categoryId', habitToEdit.categoryId);
        setValue('goal', habitToEdit.goal);
        setValue('days', habitToEdit.days || []);
        setValue('usePomodoro', !
````

````plaintext
src/components/add-habit-dialog.tsx
This will permanently delete your habit.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Save Habit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
````

````plaintext
src/components/habit-tracker.tsx
[0]?.times as string[] | undefined) || [];
                      if (reminders.length > 0) {
                        return (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">⏰ {reminders.length}</span>
                        );
                      }
                      return null;
                    })()}
                    {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={!!habit.completed} />}
                  </div>
                </div>
              );
            })}
             {!isLoading && sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      <HabitLogModal 
        open={logModal.open}
        onOpenChange={(open) => setLogModal(s => ({ ...s, open }))}
        habitName={logModal.habit?.name || ''}
        type={(logModal.habit as any)?.type === 'duration' ? 'duration' : 'quantity'}
        unitPlaceholder={(logModal.habit as any)?.target?.unit}
        onSubmit={async (val, unit) => {
          if (logModal.habit) {
            await createHabitLog(logModal.habit, val, unit);
            commitToggleCompletion(logModal.habit);
            promptStackingIfAny(logModal.habit);
          }
          setLogModal({ open: false, habit: null });
        }}
      />
        <ManageCategoriesDialog 
            open={isManageCategoriesOpen} 
            onOpenChange={setIsManageCategoriesOpen} 
            categories={habitCategories || []}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            categoryType="Habit"
        />
    </>
  );
}
````

````plaintext
Thought process: Проанализировал реализацию трекера, выявил пробелы и готовит рекомендации.

Отлично! Теперь у меня есть полная картина реализации Habit Tracker 2.0. Позвольте мне проанализировать и подготовить вердикт.

Что реализовано:
1. ✅ Расширенные типы привычек (boolean, quantity, duration)
2. ✅ HabitLog с разными статусами (done, partial, skipped, missed)
3. ✅ DailyReflection с парсингом
4. ✅ Analysis Systems (Wheel of Life, Maslow)
5. ✅ Habit stacking (dependencies)
6. ✅ Reminders (базовая реализация)
7. ✅ Export в JSON
8. ✅ Import рекомендаций от Claude
9. ✅ Analytics (базовая реализация)
10. ✅ Insights генерация
11. ✅ Tags, priority, difficulty
12. ✅ Context parameters для систем анализа

Что НЕ реализовано или реализовано частично:
1. ❌ Streaks calculation and tracking (типы есть, но не используются)
2. ❌ Progressive targets (типы есть, но нет автоматического изменения)
3. ❌ Настоящая AI интеграция (Gemini) - везде заглушки
4. ❌ Advanced schedule types (n_per_week, custom/cron)
5. ❌ Smart reminders
6. ❌ Grace days / skip tokens
7. ❌ Heatmap visualization
8. ❌ Полноценная аналитика (только базовая)
9. ❌ Многие поля в диалоге создания привычки не используются
 
Подготовлю подробный отчет о текущем состоянии проекта, выделяя ключевые моменты и потенциальные направления для улучшения. Проанализирую каждый аспект с точки зрения функциональности и возможностей развития.
````

Отлично, изучил весь код. Вот мой вердикт:

## 📊 РЕАЛИЗАЦИЯ ФУНКЦИОНАЛА

### ✅ Реализовано (MVP):
1. **Типы привычек** - boolean, quantity, duration с target values
2. **Habit Logs** - статусы (done/partial/skipped/missed), value, duration
3. **Daily Reflection** - сохранение текста + базовый парсер (mock)
4. **Analysis Systems** - Wheel of Life + Maslow Pyramid
5. **Habit Stacking** - поля и UI есть, логика prompt работает
6. **Reminders** - поля, UI, симулятор для dev
7. **Export/Import** - JSON экспорт + импорт рекомендаций Claude
8. **Basic Analytics** - подсчет completion по системам
9. **Insights** - генерация базовых рекомендаций
10. **Tags/Priority/Difficulty** - поля + UI

### ⚠️ Частично/Заглушки:
1. **Streaks** - типы определены, но НЕ вычисляются и не сохраняются
2. **Progressive Targets** - типы есть, автоматика отсутствует
3. **AI Integration** - все функции parseReflectionMock, generateInsights = простейшие заглушки БЕЗ Gemini
4. **Advanced Scheduling** - `n_per_week`, `every_n_days` проверяются, но preferredDays игнорируются
5. **Grace days / Skip tokens** - поля есть, логика отсутствует

### ❌ Не реализовано:
1. **Полноценный AI парсинг** рефлексии через Gemini
2. **Smart reminders** (оптимизация времени AI)
3. **Heatmap** визуализация
4. **Расширенная аналитика** (графики, тренды)
5. **Firestore Security Rules** для новых коллекций

---

## 💻 КАЧЕСТВО КОДА

### 👍 Сильные стороны:
- Четкая структура типов (types.ts отличная)
- Хорошее разделение на компоненты
- Использование React Hook Form + Zod
- Firebase hooks абстрагированы правильно
- Обработка ошибок через errorEmitter

### ⚠️ Проблемы:
1. **Type casting везде `as any`** - теряется type safety
2. **Дублирование логики** - одни и те же проверки `(habit as any)?.type`
3. **Смешение V1/V2 типов** - backward compatibility усложняет код
4. **Отсутствие валидации** при создании логов
5. **Mock функции в продакшене** (parseReflectionMock, generateInsightsFromLogs)

---

## 🎯 РЕКОМЕНДАЦИИ

### Критично (сделай сейчас):
1. **Убери все `as any`** - используй type guards или discriminated unions
2. **Реализуй настоящий AI парсинг** - подключи Gemini через Genkit
3. **Добавь Firestore rules** для habitLogs, dailyReflections, activeSystems
4. **Вычисляй streaks** - это обещано в UI, но не работает

### Важно (следующий спринт):
5. **Progressive targets автоматика** - фоновая функция на Cloud Function
6. **Расширь Analytics** - используй recharts для графиков
7. **Habit Strength Score (HSS)** - показывай в UI
8. **Grace days логика** - implement пропуски без штрафа

### Nice-to-have:
9. Heatmap календарь
10. Smart reminders через AI
11. Экспорт в другие форматы (CSV, PDF)

---

**Итог:** Архитектура отличная, базовый функционал есть, но **60% возможностей — это заглушки**. Нужна реальная AI интеграция и доработка аналитики. Код чистый, но избыточный type casting снижает надежность.

**Оценка: 7/10** - solid foundation, требует доработки AI компонентов.

Что дальше планируете улучшать? Могу помочь с AI интеграцией или рефакторингом типов.



## Prompt:
31.10.2025, 15:50:46

> File: 

проанализируй мой план улучшений

и дай короткую обратную связь, что добавить и улучшить



## Response:
31.10.2025, 15:51:39

````plaintext
Thought process: Выявил пробелы в плане: миграция данных, офлайн-режим, уведомления, архивация.

Пользователь прислал детальный план улучшений для Habit Tracker 2.0. Мне нужно:
1. Проанализировать план на полноту и логичность
2. Выявить пробелы или недостаточно проработанные моменты
3. Дать конкретные рекомендации что добавить/улучшить
4. Ответить коротко и структурированно

Анализирую план:

**Сильные стороны:**
- Правильная приоритизация (критично → важно → nice-to-have)
- Фокус на типобезопасность и валидацию
- Реальная AI интеграция вместо моков
- Поперечные задачи (тесты, performance, a11y)
- Критерии приёмки и риски

**Что упущено или недоработано:**

1. **Миграция данных** - в плане говорится об исправлении типов, но нет стратегии миграции существующих данных HabitLegacy → HabitV2 в Firestore

2. **Offline-first подход** - нет упоминания о работе оффлайн, кешировании, синхронизации конфликтов (важно для habit tracker)

3. **Daily Reflection Review** - компонент есть, но в плане не упомянут UI для просмотра/редактирования старых рефлексий

4. **Habit Stacking execution** - логика промпта есть, но нет четкого описания как будет работать автозапуск цепочек

5. **Систем библиотека** - упомянуты Wheel/Maslow, но нет плана для добавления новых систем пользователем (marketplace идея из чата)


6. **Export/Import workflows** - текущий подход с JSON экспортом требует доработки механизмов анализа и модификации данных Claude

7. **Напоминания** - dev симулятор есть, но отсутствует план полноценных production уведомлений через различные каналы

8. **Архивация привычек** - существует поле `archived`, однако не проработан пользовательский интерфейс и логика архивирования

9. **Batch operations** - полностью отсутствует функционал массовых операций с привычками

Ключевые рекомендации:
- Разработать детальную стратегию миграции данных
- Проектировать offline-first архитектуру
- Расширить функциональность уведомлений
- Создать UI для архивации и массовых операций
````

## 📋 Анализ плана — краткая обратная связь

### ✅ Сильные стороны
- Правильная приоритизация
- Фокус на типобезопасность и реальный AI
- Критерии приёмки + риски учтены

---

## ➕ ЧТО ДОБАВИТЬ

### Критично (в Этап 1):

**1. Миграция данных**
- Скрипт миграции `HabitLegacy → HabitV2` для существующих пользователей
- Версионирование схем (`schemaVersion: 2`) + обратная совместимость чтения

**2. Offline-first стратегия**
- План работы без сети (Firebase offline persistence)
- Разрешение конфликтов при синхронизации логов

**3. Production уведомления**
- PWA push notifications (не только dev симулятор)
- Fallback на email если push недоступны

**4. Rollback план**
- Стратегия отката если миграция/код сломает данные
- Бэкап механизм перед major changes

### Важно (в Этап 2):

**5. Архив привычек UI**
- Экран просмотра `archived` привычек
- Восстановление из архива

**6. Batch operations**
- Множественный выбор привычек (отметить все, применить теги)
- Bulk export/delete

**7. AI workflow детализация**
- Подробнее: как Claude анализирует экспорт и возвращает рекомендации
- Import Claude dialog — какой формат ожидается точно?

**8. Мониторинг AI**
- Логирование failures Gemini (quota, errors)
- Alerting при деградации AI качества

### Nice-to-have (Этап 3):

**9. User onboarding**
- First-run wizard с примерами привычек
- Interactive tutorial по ключевым фичам

**10. Habit templates marketplace**
- Готовые шаблоны привычек от сообщества
- Импорт чужих систем анализа

---

## 🔧 ЧТО УЛУЧШИТЬ В СУЩЕСТВУЮЩИХ ПУНКТАХ

### Этап 1.5 — Реальный AI:
```diff
- "Флоу parseDailyReflection(text, habits) → JSON"
+ "Детально: промпт-инжиниринг, retry логика, обработка невалидных ответов AI,
+  частичный парсинг при ошибках, user feedback loop"
```

### Этап 2.1 — Progressive targets:
```diff
- "Cloud Function по расписанию"
+ "Альтернатива: клиентский триггер при открытии приложения (дешевле CF),
+  логика idempotency, что делать если пользователь отсутствовал N недель"
```

### Этап 2.4 — Grace days:
```diff
+ "UI элемент: 'Пропустить без штрафа' кнопка с подтверждением,
+  визуализация оставшихся токенов, история использования"
```

### Поперечные задачи:
```diff
+ "Logging/Monitoring: Sentry для ошибок, Analytics для фич usage,
+  Performance budget (LCP < 2.5s)"
+ "Security audit: XSS в reflection text, rate limiting AI calls"
```

---

## 🎯 ПРИОРИТЕТНЫЙ ТОП-5 ДОПОЛНЕНИЙ

1. **Миграция данных** (блокер для релиза)
2. **Offline-first** (критично для habit tracker)
3. **Production push notifications** (обещаны пользователям)
4. **AI monitoring** (чтобы знать когда ломается)
5. **Rollback план** (безопасность)

---

**Общая оценка плана: 8.5/10** — отличная структура, но не хватает production readiness моментов (миграция, мониторинг, offline). Добавь их в Этап 1 и будет 🔥

Начинать с чего предлагаю?



## Prompt:
31.10.2025, 19:35:00

> File: 

как  теперь?



## Response:
31.10.2025, 19:35:30

````plaintext
Thought process: Detected unchanged document, deliberated next steps forward.

Пользователь показывает мне обновленный документ с планом улучшений. Похоже, он хочет узнать, что я думаю о текущей версии плана. Дай-ка сравню с предыдущей версией...

Вроде бы это тот же самый документ, что он показывал раньше. Он спрашивает "как теперь?", возможно ожидая, что я увижу изменения, но документ выглядит идентично.

Может быть:
1. Он забыл обновить документ
2. Он хочет, чтобы я дал финальную оценку перед началом работы
3. Он спрашивает, с чего начать

Учитывая контекст (я только что дал обратную связь с ТОП-5 дополнений), скорее всего он хочет услышать:
- Подтверждение, что план готов к старту
- Конкретные шаги с чего начать
- Или указание, что нужно добавить мои рекомендации в документ

Буду честен и укажу, что документ не изменился, и предложу либо добавить мои рекомендации, либо сразу начать с первых шагов.
````

## 🤔 Наблюдение

Документ идентичен предыдущему — **не вижу изменений** после моей обратной связи.

---

## 🎯 Два варианта действий:

### Вариант А: Обновить план (рекомендую)

Добавь в документ ключевые пункты из моей обратной связи:

**В Этап 1 (перед п.1):**
```markdown
0) Подготовка к миграции
- Скрипт конверсии HabitLegacy → HabitV2 с dry-run режимом
- Добавить поле schemaVersion во все документы
- Backup механизм (экспорт всех данных пользователя)
```

**В Этап 1.5 (после AI-парсинга):**
```markdown
1.5) Offline-first стратегия
- Включить Firebase offline persistence
- Обработка конфликтов при синхронизации логов
- UI индикатор статуса синхронизации

1.6) Production уведомления
- PWA push notifications setup
- Permission flow + fallback на email
- Интеграция с Reminders
```

**В Этап 2 (после п.4):**
```markdown
5) Архивные привычки UI
- Страница просмотра archived habits с фильтрами
- Восстановление из архива + история изменений

6) AI мониторинг
- Логирование Gemini failures (quota/errors)
- Fallback при деградации AI (auto-switch на mock)
- Dashboard метрик парсинга
```

**В Поперечные задачи:**
```markdown
+ Security: rate limiting AI calls, XSS sanitization в reflection
+ Monitoring: Sentry integration, performance budget (LCP < 2.5s)
+ Batch operations: множественный выбор привычек (UI controls)
```

---

### Вариант Б: Начать сразу (если план утверждён)

Тогда стартуем **с Этапа 1, пункт 1** — типобезопасность:

**Первые 3 файла для рефакторинга:**

1. **`src/lib/habits-guards.ts`** (создать)
   - Type guards: `isHabitV2()`, `isHabitLegacy()`
   - Централизованный `toHabitV2()`

2. **`src/lib/types.ts`** (обновить)
   - Убрать `Habit` union, сделать явно `HabitLegacy | HabitV2`
   - Добавить discriminator поле

3. **`src/components/habit-tracker.tsx`** (рефакторинг)
   - Заменить все `as any` на guards
   - Использовать узкие типы после проверок

**Начать?** Или сначала дополнишь план?

---

## 💡 Мой совет

**Добавь хотя бы миграцию и offline в Этап 1** — это блокеры для production. Остальное можно отложить в Этап 2.

Что выбираешь: **А (дополнить план)** или **Б (начать рефакторинг)**?



## Prompt:
31.10.2025, 19:40:26

> File: 

а сейчас ?



## Response:
31.10.2025, 19:40:58

````plaintext
Thought process: Одобрил обновленный план и рекомендовал начать реализацию.

Отлично! Пользователь обновил план и добавил все ключевые пункты из моей обратной связи:

✅ Добавлено:
1. Миграция данных (1.1) - с версионированием, бэкапом, rollback
2. Offline-first (1.2) - с конфликт-резолвом
3. Production push notifications (1.3) - с fallback на email
4. Мониторинг (1.10) - Sentry, analytics, performance budget
5. Архив привычек (2.5)
6. Batch operations (2.6)
7. AI workflow детализация (2.7)
8. AI мониторинг (2.8)
9. Онбординг и templates (Этап 3)
10. Security добавлена в поперечные

План теперь production-ready и хорошо структурирован. Нужно дать позитивную оценку и предложить начать реализацию.
````

## 🎉 Отлично! План теперь production-ready

### ✅ Все критичные дополнения учтены:

**Добавлено из обратной связи:**
- ✅ Миграция + версионирование (1.1)
- ✅ Offline-first + конфликт-резолв (1.2)
- ✅ Production push + email fallback (1.3)
- ✅ Мониторинг/Sentry/Performance (1.10)
- ✅ Архив UI (2.5)
- ✅ Batch operations (2.6)
- ✅ AI workflow спецификация (2.7)
- ✅ AI monitoring (2.8)
- ✅ Onboarding + templates (Этап 3)
- ✅ Security в поперечных

### 💎 Что особенно сильно:

1. **Acceptance criteria** в каждом пункте — теперь ясно "когда готово"
2. **Rollback стратегия** в миграции — безопасность данных
3. **Offline idempotency** — по `(habitId, date)` — правильное решение
4. **AI фидбек-луп** — учёт правок пользователя улучшит точность
5. **Feature flags** — позволяют постепенный раскат

---

## 🚀 План оценка: **9.5/10**

### Минимальные улучшения (опционально):

**1. Этап 1.1 — Миграция:**
```diff
+ "Миграция триггерится: при входе (lazy), при редактировании (eager), 
+  или фоновая CF раз в сутки для неактивных"
```

**2. Этап 1.3 — Push notifications:**
```diff
+ "Graceful degradation: если FCM недоступен в браузере → 
+  показать инструкцию включения или предложить только email"
```

**3. Этап 1.10 — Monitoring:**
```diff
+ "Алерты: >5% AI failures, >3s LCP, >1% Firestore permission errors"
```

Но это нюансы — **план готов к реализации!**

---

## 🎯 Предлагаемый порядок выполнения Этапа 1:

### Неделя 1 (Foundation):
1. **1.4 Типобезопасность** (1-2 дня)
   - Создать `lib/habits-guards.ts`
   - Убрать все `as any`
   
2. **1.5 Валидация Zod** (1 день)
   - Схемы + `validateAndCreateHabitLog()`

3. **1.6 Firestore Rules** (1 день)
   - Правила + тесты

### Неделя 2 (Data & AI):
4. **1.1 Миграция** (2 дня)
   - Скрипт + бэкап механизм

5. **1.7 Стрики UI** (1 день)
   - Расчёт + бейдж

6. **1.8 AI парсинг** (2 дня)
   - Genkit setup + промпты

### Неделя 3 (Infrastructure):
7. **1.2 Offline-first** (2 дня)
   - Persistence + sync

8. **1.3 Push notifications** (2 дня)
   - FCM + CF + email fallback

9. **1.9 Insights** (1 день)
   - Real engine с флагом

10. **1.10 Monitoring** (1 день)
    - Sentry + analytics

---

## ❓ Готов начинать?

**Вариант A:** Начинаем с **1.4 Типобезопасность** (самое простое, база для остального)

**Вариант B:** Хочешь сначала что-то уточнить в плане

**Вариант C:** Нужна помощь с приоритизацией внутри Этапа 1

Что выбираешь?



## Prompt:
31.10.2025, 19:44:29

> File: 

проверь



## Response:
31.10.2025, 19:44:53

````plaintext
Thought process: Обнаружил откат к устаревшему плану без улучшений.

Пользователь снова прислал документ. Нужно проверить - это тот же документ что и в начале, или обновленный production-ready план из документа 3?

Сравниваю с документом 3 (production-ready):
- Документ 4 НЕ содержит: миграцию данных (1.1), offline-first (1.2), production push notifications (1.3), мониторинг (1.10), архив UI (2.5), batch operations (2.6), AI monitoring (2.8), onboarding
- Документ 4 это возврат к ИСХОДНОМУ плану, который я критиковал

То есть пользователь откатился к старой версии без моих улучшений. Мне нужно указать на это.
````

## ❌ Проблема: откат к старой версии

Ты отправил **исходный план** (без улучшений), а не production-ready версию из документа 3.

---

## 🔍 Что отсутствует (по сравнению с документом 3):

### Критичные блокеры для production:

**❌ 1.1 Миграция данных**
- Нет `schemaVersion`, адаптера v1→v2, rollback механизма

**❌ 1.2 Offline-first**
- Нет `enablePersistence`, конфликт-резолва, UI индикатора

**❌ 1.3 Production push notifications**
- Нет FCM setup, Cloud Functions, email fallback

**❌ 1.10 Мониторинг**
- Нет Sentry, performance budget, AI error logging

### Важные фичи:

**❌ 2.5 Архив привычек UI**
**❌ 2.6 Batch operations**
**❌ 2.8 AI мониторинг**

### Nice-to-have:

**❌ Onboarding wizard**
**❌ Templates marketplace**

---

## ⚠️ Почему это критично

**Без миграции (1.1):**
- Пользователи с HabitLegacy потеряют данные при обновлении

**Без offline (1.2):**
- Habit tracker бесполезен без интернета (основной use case)

**Без push (1.3):**
- Обещанные напоминания не работают в production

**Без monitoring (1.10):**
- Не увидишь когда что-то сломалось в prod

---

## 🎯 Два варианта:

### Вариант A: Использовать production-ready план (рекомендую)

Вернись к **документу 3** — он полный и готов к реализации.

### Вариант Б: Минимальный план (если нет ресурсов)

Добавь хотя бы в текущий Этап 1:

```markdown
1.1) Миграция: v1→v2 адаптер + rollback
1.2) Offline: enablePersistence + idempotency
1.10) Monitoring: Sentry + AI error logging
```

---

## ❓ Что делаем?

**A** - Используем полный production-ready план (документ 3)  
**B** - Дополняем текущий минимумом  
**C** - Идём с текущим планом (риск потери данных/багов в prod)

Выбирай вариант, и начнём реализацию!





---
Powered by [Claude Exporter](https://www.claudexporter.com)