# Workout History Module Requirements

**Module ID:** Module 6
**Total Functions:** 4
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Workout Execution, Data Management

---

## Overview

The Workout History module provides comprehensive access to all completed workouts, enabling users to review past performance, track progression over time, and identify trends. This module transforms raw workout logs into actionable insights through visualizations, filtering, and detailed exercise-level analysis.

Historical data is the foundation for progression tracking and AI recommendations. By analyzing workout logs, users can see exactly how they've progressed on specific exercises, identify plateaus, and make data-driven decisions about programming changes.

**Key Capabilities:**
- Complete workout log history with filtering by date, exercise, program
- Exercise-specific performance history (every set of every workout for a given exercise)
- Progress visualizations with Recharts (LineChart, BarChart for volume/weight/reps over time)
- Calendar view showing training frequency and adherence patterns
- Manual exercise logging for non-planned workouts
- Detailed drill-down: workout → exercise → set level data

**Integration Points:**
- **Workout Execution:** Primary source of workout logs
- **Analytics:** Advanced visualizations of historical data
- **AI Integration:** Historical data fed to AI for recommendations
- **Program Management:** Track program adherence and cycle completion
- **Firestore:** `/workoutLogs/{logId}` collection for data retrieval

---

## Function 6.1: Workout Logs List

### User Story
**As a** user reviewing my training history
**I want to** see a chronological list of all completed workouts
**So that** I can review past sessions and track overall training volume

### Acceptance Criteria

**Scenario 1: View Workout History List**
- **Given** I have completed 20 workouts
- **When** I navigate to the Workout History page
- **Then** I see a chronological list (newest first) of all workouts
- **And** Each workout card shows:
  - Workout name: "Push Day A"
  - Date: "Nov 14, 2025"
  - Duration: "48:32"
  - Exercises completed: "5 exercises, 18 sets"
  - Total volume: "4,250 kg"
  - Program (if applicable): "Strength Q1 2025 - Week 2"

**Scenario 2: Pagination/Infinite Scroll**
- **Given** I have 100+ workout logs
- **When** I scroll to bottom of list
- **Then** Next 20 workouts load automatically (infinite scroll)
- **And** Loading indicator shows while fetching
- **And** "Load More" button as fallback if infinite scroll fails

**Scenario 3: Filter by Date Range**
- **Given** I am viewing all workouts
- **When** I select date range filter: "Nov 1 - Nov 15, 2025"
- **Then** Only workouts within that range are shown
- **And** Date range selector: Presets (Last 7 days, Last 30 days, Last 3 months) + Custom

**Scenario 4: Filter by Exercise**
- **Given** I want to see all workouts containing "Bench Press"
- **When** I type "Bench Press" in exercise filter
- **Then** Only workouts with Bench Press are shown
- **And** Card highlights exercise: "Bench Press: 4 sets"

**Scenario 5: Filter by Program**
- **Given** I completed workouts in multiple programs
- **When** I filter by "Strength Q1 2025"
- **Then** Only workouts from that program are shown
- **And** Program progress indicator: "12 of 48 workouts complete"

**Scenario 6: Empty State**
- **Given** No workouts have been completed yet
- **When** I navigate to history
- **Then** I see: "No workouts yet. Complete your first workout to see it here!"
- **And** "Start Workout" button to begin

### Technical Requirements

**Frontend:**
- Component: `WorkoutHistory`, `WorkoutLogCard`
- Location: `src/app/workout-history/page.tsx`
- Pagination: React Query with infinite scroll (fetchNextPage)
- Filtering: Client-side or Firestore query filters

**Backend:**
- Firestore Query: `collection('workoutLogs').where('userId', '==', uid).orderBy('startTime', 'desc').limit(20)`
- Composite Index: `userId + startTime` for efficient sorting
- Pagination: Use `startAfter` cursor for infinite scroll

**Data Fetching:**
```typescript
const useWorkoutLogs = (filters: WorkoutHistoryFilters) => {
  return useInfiniteQuery({
    queryKey: ['workoutLogs', filters],
    queryFn: async ({ pageParam }) => {
      let query = db.collection('workoutLogs')
        .where('userId', '==', currentUser.uid)
        .orderBy('startTime', 'desc')
        .limit(20);

      if (filters.dateRange) {
        query = query
          .where('startTime', '>=', filters.dateRange.start)
          .where('startTime', '<=', filters.dateRange.end);
      }

      if (filters.programId) {
        query = query.where('programId', '==', filters.programId);
      }

      if (pageParam) {
        query = query.startAfter(pageParam);
      }

      const snapshot = await query.get();
      return {
        logs: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
        nextCursor: snapshot.docs[snapshot.docs.length - 1]
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });
};
```

