# Habit Tracker 2.0 Module Requirements

**Module ID:** Module 13
**Total Functions:** 10 (4 core + 6 advanced stages)
**Priority:** HIGH
**Status:** ✅ Implemented 100% (All stages complete: Core, Stages 3-6)
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

### Function 13.5: Daily Reflection System - ✅ Complete (Stage 3, 100%)

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

**Implementation (November 16, 2025):**
- ✅ Updated DailyReflection type in `/src/lib/types/habit.ts`
- ✅ Created EmojiScaleInput component with visual 1-10 scale
- ✅ Created DailyReflectionDialog with mood/energy/stress/sleep/gratitude/notes
- ✅ Created reflection utilities (`/src/lib/reflections.ts`)
  - calculateReflectionStats() - averages, streaks, completion rate
  - getReflectionTrends() - trend data for charts
  - generateReflectionInsights() - AI-like insights from patterns
  - calculateCorrelation() - detect metric correlations
- ✅ Created ReflectionTrendsChart component with Recharts LineChart
- ✅ Integrated into dashboard with "Daily Reflection" button
- ✅ Automatic detection if user has reflected today
- ✅ Shows trends chart when reflections data exists
- **Actual effort:** ~2 hours (under estimate!)

---

### Function 13.6: Context Systems (Wheel of Life) - ✅ Complete (Stage 4, 100%)

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

**Implementation (November 16, 2025):**
- ✅ Created WeeklyContext type in `/src/lib/types/habit.ts`
- ✅ Created wheel-of-life.ts utilities (`/src/lib/wheel-of-life.ts`)
  - LIFE_DIMENSIONS and DIMENSION_INFO constants (8 dimensions with icons, colors, descriptions)
  - calculateBalanceScore() - calculates 0-100 balance score from standard deviation
  - getRadarChartData() - prepares data for radar chart visualization
  - generateContextInsights() - generates insights from balance scores and trends
  - getWeekStart() - utility to get Monday of current week
- ✅ Created DimensionSliderInput component (`/src/components/dimension-slider-input.tsx`)
  - 1-10 slider for each life dimension
  - Color-coded value display (red→yellow→blue→green)
  - Shows dimension icon, label, description
- ✅ Created WheelOfLifeAssessment dialog (`/src/components/wheel-of-life-assessment.tsx`)
  - 8 DimensionSliderInput components for all life dimensions
  - Accordion-based optional notes per dimension
  - Loads existing assessment for current week
  - Firestore integration with merge mode
- ✅ Integrated into dashboard (`/src/app/page.tsx`)
  - Added "Life Balance" button in header
  - Detects if user has assessed this week
  - Opens assessment dialog on click
- **Actual effort:** ~1.5 hours (significantly under 8-10h estimate!)

---

### Function 13.7: Context Visualization (Radar Chart) - ✅ Complete (Stage 4, 100%)

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
- Component: `WheelOfLifeChart` (`src/components/wheel-of-life-chart.tsx`)
- Recharts: `<RadarChart>`, `<PolarGrid>`, `<PolarAngleAxis>`, `<Radar>`
- Estimated effort: 4-6 hours / 5 story points

**Implementation (November 16, 2025):**
- ✅ Created WheelOfLifeChart component (`/src/components/wheel-of-life-chart.tsx`)
  - Recharts RadarChart with 8 axes (one per dimension)
  - 0-10 scale with PolarRadiusAxis
  - Current week shown as solid fill (primary color)
  - Previous week shown as dotted outline (comparison)
  - Custom tooltip showing dimension name, current/previous scores, and change
  - Balance score display (0-100) with color coding
  - Summary stats: Average score, strongest area, weakest area
  - Dimension breakdown grid with all 8 dimensions and week-over-week changes
  - Auto-generated insights from generateContextInsights()
- ✅ Integrated into dashboard (`/src/app/page.tsx`)
  - Chart displays when user has completed at least one assessment
  - Shows below Daily Reflection chart
  - Automatically compares with previous week if available
- **Actual effort:** ~1 hour (significantly under 4-6h estimate!)

---

### Function 13.8: AI Insights for Habits - ✅ Complete (Stage 5, 100%)

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
- AI Flow: `generateHabitInsights` (`src/ai/flows/habit-insights.ts`)
- API: `/api/ai/habit-insights` (POST)
- UI: Insights panel on Dashboard
- Estimated effort: 6-8 hours / 8 story points

