# Habit Tracker 2.0 Module Requirements

**Module ID:** Module 13
**Total Functions:** 10 (4 core + 6 advanced stages)
**Priority:** HIGH
**Status:** 🟡 Implemented 40% (Core system complete, Stages 3-6 pending)
**Dependencies:** Data Management, UI Module, Analytics

---

## Overview

The Habit Tracker 2.0 module provides a comprehensive system for tracking habits beyond fitness workouts. The core system (40%) supports 4 habit types (daily check, weekly count, duration, yes/no), streak tracking, and swipeable logging interface. Advanced features (60%, Stages 3-6) include daily reflection, context systems (Wheel of Life), AI insights, and Claude integration.

Current implementation focuses on basic habit tracking. Future stages will add holistic life tracking, contextual insights, and AI-powered recommendations for habit formation and lifestyle balance.

**Key Innovation:**
- Multi-context tracking: Not just fitness, but sleep, nutrition, stress, relationships, career
- Wheel of Life visualization: Radar chart showing life balance across 8 dimensions
- AI-powered insights: Pattern detection and personalized suggestions
- Bidirectional Claude workflow: Export habits + context → Claude analyzes → Import recommendations

**Key Capabilities:**
- 4 habit types: Daily check, Weekly count, Duration tracking, Yes/No binary
- Swipeable interface for quick logging (mobile-optimized)
- Streak tracking with visual feedback (fire emoji, best streak)
- Firestore collections: `/habits`, `/habitLogs`
- Future (Stages 3-6): Daily Reflection, Context Systems, AI, Claude integration

**Integration Points:**
- **Data Management:** Firestore for habit storage
- **UI Module:** Swipeable cards, streak visualization
- **Analytics:** Habit completion trends, context balance charts
- **AI Integration:** Pattern detection, habit suggestions (Stage 5)

---

## Core Functions

### Function 13.1: Core Habit System - ✅ 100%

**Purpose:** Define and manage 4 types of habits.

**Habit Types:**

1. **Daily Check** - Binary completion (e.g., "Drink 2L water")
2. **Weekly Count** - Target count per week (e.g., "3 workouts/week")
3. **Duration** - Time-based (e.g., "30 min meditation")
4. **Yes/No** - Simple binary (e.g., "Did you track calories?")

**Data Model:**
```typescript
interface Habit {
  id: string;
  userId: string;
  name: string;
  type: 'daily' | 'weekly' | 'count' | 'duration';
  target?: number; // For count/duration types
  color?: string; // Visual identifier
  icon?: string; // lucide-react icon name
  createdAt: Timestamp;
  archivedAt?: Timestamp;
}
```

**Technical:**
- Files: `src/components/habit-card.tsx`, `src/lib/types/habit.ts`
- Firestore: `/habits/{habitId}`

---

### Function 13.2: Habit Logging - ✅ 100%

**Purpose:** Log daily habit completions.

**Logging:**
- One log per habit per day
- Store: Date, completion status, optional value (count/duration)
- Update: Can edit same-day logs

**Data Model:**
```typescript
interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: Timestamp; // Start of day (midnight)
  completed: boolean;
  value?: number; // For count/duration habits
  createdAt: Timestamp;
}
```

**Technical:**
- Files: `src/components/habit-logging.tsx`
- Firestore: `/habitLogs/{logId}`
- Query: `where('userId', '==', userId).where('date', '==', today)`

---

### Function 13.3: Streak Tracking - ✅ 100%

**Purpose:** Calculate and display habit streaks.

**Metrics:**
- Current streak: Consecutive days of completion
- Best streak: Longest historical streak
- Completion rate: % of days completed (last 30 days)

**Calculation:**
```typescript
const calculateStreak = (logs: HabitLog[]) => {
  const sorted = logs.sort((a, b) => b.date.seconds - a.date.seconds);
  let current = 0;
  let best = 0;
  let temp = 0;

  for (const log of sorted) {
    if (log.completed) {
      temp++;
      if (temp > best) best = temp;
    } else {
      if (temp > current) current = temp;
      temp = 0;
    }
  }

  return { current: Math.max(current, temp), best };
};
```

**Visual Feedback:**
- 🔥 Fire emoji + number (current streak)
- 🏆 Trophy emoji (new best streak)
- Progress bar (completion rate)

**Technical:**
- Component: `StreakDisplay` (`src/components/habit-streak.tsx`)

---

### Function 13.4: Swipeable Interface - ✅ 100%

**Purpose:** Mobile-optimized quick logging with swipe gestures.

**Gestures:**
- Swipe right: Mark complete ✅
- Swipe left: Mark incomplete ❌
- Tap: View details/edit

**Implementation:**
- Library: React swipeable hooks or custom touch handlers
- Visual feedback: Card slides, color change, haptic feedback (mobile)
- Animation: Smooth transitions (framer-motion)