### UI Behavior

**Layout:**
- **Header:** Title "Workout History", filter controls (date range, exercise, program)
- **Workout List:** Vertical stack of workout cards
- **Card:** Compact summary with expand button for details
- **Loading:** Skeleton cards while fetching

**User Interactions:**
1. User navigates to history → Workouts load (20 most recent)
2. User scrolls down → More workouts load automatically
3. User applies filter → List updates instantly (or with loading state)
4. User clicks workout card → Expands to show exercise details

**UI States:**
- **Loading (initial):** Skeleton workout cards
- **Loading (pagination):** Spinner at bottom of list
- **Empty (no filters):** "No workouts yet" message
- **Empty (with filters):** "No workouts match your filters. Try different dates or exercises."
- **Error:** "Failed to load workouts. Retry?"

**Responsive:**
- Mobile: Single-column list, full-width cards
- Desktop: Single-column centered (max-width 800px)

### Error Handling

**System Errors:**
- Firestore query failure → "Failed to load workouts. Retry?"
- Network timeout → Auto-retry with exponential backoff

**Recovery:**
- Retry button for manual retry
- Cached workouts shown if available (stale-while-revalidate)

### Edge Cases

- **1000+ workouts:** Pagination handles efficiently (only loads 20 at a time)
- **Very long workout names:** Truncate with ellipsis
- **Filter with 0 results:** Show "No results" message with "Clear Filters" button

### Dependencies

**Requires:**
- Authentication
- Workout Execution (workouts must be completed first)

**Blocks:**
- None (history is read-only view)

**External Dependencies:**
- Firestore
- React Query (for infinite scroll)

### Testing Considerations

**Unit Tests:**
- Filtering logic (date range, exercise, program)
- Pagination cursor logic

**Integration Tests:**
- Firestore query with filters returns correct results
- Infinite scroll fetches next page

**E2E Tests:**
- Navigate to history → Verify workouts displayed
- Apply date filter → Verify filtered results
- Scroll to bottom → Verify more workouts load
- Click workout card → Verify details expand

---

## Function 6.2: Exercise Performance History

### User Story
**As a** user tracking progression on specific exercises
**I want to** view the complete history of a single exercise across all workouts
**So that** I can see exactly how I've progressed over time (weight, reps, volume)

### Acceptance Criteria

**Scenario 1: Access Exercise History**
- **Given** I am viewing a workout log containing "Bench Press"
- **When** I click on "Bench Press" exercise
- **Then** A detail modal opens showing:
  - Exercise name and details
  - Performance history: All past workouts with this exercise
  - Chart: Weight over time (LineChart)
  - Table: Date, Sets, Reps, Weight, Volume, RPE

**Scenario 2: Performance History Data**
- **Given** I performed Bench Press in 15 workouts over 3 months
- **When** I view Bench Press history
- **Then** I see table with 15 rows (one per workout):

  | Date | Sets | Best Set | Total Volume | Avg RPE |
  |------|------|----------|--------------|---------|
  | Nov 14 | 4 | 100kg x 10 | 3,900 kg | 8.2 |
  | Nov 11 | 4 | 97.5kg x 10 | 3,800 kg | 8.0 |
  | Nov 7 | 4 | 95kg x 10 | 3,700 kg | 7.8 |

- **And** I can sort by date, weight, volume, RPE

**Scenario 3: Progression Chart**
- **Given** I have 3 months of Bench Press data
- **When** I view the chart
- **Then** I see LineChart with:
  - X-axis: Date (time series)
  - Y-axis: Weight (kg) or Volume (kg) - toggleable
  - Line: Weight progression (100kg trend line)
  - Data points: Each workout (hover shows details)
- **And** Chart auto-scales to data range

**Scenario 4: Filter by Date Range**
- **Given** I have 6 months of data
- **When** I select "Last 3 months" filter
- **Then** Only workouts from last 3 months shown in table and chart
- **And** Chart re-renders with filtered data