**Implementation (November 16, 2025):**
- ✅ Created AI flow (`/src/ai/flows/habit-insights.ts`)
  - Input schema: habits, reflections (last 8 weeks), weeklyContexts (last 8 weeks)
  - Output schema: insights array (correlation, weak_spot, suggestion, timing, achievement) + summary
  - Mock fallback when AI unavailable
  - Retry logic (3 attempts with exponential backoff)
- ✅ Created API endpoint (`/src/app/api/ai/habit-insights/route.ts`)
  - POST request with userId + weeksBack parameters
  - Fetches habits, daily reflections, weekly contexts from Firestore
  - Calculates completion rates (last 30 days)
  - Usage limits check (daily quota)
  - 24-hour caching per user
- ✅ Created HabitInsightsPanel component (`/src/components/habit-insights-panel.tsx`)
  - 5 insight types with icons and color coding
  - Priority badges (high/medium/low)
  - Auto-load option on mount
  - Refresh button for manual reload
  - Shows summary + actionable recommendations
  - Displays generation timestamp and cache status
- ✅ Integrated into dashboard (`/src/app/page.tsx`)
  - Displays below Wheel of Life chart
  - Auto-loads when user has habits
  - Uses 8-week analysis window
- **Actual effort:** ~2 hours (significantly under 6-8h estimate!)

---

### Function 13.9: Claude Integration for Habit Analysis - ✅ Complete (Stage 6, 100%)

**Purpose:** Export habits + context to Claude for life coaching analysis.

**Workflow:**
1. User clicks "Export / Import" button → Claude Analysis tab
2. Generate YAML with:
   - All habits + completion rates (30d, 90d) + streaks
   - Daily reflections summary (last 30 days) + top gratitudes + recent entries
   - Weekly context scores (last 8 weeks) + balance score + trends
   - Embedded Claude life coach prompt
3. User downloads YAML and uploads to Claude → Claude provides personalized coaching
4. Claude analyzes data against 6-section framework (see claudePrompt below)

**YAML Structure:**
```yaml
meta:
  exportDate: "2025-11-17T12:00:00Z"
  purpose: "Claude Life Coach - Habit Analysis"
  period:
    habits: "All time"
    reflections: "Last 30 days"
    weeklyContext: "Last 8 weeks"

habits:
  - id: "habit1"
    name: "Morning Meditation"
    type: "duration"
    target: "15 min"
    completionRate30d: 85
    completionRate90d: 78
    currentStreak: 12
    longestStreak: 28
    tags: ["mindfulness", "morning"]
    priority: 1
    difficulty: "medium"

dailyReflections:
  summary:
    totalReflections: 25
    averageMood: 7.2
    averageEnergy: 6.8
    averageStress: 5.5
    averageSleepQuality: 7.0
    currentStreak: 8
    completionRate: 83
  topGratitudes:
    - "health"
    - "family"
    - "work progress"
  recentEntries:
    - date: "2025-11-16"
      mood: 8
      energy: 7
      stress: 4
      sleepQuality: 8
      gratitude: ["Good workout", "Quality time with family"]
      notes: "Felt productive today"

weeklyContext:
  latestWeek:
    weekStart: "2025-11-11"
    scores:
      fitness: 8
      career: 6
      relationships: 7
      growth: 5
      environment: 7
      fun: 4
      contribution: 6
      spirituality: 5
    balanceScore:
      overall: 72
      rating: "Good"
      weakestDimension: "fun"
      strongestDimension: "fitness"
      averageScore: 6.0
    notes:
      fun: "Need more leisure time"
      growth: "Started new online course"
  recentWeeks:
    - weekStart: "2025-11-11"
      fitness: 8
      career: 6
      # ... all dimensions

claudePrompt: |
  # Claude Life Coach - Habit Analysis Instructions

  You are an expert life coach and holistic wellness advisor. Analyze the provided habit tracking data and deliver a comprehensive, actionable coaching report.

  ## Your Analysis Should Include:

  1. Executive Summary (2-3 sentences)
  2. Habit Performance Analysis
  3. Wheel of Life Balance Assessment
  4. Daily Reflection Insights
  5. Holistic Recommendations (Prioritized)
  6. 4-Week Action Plan

  Be specific, data-driven, and actionable. Avoid generic advice.
```

