# 📋 STAGE 4.2.2 - GEMINI AI ANALYTICS

**Цель:** Интеграция Gemini для автоматической аналитики и рекомендаций в реальном времени

**Время:** 8-12 часов  
**Статус:** Планирование  
**Предшествует:** Stage 4.2.1 ✅ (Export/Import Infrastructure)

---

## 🎯 ОБЩАЯ КОНЦЕПЦИЯ

### Два уровня AI:

1. **Gemini (в приложении)** - Быстрые инсайты
   - ⚡ Мгновенный анализ (2-5 сек)
   - 📊 Последние 2-4 недели данных
   - 🎯 Конкретные actionable советы
   - 💡 Автоматические прогрессии

2. **Claude (через Export)** ✅ УЖЕ РЕАЛИЗОВАНО
   - 🔬 Глубокий анализ (раз в месяц)
   - 📈 90 дней прошлого + 90 будущего
   - 🌐 Web research актуальных трендов
   - 📝 Подробные рекомендации в ZTL

---

## 📦 КОМПОНЕНТЫ STAGE 4.2.2

### **Фаза A: AI Flows & System Prompts** (3-4 часа)

#### A1. Genkit Flow: Quick Insights
**Файл:** `src/ai/flows/quick-insights.ts`

**Input:**
```typescript
{
  workoutLogs: WorkoutLog[];      // последние 14-28 дней
  activePrograms: Program[];
  userGoal?: string;
  timeframe: '2weeks' | '4weeks';
}
```

**Output:**
```typescript
{
  insights: Array<{
    type: 'positive' | 'warning' | 'recommendation';
    priority: 1 | 2 | 3;
    title: string;
    description: string;
    actionable: boolean;
    relatedProgram?: string;
  }>;
  summary: string;
  confidence: number;
}
```

**System Prompt:**
```
Ты - элитный тренер по силовым и кондиционным тренировкам с 15+ лет опыта.

СПЕЦИАЛИЗАЦИЯ:
- Evidence-based programming
- Progressive overload стратегии
- RPE-based training
- Periodization и восстановление
- Injury prevention

СТИЛЬ ОТВЕТОВ:
- Краткие и actionable (не более 2-3 предложений)
- Конкретные цифры и даты
- Избегай общих фраз
- Фокус на следующих 1-2 неделях

АНАЛИЗИРУЙ:
1. Тренды объема (растет/падает/стагнация)
2. RPE паттерны (перетренированность/недотренированность)
3. Progressive overload (есть/нет прогрессии)
4. Восстановление (пропуски, усталость)
5. Специфичные упражнения (сильные/слабые места)

ФОРМАТ ИНСАЙТОВ:
- Положительные: "Что идет хорошо + почему"
- Предупреждения: "Красные флаги + возможные последствия"
- Рекомендации: "Что изменить + как именно + когда"
```

---

#### A2. Genkit Flow: Progression Suggestions
**Файл:** `src/ai/flows/progression-suggestions.ts`

**Input:**
```typescript
{
  program: Program;
  recentWorkouts: WorkoutLog[];   // последние 3-6 тренировок
  exerciseHistory: {
    [exerciseId: string]: {
      sessions: Array<{
        date: string;
        sets: SetLog[];
        avgRPE: number;
        totalVolume: number;
      }>;
    };
  };
}
```

**Output:**
```typescript
{
  suggestions: Array<{
    exerciseId: string;
    exerciseName: string;
    currentWeight?: number;
    currentReps?: number;
    suggestedWeight?: number;
    suggestedReps?: number;
    reasoning: string;
    confidence: number;        // 0-100
    applyImmediately: boolean; // можно ли применить автоматически
  }>;
  globalRecommendation?: string;
}
```

**System Prompt:**
```
Ты - AI-система для автоматической прогрессии нагрузок в силовых тренировках.

ПРИНЦИПЫ PROGRESSIVE OVERLOAD:
1. Если все подходы выполнены с RPE ≤ 7.5: +2.5-5% веса
2. Если все подходы выполнены с RPE 8-9: сохранить вес
3. Если не все подходы выполнены ИЛИ RPE > 9: -5-10% веса
4. Приоритет: безопасность > прогрессия

ПРАВИЛА CONFIDENCE SCORE:
- 90-100: ≥5 последних тренировок, стабильные паттерны
- 70-89: 3-4 тренировки, умеренная вариабельность
- <70: недостаточно данных, большая вариабельность

ФОРМАТ REASONING:
"Последние N сессий: [краткая статистика]. [Рекомендация] потому что [обоснование]."

Пример: "Последние 5 сессий: 3x10 @ 100kg, RPE 7-7.5. Увеличить до 102.5kg потому что стабильно выполняешь все подходы с запасом."
```

