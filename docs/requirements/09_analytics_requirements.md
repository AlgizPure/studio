# Analytics Module Requirements

**Module ID:** Module 9
**Total Functions:** 7
**Priority:** HIGH
**Status:** 🟡 Implemented 95% (Advanced visualizations 60%)
**Dependencies:** Workout History, Data Management

---

## Overview

The Analytics module transforms raw workout data into actionable insights through advanced visualizations and statistical analysis. Using Recharts library, it provides volume tracking, progression curves, exercise-specific analytics, and AI-compatible data exports.

Current implementation (95%) includes core analytics: volume tracking, basic charts, weekly/monthly reports, RPE analysis, and ZTL export for Claude analysis. Advanced visualizations (Stage 4.3) - heatmaps, radar charts, volume distribution - are partially implemented (60%).

**Key Capabilities:**
- Volume tracking over time (total kg lifted per workout/week/month)
- Progress visualizations (LineChart, BarChart, AreaChart via Recharts)
- Exercise-specific progression analysis (weight, reps, volume trends)
- Weekly/monthly aggregate reports (total volume, workouts, adherence)
- RPE analytics (average RPE, intensity distribution)
- ZTL export for Claude AI analysis (program + performance data)
- Advanced visualizations (partial): heatmaps (muscle group volume), radar charts (balance), volume distribution

**Integration Points:**
- **Workout History:** Primary data source (workout logs)
- **ZTL Module:** Export formatted for AI analysis
- **AI Integration:** Analytics feed AI recommendation engine
- **Recharts:** Visualization library

---

## Core Functions

### Function 9.1: Volume Tracking

**Purpose:** Calculate and visualize total training volume (weight × reps × sets) over time.

**Key Requirements:**
- Aggregate volume: Per workout, per week, per month
- Trend line: Moving average (7-day, 30-day)
- Filters: Date range, exercise, muscle group, program
- Chart: LineChart (X: Date, Y: Volume kg)

**Calculation:**
```typescript
const calculateVolume = (workoutLog: WorkoutLog) => {
  return workoutLog.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => {
      return exTotal + (set.weight * set.reps);
    }, 0);
  }, 0);
};
```

**Technical:**
- Component: `VolumeChart` (`src/app/analytics/page.tsx`)
- Charts: Recharts LineChart, AreaChart

---

### Function 9.2: Progress Visualizations

**Purpose:** Visual representation of progression using Recharts library.

**Chart Types:**
1. **LineChart:** Weight/volume over time (trend analysis)
2. **BarChart:** Weekly volume comparison
3. **AreaChart:** Volume accumulation (stacked for muscle groups)

**Key Requirements:**
- Responsive charts (full-width, min 400px height)
- Interactive: Hover tooltips with details
- Legends: Show/hide data series
- Export: PNG/SVG download (future)