**Scenario 5: Personal Records (PRs)**
- **Given** I have performed Bench Press multiple times
- **When** I view exercise history
- **Then** I see "Personal Records" section:
  - Best single set: "100kg x 12 reps (Nov 14)"
  - Highest volume workout: "4,250 kg (Nov 10)"
  - Max weight: "110kg (Oct 20)"
- **And** PRs highlighted in table (gold badge)

**Scenario 6: Set-Level Drill-Down**
- **Given** I am viewing Bench Press history table
- **When** I click "Nov 14" row
- **Then** Row expands to show all sets from that workout:
  - Set 1: 100kg x 12, RPE 8
  - Set 2: 100kg x 10, RPE 8.5
  - Set 3: 100kg x 9, RPE 9
  - Set 4: 100kg x 8, RPE 9.5
- **And** I can see exact progression within that workout

### Technical Requirements

**Frontend:**
- Component: `ExerciseHistoryModal`, `ExerciseProgressionChart`, `ExerciseHistoryTable`
- Charts: Recharts LineChart, BarChart
- Sorting: Client-side table sorting (lodash orderBy)

**Backend:**
- Firestore Query:
  ```javascript
  collection('workoutLogs')
    .where('userId', '==', uid)
    .where('exercises', 'array-contains', { exerciseId: 'bench-press' })
    .orderBy('startTime', 'desc')
  ```
- **Note:** This requires denormalization (store exerciseIds array) OR client-side filtering

**Alternative (Client-Side Filtering):**
```typescript
const getExerciseHistory = (workoutLogs: WorkoutLog[], exerciseId: string) => {
  return workoutLogs
    .filter(log => log.exercises.some(ex => ex.exerciseId === exerciseId))
    .map(log => {
      const exercise = log.exercises.find(ex => ex.exerciseId === exerciseId)!;
      return {
        date: log.startTime.toDate(),
        sets: exercise.sets,
        bestSet: findBestSet(exercise.sets), // Highest weight × reps
        totalVolume: exercise.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0),
        avgRPE: exercise.sets.reduce((sum, s) => sum + (s.rpe || 0), 0) / exercise.sets.length
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};
```

**Chart Data:**
```typescript
const chartData = exerciseHistory.map(entry => ({
  date: format(entry.date, 'MMM dd'),
  weight: entry.bestSet.weight,
  volume: entry.totalVolume,
  rpe: entry.avgRPE
}));
```

### UI Behavior

**Layout:**
- **Modal:** Fullscreen on mobile, large modal on desktop (max-width 1000px)
- **Header:** Exercise name, muscle groups, equipment
- **Tabs:** "Chart", "Table", "Personal Records"
- **Chart Tab:** LineChart (default), toggle: Weight / Volume / RPE
- **Table Tab:** Sortable table with expandable rows

**User Interactions:**
1. User clicks exercise in workout log → History modal opens
2. User views chart → Toggles metric (weight/volume)
3. User switches to table → Sorts by date or weight
4. User clicks table row → Expands to show sets

**UI States:**
- **Loading:** Skeleton chart + table rows
- **Success:** Chart and table populated
- **Empty:** "No history for this exercise yet"
- **Error:** "Failed to load exercise history. Retry?"

**Responsive:**
- Mobile: Fullscreen modal, chart full-width, table horizontal scroll
- Desktop: Large centered modal, chart side-by-side with stats

### Error Handling

**System Errors:**
- Firestore query failure → "Failed to load exercise history. Retry?"
- Chart rendering error → Fallback to table view only

**Recovery:**
- Retry button
- Graceful degradation (show table if chart fails)

### Edge Cases

- **Single workout for exercise:** Chart shows single data point
- **Very many workouts (100+):** Chart may be crowded → Add date range filter
- **Missing RPE data:** Show "N/A" in table, exclude from RPE chart

### Dependencies

**Requires:**
- Workout logs exist
- Exercise performed at least once

**Blocks:**
- Analytics (uses similar data)

**External Dependencies:**
- Recharts
- date-fns (for date formatting)

### Testing Considerations

**Unit Tests:**
- Exercise history filtering logic
- Best set calculation
- Volume calculation

**Integration Tests:**
- Fetch workouts → Filter by exercise → Verify correct data