**Technical:**
- Component: `SwipeableHabitCard` (`src/components/habit-swipeable.tsx`)
- Mobile: Touch events, `touchstart`, `touchmove`, `touchend`

---

### Function 13.5: Daily Reflection System - ❌ Not Started (Stage 3, 0%)

**Purpose:** End-of-day reflection prompts for holistic tracking.

**Prompts:**
1. **Mood**: Scale 1-10 (emoji selector)
2. **Energy**: Scale 1-10
3. **Stress**: Scale 1-10
4. **Sleep Quality**: Scale 1-10
5. **Gratitude**: Optional text (3 things)
6. **Notes**: Free-form daily journal

**Timing:**
- Trigger: Evening reminder (8-10 PM configurable)
- Optional: Can skip or complete next day

**Data Model:**
```typescript
interface DailyReflection {
  id: string;
  userId: string;
  date: Timestamp;
  mood: number; // 1-10
  energy: number;
  stress: number;
  sleepQuality: number;
  gratitude?: string[];
  notes?: string;
  createdAt: Timestamp;
}
```

**Technical:**
- New collection: `/dailyReflections/{reflectionId}`
- UI: Modal/sheet with emoji scale inputs
- Estimated effort: 6-8 hours / 5 story points

---

### Function 13.6: Context Systems (Wheel of Life) - ❌ Not Started (Stage 4, 0%)

**Purpose:** Multi-dimensional life tracking beyond habits.

**8 Life Contexts:**
1. **Fitness & Health** (workouts, sleep, nutrition)
2. **Career & Finance** (work satisfaction, income goals)
3. **Relationships & Social** (quality time, connections)
4. **Personal Growth** (learning, hobbies, creativity)
5. **Environment** (home, workspace organization)
6. **Fun & Recreation** (leisure, travel, entertainment)
7. **Contribution** (volunteering, helping others)
8. **Spirituality** (meditation, values alignment)

**Tracking:**
- Weekly self-assessment: Rate each dimension 1-10
- Optional: Add specific goals per dimension
- Trend tracking: See improvement over time

**Data Model:**
```typescript
interface WeeklyContext {
  id: string;
  userId: string;
  weekStart: Timestamp;
  contexts: {
    fitness: number;
    career: number;
    relationships: number;
    growth: number;
    environment: number;
    fun: number;
    contribution: number;
    spirituality: number;
  };
  notes?: Record<string, string>; // Optional notes per context
  createdAt: Timestamp;
}
```

**Technical:**
- New collection: `/weeklyContexts/{contextId}`
- UI: Slider inputs per dimension
- Estimated effort: 8-10 hours / 8 story points

---

### Function 13.7: Context Visualization (Radar Chart) - ❌ Not Started (Stage 4, 0%)

**Purpose:** Visualize life balance with Wheel of Life radar chart.

**Visualization:**
- Radar chart: 8 axes (one per context dimension)
- Scale: 0-10 (center to edge)
- Color: Gradient fill (low = red, high = green)
- Comparison: Overlay previous week (dotted line)

**Implementation:**
- Library: Recharts `RadarChart`
- Data: Latest `WeeklyContext` assessment
- Interactivity: Hover to see exact scores

**Technical:**
- Component: `WheelOfLifeChart` (`src/components/habit-wheel.tsx`)
- Recharts: `<RadarChart>`, `<PolarGrid>`, `<PolarAngleAxis>`, `<Radar>`
- Estimated effort: 4-6 hours / 5 story points

---

### Function 13.8: AI Insights for Habits - ❌ Not Started (Stage 5, 0%)

**Purpose:** AI-powered pattern detection and habit suggestions.

**Insights:**
1. **Correlation Detection**: "Mood is 30% higher on workout days"
2. **Weak Spots**: "Career satisfaction low for 3 weeks"
3. **Suggestions**: "Consider adding 'Morning walk' habit (improves energy)"
4. **Timing Optimization**: "Best compliance with habits logged before 10 AM"

**AI Flow:**
- Input: Habit logs, daily reflections, weekly contexts (last 8 weeks)
- AI: Gemini analyzes patterns
- Output: 3-5 actionable insights + recommendations

**Technical:**
- AI Flow: `habitInsightsFlow` (`src/ai/flows/habit-insights.ts`)
- API: `/api/ai/habit-insights` (POST)
- UI: Insights panel on Habits page
- Estimated effort: 6-8 hours / 8 story points

---

### Function 13.9: Claude Integration for Habit Analysis - ❌ Not Started (Stage 6, 0%)

**Purpose:** Export habits + context to Claude for life coaching analysis.