**Implementation:**
- File: `src/lib/habits/export-claude.ts` (245 lines)
- Functions:
  - `exportHabitsForClaude(firestore, userId)`: Generates YAML export
  - `downloadClaudeAnalysisYAML(yamlContent)`: Triggers download
- UI: ExportDialog component, "Claude Analysis" tab
- Dependencies: `yaml` package for YAML serialization
- Data sources: habits, habitLogs, dailyReflections, weeklyContexts collections
- Completion: November 17, 2025
- Estimated: 4-6 hours / 5 story points | Actual: ~3 hours

---

### Function 13.10: Habit Import/Export (Backup) - ✅ Complete (Stage 6, 100%)

**Purpose:** Export/import habits for backup or sharing.

**Export:**
- Format: JSON (all habits + last N days of logs, configurable, default 90)
- Trigger: "Export / Import" button → "Backup Export" tab
- Download: `habits-backup-{date}.json`
- Schema: HabitsBackup v2.0 with metadata

**Import:**
- Upload JSON file (drag & drop or file picker)
- Real-time validation with Zod schema
- Shows validation errors with details if file is invalid
- Merge strategy:
  - **Habits:** Add new habits (skip duplicates by name, case-insensitive)
  - **Logs:** Add logs for imported habits (skip duplicates by habitId + date)
- Displays import results: habits added/skipped, logs added/skipped, errors

**HabitsBackup Schema:**
```typescript
{
  version: "2.0",
  exportDate: "2025-11-17T12:00:00Z",
  habits: [...], // All habits (HabitV2 or HabitLegacy)
  logs: [...],   // HabitLog[] for specified date range
  metadata: {
    totalHabits: 15,
    totalLogs: 1234,
    dateRange: {
      from: "2025-08-19",
      to: "2025-11-17"
    }
  }
}
```

**Validation:**
- Comprehensive Zod schemas for HabitV2, HabitLegacy, HabitLog
- Validates all fields, types, enums
- Returns detailed error messages with field paths
- Example errors: "habits.0.type: Invalid enum value", "logs.5.date: Required"

**Implementation:**
- File: `src/lib/habits/import-export.ts` (365 lines)
- Functions:
  - `exportHabitsJSON(firestore, userId, daysBack)`: Export to JSON
  - `downloadHabitsBackupJSON(backup)`: Trigger download
  - `validateHabitsBackup(json)`: Zod validation
  - `importHabitsJSON(firestore, userId, backup)`: Import with merge strategy
- UI: ExportDialog component with 3 tabs:
  - Tab 1: Claude Analysis (YAML export)
  - Tab 2: Backup Export (JSON export with configurable days)
  - Tab 3: Import Backup (file upload, validation, import)
- Dependencies: `zod` for validation, `date-fns` for date filtering
- Error handling: Try-catch with detailed error reporting
- Completion: November 17, 2025
- Estimated: 3-4 hours / 3 story points | Actual: ~2 hours

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
- Stage 3 (Function 13.5): ✅ Complete (10% of module)
- Stage 4 (Functions 13.6-13.7): ✅ Complete (20% of module)
- Stage 5 (Function 13.8): ✅ Complete (10% of module)
- Stage 6 (Functions 13.9-13.10): ❌ Not Started (20% of module)

**Recommended Implementation Order (for remaining 20%):**
1. ~~Function 13.5: Daily Reflection System~~ - ✅ DONE (Stage 3)
2. ~~Function 13.6: Context Systems~~ - ✅ DONE (Stage 4)
3. ~~Function 13.7: Context Visualization~~ - ✅ DONE (Stage 4)
4. ~~Function 13.8: AI Insights~~ - ✅ DONE (Stage 5)
5. Function 13.9: Claude Integration (4-6 hours / 5 story points) - Stage 6
6. Function 13.10: Import/Export (3-4 hours / 3 story points) - Stage 6

**Estimated Effort (Completed):**
- Stage 3: ~2 hours (vs 6-8h estimate) / 5 story points ✅
- Stage 4: ~2.5 hours (vs 12-16h estimate) / 13 story points ✅
- Stage 5: ~2 hours (vs 6-8h estimate) / 8 story points ✅
- **Total Completed:** ~6.5 hours / 26 story points

**Estimated Effort (Remaining):**
- Stage 6: 7-10 hours / 8 story points
- **Total Remaining:** 7-10 hours / 8 story points

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

**Last Updated:** November 16, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 80% Complete (Core + Stages 3-5 done, Stage 6 pending)