**E2E Tests:**
- View workout → Click exercise → Verify history modal opens
- Toggle chart metric → Verify chart updates
- Sort table → Verify order changes

---

## Function 6.3: Progress Charts (Volume, Weight, Reps Over Time)

### User Story
**As a** user tracking long-term progression
**I want to** see visualizations of my volume, weight, and rep progression over time
**So that** I can identify trends, plateaus, and make informed training decisions

### Acceptance Criteria

**Scenario 1: Total Volume Chart**
- **Given** I have completed 30 workouts over 3 months
- **When** I navigate to the "Progress" tab in history
- **Then** I see a LineChart showing total volume (kg) over time
- **And** X-axis: Dates (Nov 1, Nov 8, Nov 15, ...)
- **And** Y-axis: Total volume (kg)
- **And** Trend line shows overall progression (moving average)

**Scenario 2: Exercise-Specific Weight Progression**
- **Given** I select "Bench Press" from exercise dropdown
- **When** Chart updates
- **Then** I see weight progression specifically for Bench Press
- **And** Each data point represents best set weight from that workout
- **And** I can hover over points to see details: "Nov 14: 100kg x 10"

**Scenario 3: Reps Progression (For Bodyweight/Fixed Weight Exercises)**
- **Given** I track "Pull-ups" (bodyweight exercise)
- **When** I select "Pull-ups" and metric "Reps"
- **Then** Chart shows total reps over time
- **And** Useful for tracking volume on bodyweight exercises

**Scenario 4: Multiple Metrics Comparison**
- **Given** I want to see weight vs. RPE correlation
- **When** I enable "Show RPE" overlay
- **Then** Chart shows dual Y-axes:
  - Left axis: Weight (kg)
  - Right axis: RPE (1-10)
- **And** I can see if weight increases correlate with RPE increases

**Scenario 5: Date Range Selection**
- **Given** I have 12 months of data
- **When** I select "Last 3 months"
- **Then** Chart zooms to show only last 3 months
- **And** Y-axis rescales to fit data range

**Scenario 6: Export Chart Data**
- **Given** I am viewing a chart
- **When** I click "Export CSV"
- **Then** CSV file downloads with:
  - Columns: Date, Exercise, Weight, Reps, Volume, RPE
  - Rows: One per data point
- **And** Useful for external analysis (Excel, Google Sheets)

### Technical Requirements

**Frontend:**
- Component: `ProgressCharts`, `VolumeChart`, `WeightProgressionChart`
- Charts: Recharts (LineChart, BarChart, AreaChart)
- Data: Aggregated from workout logs