**Workflow:**
1. User clicks "Export for Claude Analysis"
2. Generate YAML with:
   - All habits + completion rates
   - Daily reflections (last 30 days)
   - Weekly context scores (last 8 weeks)
   - Embedded prompt for Claude (life coach persona)
3. User sends to Claude → Claude provides personalized advice
4. Optional: Import Claude's recommendations as new habits/goals

**YAML Structure:**
```yaml
habits_export:
  user_id: "abc123"
  export_date: "2025-11-15"

  habits:
    - name: "Morning Meditation"
      type: "daily"
      completion_rate: 0.85
      current_streak: 12
      best_streak: 28

  daily_reflections_summary:
    avg_mood: 7.2
    avg_energy: 6.8
    avg_stress: 5.5
    avg_sleep: 7.0

  weekly_contexts_latest:
    fitness: 8
    career: 6
    relationships: 7
    # ... other dimensions

  claude_prompt: |
    You are a certified life coach analyzing this user's habits and life balance.

    ANALYSIS CHECKLIST:
    1. Which life dimensions are thriving? Which need attention?
    2. Are there correlations between habits and mood/energy?
    3. Suggest 2-3 new habits to improve weak dimensions
    4. Recommend timing or frequency adjustments

    Provide specific, actionable advice.
```

**Technical:**
- Function: `exportHabitsForClaude()` (`src/lib/habits/export-claude.ts`)
- Button: Habits page header
- Estimated effort: 4-6 hours / 5 story points

---

### Function 13.10: Habit Import/Export (Backup) - ❌ Not Started (Stage 6, 0%)

**Purpose:** Export/import habits for backup or sharing.

**Export:**
- Format: JSON (all habits + last 90 days of logs)
- Trigger: Settings → Export Habits
- Download: `zenith-habits-{date}.json`

**Import:**
- Upload JSON file
- Validation: Check schema, prevent duplicates
- Merge: Add new habits, skip existing (by name)

**Technical:**
- Functions: `exportHabitsJSON()`, `importHabitsJSON()`
- Validation: Zod schema
- Estimated effort: 3-4 hours / 3 story points

---

## Module-Level Requirements

### Performance Requirements
- Habit list load: <500ms (20 habits + 30 days logs)
- Swipe gesture: <50ms response (immediate visual feedback)
- Streak calculation: <100ms (client-side)
- AI insights: <10s (Gemini API call)

### Security Requirements
- All data scoped to user (`userId` field)
- Firestore Security Rules: Same as other collections (user-only access)
- Daily reflections: Private (never shared)

### Accessibility Requirements
- Swipe gestures: Alternative button controls for non-touch devices
- Streak indicators: Accessible labels for screen readers
- Color-coding: Not sole indicator (use icons + text)

### Browser/Platform Support
- Mobile-first: Optimized for touch (swipe gestures)
- Desktop: Keyboard shortcuts (Space = toggle, Arrow keys = navigate)

---

## Implementation Notes

**Status:**
- Core System (Functions 13.1-13.4): ✅ Complete (40% of module)
- Advanced Features (Functions 13.5-13.10): ❌ Not Started (60% of module)

**Recommended Implementation Order (for remaining 60%):**
1. Function 13.5: Daily Reflection System (6-8 hours / 5 story points) - Stage 3
2. Function 13.6: Context Systems (8-10 hours / 8 story points) - Stage 4
3. Function 13.7: Context Visualization (4-6 hours / 5 story points) - Stage 4
4. Function 13.8: AI Insights (6-8 hours / 8 story points) - Stage 5
5. Function 13.9: Claude Integration (4-6 hours / 5 story points) - Stage 6
6. Function 13.10: Import/Export (3-4 hours / 3 story points) - Stage 6

**Estimated Effort (Remaining):**
- Stage 3: 6-8 hours / 5 story points
- Stage 4: 12-16 hours / 13 story points
- Stage 5: 6-8 hours / 8 story points
- Stage 6: 7-10 hours / 8 story points
- **Total Remaining:** 31-42 hours / 34 story points

**Technical Risks & Mitigation:**
- **Risk:** User fatigue from too many tracking inputs
  **Mitigation:** Make all advanced features optional, start with minimal viable tracking
- **Risk:** Wheel of Life assessment too time-consuming
  **Mitigation:** Quick mode (1-10 sliders, <2 min), detailed mode optional
- **Risk:** AI insights not actionable
  **Mitigation:** Structured prompts, validate output quality, user feedback loop

**Dependencies on External Factors:**
- Gemini API for habit insights (Stage 5)
- User adoption of daily reflection habit (engagement metric)

---

## Related Documentation

- [Data Management Requirements](./11_data_management_requirements.md)
- [AI Integration Requirements](./12_ai_integration_requirements.md)
- [Analytics Requirements](./09_analytics_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 40% Complete (Core done, Stages 3-6 pending)