---

### **Фаза B: Backend API Routes** (2-3 часа)

#### B1. API: Get Quick Insights
**Файл:** `src/app/api/ai/insights/route.ts`

```typescript
POST /api/ai/insights
Body: {
  userId: string;
  timeframe: '2weeks' | '4weeks';
}

Response: {
  insights: Insight[];
  summary: string;
  generatedAt: string;
  cacheUntil: string;  // кэш на 24 часа
}
```

**Логика:**
1. Fetch последние N дней workoutLogs из Firestore
2. Fetch active programs
3. Call Gemini flow с профессиональным промптом
4. Cache результат в Firestore (`aiInsights` коллекция)
5. Return structured data

---

#### B2. API: Get Progression Suggestions
**Файл:** `src/app/api/ai/progressions/route.ts`

```typescript
POST /api/ai/progressions
Body: {
  userId: string;
  programId: string;
}

Response: {
  suggestions: ProgressionSuggestion[];
  lastAnalyzed: string;
}
```

---

### **Фаза C: UI Components** (3-4 часа)

#### C1. AI Insights Card
**Файл:** `src/components/analytics/ai-insights-card.tsx`

**Расположение:** `/analytics` page

**UI Features:**
- Button "Get AI Insights" (первый раз)
- Loading state (spinner + "Analyzing your data...")
- Insights display:
  - Группировка по типу (positive/warning/recommendation)
  - Иконки для каждого типа
  - Приоритетная сортировка
  - Expandable детали
- Кнопка "Refresh" (если кэш старше 24 часов)
- Timestamp "Last updated: X hours ago"

**Примеры инсайтов:**
```
✅ POSITIVE
"Bench Press прогрессирует стабильно: +7.5kg за последние 4 недели"

⚠️ WARNING  
"Объем приседаний упал на 25% за неделю. Возможна недовосстановление."

💡 RECOMMENDATION
"Deadlift застопорился на 140kg × 5. Попробуй 5×3 @ 145kg на следующей неделе."
```

---

#### C2. Progression Suggestions Panel
**Файл:** `src/components/programs/progression-suggestions-panel.tsx`

**Расположение:** `/programs/[id]` page (внутри конкретной программы)

**UI Features:**
- Кнопка "Get AI Progressions"
- Табличный вид предложений:
  - Exercise name
  - Current → Suggested
  - Reasoning (hover tooltip)
  - Confidence badge
  - Apply button
- Bulk actions:
  - "Apply All High Confidence" (≥85%)
  - "Dismiss All"
- Confirmation dialog перед применением

**Apply Logic:**
```typescript
// Обновляет targetWeight в Program document
const updatedProgram = {
  ...program,
  workouts: program.workouts.map(w => ({
    ...w,
    cycles: w.cycles.map(c => ({
      ...c,
      exercises: c.exercises.map(e => 
        e.id === suggestion.exerciseId
          ? { ...e, targetWeight: suggestion.suggestedWeight }
          : e
      )
    }))
  }))
};

await updateDoc(programRef, updatedProgram);
```

---

### **Фаза D: Data Layer & Caching** (1-2 часа)

#### D1. Firestore Schema Extension

**Коллекция:** `users/{uid}/aiInsights`

```typescript
type AIInsightCache = {
  id: string;
  type: 'quick_insights' | 'progressions';
  data: any;
  timeframe?: string;
  programId?: string;
  generatedAt: Timestamp;
  expiresAt: Timestamp;
  tokensUsed: number;
};
```

**Правила:**
- Кэш на 24 часа для quick insights
- Кэш на 7 дней для progressions (обновляется только по запросу)
- Лимит: 10 запросов в день на пользователя

---

#### D2. Helper Functions
**Файл:** `src/lib/ai-helpers.ts`