**Recharts Implementation:**
```typescript
const VolumeChart = ({ workoutLogs }: { workoutLogs: WorkoutLog[] }) => {
  const data = workoutLogs.map(log => ({
    date: format(log.startTime.toDate(), 'MMM dd'),
    volume: calculateTotalVolume(log),
    avgRPE: calculateAvgRPE(log)
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: 'Volume (kg)', angle: -90 }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg RPE', angle: 90 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#8884d8" name="Volume" />
        <Line yAxisId="right" type="monotone" dataKey="avgRPE" stroke="#82ca9d" name="Avg RPE" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**Volume Calculation:**
```typescript
const calculateTotalVolume = (workoutLog: WorkoutLog) => {
  return workoutLog.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exerciseTotal, set) => {
      return exerciseTotal + (set.weight * set.reps);
    }, 0);
  }, 0);
};
```

### UI Behavior

**Layout:**
- **Progress Tab:** Within Workout History or separate page
- **Filters:** Date range, exercise selector, metric toggle (Volume/Weight/Reps/RPE)
- **Chart:** Large (min 400px height), responsive
- **Legend:** Below chart, shows metrics

**User Interactions:**
1. User navigates to Progress → Default chart loads (total volume, last 3 months)
2. User selects different metric → Chart updates
3. User selects exercise → Chart filters to that exercise
4. User hovers data point → Tooltip shows details

**UI States:**
- **Loading:** Skeleton chart
- **Success:** Chart rendered with data
- **Empty:** "No data for selected filters"
- **Error:** "Failed to load chart data. Retry?"

**Responsive:**
- Mobile: Full-width chart, vertical scroll for multiple charts
- Desktop: Side-by-side charts (Volume + Weight)

### Error Handling

**System Errors:**
- Chart rendering error → Fallback to table view with message
- Data calculation error → Show error: "Failed to calculate volume. Data may be corrupted."

**Recovery:**
- Retry button
- Fallback to raw data table

### Edge Cases

- **No workouts in date range:** Show empty state
- **Single data point:** Chart shows single point (no line)
- **Very large volume (100,000kg+):** Format with commas (100,000 kg)

### Dependencies

**Requires:**
- Workout logs exist

**Blocks:**
- Analytics (similar visualizations)

**External Dependencies:**
- Recharts
- date-fns

### Testing Considerations

**Unit Tests:**
- Volume calculation
- Data aggregation for charts

**Integration Tests:**
- Fetch workouts → Aggregate data → Verify chart data correct

**E2E Tests:**
- Navigate to Progress → Verify chart rendered
- Select date range → Verify chart updates
- Hover data point → Verify tooltip shows

---

## Function 6.4: Calendar View (Training Frequency & Adherence)

### User Story
**As a** user tracking training consistency
**I want to** see a monthly calendar view of my workouts
**So that** I can visualize training frequency, rest days, and adherence to my program

### Acceptance Criteria

**Scenario 1: Monthly Calendar View**
- **Given** I am viewing workout history
- **When** I switch to "Calendar" view
- **Then** I see a monthly calendar (current month by default)
- **And** Each day shows:
  - Workout indicator (colored dot or icon) if workout completed
  - Rest day (no indicator)
  - Planned workout (outline if from program but not completed)

**Scenario 2: Workout Indicators**
- **Given** November 2025 calendar is displayed
- **When** I see the calendar
- **Then** Days with workouts have indicators:
  - Green dot: Workout completed as planned
  - Blue dot: Workout completed (not from program)
  - Yellow outline: Planned workout (from program), not yet completed
  - Gray: Rest day
- **And** I can see at a glance training frequency (e.g., 4 workouts/week)

**Scenario 3: Click Day for Details**
- **Given** I click November 14 (day with workout)
- **When** Day is clicked
- **Then** Popover shows:
  - Workout name: "Push Day A"
  - Duration: "48:32"
  - Volume: "4,250 kg"
  - "View Details" button → Opens full workout log
- **When** I click rest day (no workout)
- **Then** No popover (or "Rest Day" message)

**Scenario 4: Navigate Months**
- **Given** I am viewing November 2025
- **When** I click "Previous Month" arrow
- **Then** Calendar shows October 2025
- **And** Workout indicators update to October workouts
- **When** I click "Next Month"
- **Then** Calendar shows December 2025

**Scenario 5: Training Frequency Stats**
- **Given** I completed 16 workouts in November (30 days)
- **When** I view November calendar
- **Then** I see stats below calendar:
  - "16 workouts this month"
  - "Training frequency: 3.7 days/week"
  - "Rest days: 14"
  - "Adherence: 100%" (if all planned workouts completed)

**Scenario 6: Adherence Tracking (Program vs. Actual)**
- **Given** I have a program scheduled for November with 16 planned workouts
- **When** I completed 14 of them
- **Then** Calendar shows:
  - 14 green dots (completed planned workouts)
  - 2 yellow outlines (missed planned workouts)
- **And** Adherence stat: "Adherence: 87.5% (14/16)"

### Technical Requirements

**Frontend:**
- Component: `WorkoutCalendar`
- Calendar: Custom React component or library (react-calendar, @fullcalendar)
- Data: Workout logs grouped by date

**Backend:**
- Firestore Query: Fetch all workouts for selected month
  ```javascript
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  collection('workoutLogs')
    .where('userId', '==', uid)
    .where('startTime', '>=', startOfMonth)
    .where('startTime', '<=', endOfMonth)
    .get();
  ```

**Calendar Data Structure:**
```typescript
interface CalendarDay {
  date: Date;
  workouts: WorkoutLog[]; // Workouts on this day (can be multiple)
  plannedWorkouts?: { workoutId: string, workoutName: string }[]; // From program
  status: 'completed' | 'planned' | 'rest';
}
```

**Adherence Calculation:**
```typescript
const calculateAdherence = (plannedWorkouts: number, completedWorkouts: number) => {
  if (plannedWorkouts === 0) return null; // No program
  return Math.round((completedWorkouts / plannedWorkouts) * 100);
};
```

### UI Behavior

**Layout:**
- **Calendar Grid:** 7 columns (Sun-Sat), ~5 rows (weeks)
- **Day Cell:** Shows date (1-31), workout indicator (dot/icon)
- **Stats Panel:** Below calendar, shows frequency and adherence
- **Navigation:** Month/Year selector, prev/next arrows

**User Interactions:**
1. User switches to Calendar view → Current month loads
2. User sees workout indicators on days
3. User clicks day → Popover with workout details
4. User navigates to previous/next month → Calendar updates

**UI States:**
- **Loading:** Skeleton calendar cells
- **Success:** Calendar rendered with indicators
- **Empty Month:** "No workouts this month"
- **Error:** "Failed to load calendar. Retry?"

**Responsive:**
- Mobile: Compact calendar, smaller cells, full-screen popover
- Desktop: Standard calendar, hover shows preview, click shows details

### Error Handling

**System Errors:**
- Firestore query failure → "Failed to load calendar. Retry?"

**Recovery:**
- Retry button
- Cached calendar data (stale-while-revalidate)

### Edge Cases

- **Multiple workouts same day:** Show indicator count (e.g., "2 workouts")
- **Very long month (31 days):** Grid adjusts to fit
- **No program (no planned workouts):** Adherence stat hidden

### Dependencies

**Requires:**
- Workout logs exist

**Blocks:**
- None (calendar is visualization)

**External Dependencies:**
- react-calendar (or custom implementation)
- date-fns

### Testing Considerations

**Unit Tests:**
- Adherence calculation
- Day status determination (completed/planned/rest)

**Integration Tests:**
- Fetch workouts for month → Verify calendar data correct

**E2E Tests:**
- Navigate to Calendar → Verify current month displayed
- Click day with workout → Verify popover shows workout details
- Navigate to previous month → Verify calendar updates

---

## Module-Level Requirements

### Performance Requirements
- Workout list load: <1.5s (initial 20 workouts)
- Pagination: <500ms (next page load)
- Exercise history modal: <1s (fetch + render)
- Charts: <1s (data aggregation + render)
- Calendar view: <1s (month of workouts)

### Security Requirements
- User can only access their own workout logs
- Firestore Security Rules:
  ```javascript
  match /workoutLogs/{logId} {
    allow read: if request.auth.uid == resource.data.userId;
  }
  ```

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Tab through workout cards, Enter to expand
- Screen reader: Announces workout details, chart data, calendar events
- Chart accessibility: Data table fallback for screen readers

### Browser/Platform Support
- All modern browsers
- Responsive: Works on mobile (calendar may be horizontal scroll), tablet, desktop
- Charts: Recharts supports all modern browsers

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 6.1: Workout Logs List (foundation - get data displayed)
2. Function 6.3: Progress Charts (visualizations)
3. Function 6.2: Exercise Performance History (deep-dive analysis)
4. Function 6.4: Calendar View (alternative visualization)

**Estimated Effort:**
- Function 6.1: 6-8 hours / 5 story points
- Function 6.2: 6-8 hours / 5 story points (complex filtering + modal)
- Function 6.3: 6-8 hours / 5 story points (chart implementation)
- Function 6.4: 5-7 hours / 5 story points (calendar logic)
- **Total Module Estimate:** 23-31 hours / 20 story points

**Technical Risks & Mitigation:**
- **Risk:** Firestore query performance with large datasets (1000+ workouts)
  **Mitigation:** Pagination (20 per page), composite indexes, client-side caching
- **Risk:** Chart rendering performance with many data points
  **Mitigation:** Date range filters to limit data, Recharts optimization (max 100 points)
- **Risk:** Exercise filtering without index (array-contains on nested field)
  **Mitigation:** Client-side filtering (acceptable for <1000 workouts), or denormalize exerciseIds

**Dependencies on External Factors:**
- Firestore query limits (max 100 docs recommended per query for performance)
- Recharts library stability (generally stable)
- Browser localStorage for offline caching

---

## Related Documentation

- [Architecture - Data Model](../core/04_ARCHITECTURE.md#data-model)
- [Workout Execution Requirements](./05_workout_execution_requirements.md)
- [Analytics Requirements](./11_analytics_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development