**Technical:**
- Library: Recharts 2.15.1
- Components: `LineChart`, `BarChart`, `AreaChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- Data: Aggregated from workout logs

---

### Function 9.3: Exercise-Specific Analytics

**Purpose:** Deep-dive analysis for individual exercises (see Workout History Function 6.2 for detailed requirements).

**Key Requirements:**
- Performance history: All workouts containing exercise
- Progression chart: Weight over time for best set
- Volume chart: Total volume per workout
- Personal records: Best weight, best volume, most reps
- Set-level drill-down

**Technical:**
- Component: `ExerciseAnalytics`
- Data: Filter workout logs by `exerciseId`

---

### Function 9.4: Weekly/Monthly Reports

**Purpose:** Aggregate statistics for time periods.

**Key Requirements:**
- Weekly report: Total workouts, volume, avg duration, adherence %
- Monthly report: Same metrics aggregated monthly
- Comparison: Week-over-week, month-over-month changes
- Export: PDF/CSV (future)

**Metrics:**
- Total workouts completed
- Total volume (kg)
- Average workout duration
- Average RPE
- Adherence % (completed vs. planned)
- Rest days

**Technical:**
- Component: `WeeklyReport`, `MonthlyReport`
- Aggregation: Group by week/month using date-fns

---

### Function 9.5: ZTL Export for Claude Analysis

**Purpose:** Export program with performance data for AI analysis (see ZTL Function 8.4).

**Key Requirements:**
- Export format: ZTL YAML with `performance_data` section
- Includes: Completed workouts, actual sets/reps/weight, volume, feedback
- Embedded AI prompt: Guides Claude analysis
- Download: YAML file

**Technical:**
- Files: `src/lib/ztl/export-full-analysis.ts`
- See ZTL Module for full specification

---

### Function 9.6: RPE Analytics

**Purpose:** Analyze training intensity via Rate of Perceived Exertion data.

**Key Requirements:**
- Average RPE: Overall, per exercise, per workout, per week
- RPE distribution: Histogram (how many sets at each RPE level)
- RPE trend: LineChart showing avg RPE over time (detect overtraining)
- Correlation: RPE vs. volume (higher volume = higher RPE?)

**Technical:**
- Component: `RPEAnalytics`
- Charts: LineChart (trend), BarChart (distribution)
- Calculations: Average RPE from sets with RPE data (optional field)

---

### Function 9.7: Advanced Visualizations (Stage 4.3, 60% Complete)

**Purpose:** Complex visualizations for deep insights.

**Planned Visualizations:**
1. **Heatmap (Muscle Group Volume):**
   - X: Week, Y: Muscle group, Color: Volume
   - Shows distribution of training across muscle groups
   - Identifies weak points (undertrained muscles)

2. **Radar Chart (Training Balance):**
   - Axes: Muscle groups (Chest, Back, Legs, Shoulders, Arms, Core)
   - Shows balance: Ideal = even distribution
   - Identifies imbalances

3. **Volume Distribution (Pie/Donut Chart):**
   - Breakdown: Push vs. Pull vs. Legs volume
   - Helps ensure balanced programming

**Current Status:**
- Heatmap: 60% (data aggregation done, visualization partial)
- Radar Chart: 40% (data structure defined, chart not implemented)
- Volume Distribution: 70% (basic pie chart implemented)

**Technical:**
- Libraries: Recharts (RadarChart, PieChart), recharts-heatmap (custom)
- Data: Complex aggregation by muscle group and week

---

## Module-Level Requirements

### Performance Requirements
- Analytics page load: <2s (initial data fetch + chart render)
- Chart interaction (hover, zoom): <50ms response time
- Data aggregation: <1s for 100 workouts
- Export: <3s for full ZTL with performance data

### Security Requirements
- User can only view their own analytics
- Firestore rules enforce user isolation

### Accessibility Requirements
- Charts: Data table fallback for screen readers
- Keyboard navigation: Tab through filters, Enter to apply
- Color contrast: WCAG AA compliant chart colors

### Browser/Platform Support
- All modern browsers (Recharts supports IE11+)
- Responsive: Mobile (vertical scroll), desktop (side-by-side charts)

---

## Implementation Notes

**Recommended Implementation Order:**
1. Functions 9.1-9.5: ✅ Complete (95%)
2. Function 9.6: ✅ Complete (RPE analytics)
3. Function 9.7: 🟡 In Progress (complete heatmap, radar chart, volume distribution)

**Estimated Effort (Remaining):**
- Function 9.7 (complete): 10-15 hours / 10 story points

**Technical Risks & Mitigation:**
- **Risk:** Chart rendering performance with 1000+ data points
  **Mitigation:** Date range filters, limit to 100 points max, aggregation
- **Risk:** Complex data aggregation (muscle group mapping)
  **Mitigation:** Pre-compute and cache, use memoization

**Dependencies on External Factors:**
- Recharts library updates (generally stable)
- Browser canvas/SVG performance (for complex charts)

---

## Related Documentation

- [Workout History Requirements](./06_workout_history_requirements.md)
- [ZTL Module Requirements](./08_ztl_requirements.md)
- [AI Integration Requirements](./11_ai_integration_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 95% Complete (Stage 4.3 in progress)