```typescript
// Fetch последние N дней workouts
export async function getRecentWorkouts(
  userId: string,
  days: number
): Promise<WorkoutLog[]>;

// Агрегация по упражнениям
export async function getExerciseHistory(
  userId: string,
  programId: string
): Promise<ExerciseHistory>;

// Проверка кэша
export async function getCachedInsights(
  userId: string,
  type: 'quick_insights' | 'progressions'
): Promise<AIInsightCache | null>;
```

---

## 🔧 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Environment Variables
```bash
# .env.local
GOOGLE_GENAI_API_KEY=your-key-here
```

### Rate Limiting
- Gemini Free Tier: 15 req/min, 1500 req/day
- Наш лимит: 10 insights/day per user
- Хранить в Firestore: `users/{uid}/aiUsage`

```typescript
type AIUsage = {
  date: string;          // YYYY-MM-DD
  insightsCount: number;
  progressionsCount: number;
  tokensUsed: number;
};
```

### Error Handling
```typescript
try {
  const insights = await getQuickInsightsFlow(data);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    return { error: 'Daily limit reached. Try tomorrow.' };
  }
  if (error.code === 'INSUFFICIENT_DATA') {
    return { error: 'Need at least 2 weeks of training data.' };
  }
  // Fallback: return cached data if available
  const cached = await getCachedInsights(userId, 'quick_insights');
  return cached || { error: 'Analysis unavailable.' };
}
```

---

## 🎨 UX FLOW

### First Time User:
```
1. Open /analytics
2. See "Get AI Insights" button
3. Click → "Analyzing..." (5 sec)
4. Show 3-5 insights
5. Timestamp: "Updated just now"
```

### Returning User (within 24h):
```
1. Open /analytics
2. See cached insights immediately
3. Timestamp: "Updated 3 hours ago"
4. Button: "Refresh Insights" (greyed out if < 24h)
```

### Progression Flow:
```
1. Open /programs/my-program-id
2. Section: "AI Progression Suggestions"
3. Click "Analyze Program"
4. Show table with 5-10 suggestions
5. Review each suggestion
6. Click "Apply" on accepted suggestions
7. Confirmation: "Program updated for next workout"
```

---

## ✅ ACCEPTANCE CRITERIA

### Функциональные:
- [ ] Quick Insights генерируются за < 10 секунд
- [ ] Кэш работает (не вызываем API при повторном заходе)
- [ ] Progression Suggestions применяются корректно к программе
- [ ] Rate limiting работает (макс 10/день)
- [ ] Error handling для всех edge cases

### Качество AI:
- [ ] Инсайты конкретные (не "Train harder", а "Add 5kg to squat")
- [ ] Прогрессии безопасные (учитывают RPE, не предлагают скачки >10%)
- [ ] Confidence scores точные (высокий = реально можем применить)

### UX:
- [ ] Loading states везде
- [ ] Понятные error messages
- [ ] Timestamps и freshness indicators
- [ ] Confirmation перед apply

---

## 📊 МЕТРИКИ УСПЕХА

1. **Adoption Rate:** % пользователей, которые используют AI insights
2. **Application Rate:** % suggestions, которые пользователи apply
3. **Accuracy:** % applied suggestions, которые ведут к успешным тренировкам
4. **User Satisfaction:** Feedback на инсайты (thumbs up/down)

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Genkit flows протестированы локально
- [ ] API routes возвращают правильные структуры
- [ ] UI components responsive
- [ ] Firestore rules обновлены для `aiInsights` коллекции
- [ ] Environment variables установлены в production
- [ ] Rate limiting tested

---

## 🔮 FUTURE ENHANCEMENTS (Post-4.2.2)

1. **Персонализация промптов** по user preferences
2. **Trend visualization** в insights (графики)
3. **Push notifications** для важных warnings
4. **AI Chat** - Q&A о своих тренировках
5. **Gemini Vision** - анализ видео техники (Stage 5?)

---

## 🎯 ИТОГО

**Stage 4.2.2** завершает AI-driven аналитику:
- ✅ **4.2.1:** Export/Import + ZTL для Claude deep analysis
- 🚀 **4.2.2:** Gemini в приложении для quick insights
- 🔥 **Результат:** Полноценная AI-powered система рекомендаций

**Готов начинать реализацию!** 🏋️‍♂️
