# Schedule & Planning Module Requirements

**Module ID:** Module 7
**Total Functions:** 4
**Priority:** HIGH
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Program Management, Workout Builder

---

## Overview

The Schedule & Planning module provides a weekly calendar interface for organizing and visualizing training schedules. Users can view upcoming workouts from active programs, manually assign workouts to specific days, and manage rest days. This module acts as the central hub for workout planning and execution initiation.

Integration with Program Management automatically populates the schedule based on programmed workouts, while allowing flexibility for manual adjustments. The calendar view provides quick access to start workouts, ensuring seamless transition from planning to execution.

**Key Capabilities:**
- 7-day weekly schedule view with workout assignments
- Program workout auto-population based on active programs
- Manual workout assignment for flexible training
- Rest day configuration and tracking
- Schedule adjustments (move workouts, skip days, modify assignments)

**Integration Points:**
- **Program Management:** Scheduled programs populate calendar automatically
- **Workout Builder:** Manual workout selection for unscheduled days
- **Workout Execution:** Launch point for starting workouts
- **Firestore:** Program schedules stored in `/programs/{programId}` with calendar assignments

---

## Core Functions

### Function 7.1: Weekly Schedule View

**Purpose:** Display 7-day calendar (Mon-Sun or user-configured start day) showing assigned workouts and rest days.

**Key Requirements:**
- Calendar grid: 7 columns (days), rows for each workout slot
- Each day cell shows: Date, assigned workout name (if any), "Rest Day" label (if no workout)
- Current day highlighted
- Navigation: Previous/Next week arrows
- Quick actions: "Start Workout" button on each assigned day

**Technical:**
- Component: `WeeklySchedule` (`src/app/schedule/page.tsx`)
- Data source: Active programs + manual assignments
- Date calculations: date-fns library

**UI Behavior:**
- Mobile: Vertical scroll (single-column daily view)
- Desktop: 7-column grid
- Touch-friendly: Large day cells (min 120px height)

---

### Function 7.2: Program Workout Auto-Assignment

**Purpose:** Automatically populate schedule with workouts from active programs based on programmed dates.

**Key Requirements:**
- When program is scheduled (start date set), workouts appear on calendar
- Program workouts displayed with program badge (e.g., "Strength Q1 - Week 2")
- Multi-program support: Multiple programs can overlap (user responsibility to manage conflicts)
- Auto-update: When program modified, schedule reflects changes

**Technical:**
- Data: Read from `/programs/{programId}` with `startDate` and workout assignments per week/day
- Calculation: `programStartDate + (weekNumber - 1) * 7 days + dayOfWeek`
- Firestore query: Fetch active programs (`status: 'active'`)

**UI Behavior:**
- Program workouts: Blue badge with program name
- Hover: Shows program details (cycle, week)
- Click: Opens workout details or starts execution

---

### Function 7.3: Manual Workout Assignment & Rest Days

**Purpose:** Allow users to manually assign workouts to specific days or mark days as rest.

**Key Requirements:**
- Click empty day → "Assign Workout" dialog opens → Select from workout library
- Click assigned workout → Options: "Change Workout", "Remove", "Mark as Rest Day"
- Rest day: Explicitly marked (vs. empty day) for tracking adherence
- Override program: Manual assignments override programmed workouts (with warning)

**Technical:**
- Manual assignments: Stored in separate `/scheduleOverrides/{userId}` collection or in program document
- Conflict resolution: Manual > Program (manual takes precedence)
- Validation: Warn if overriding program workout

**UI Behavior:**
- Empty day: "+ Assign Workout" text
- Assigned day: Workout card with options menu (⋮ icon)
- Rest day: "Rest" label with green background

---

### Function 7.4: Schedule Adjustments (Move, Skip, Swap)

**Purpose:** Enable flexible schedule modifications without changing underlying programs.

**Key Requirements:**
- **Move workout:** Drag-and-drop workout from one day to another (or click "Move" → select new date)
- **Skip workout:** Mark workout as skipped (doesn't count against adherence if rest day substitution)
- **Swap workouts:** Exchange two workouts between days
- **Reset to program:** Revert manual changes to original program schedule

**Technical:**
- Drag & Drop: @dnd-kit/core for calendar drag operations
- State: Track overrides separately from program schedule
- Reset: Fetch original program assignments and discard overrides

**UI Behavior:**
- Drag workout card → Drop on different day → Confirmation: "Move [Workout] to [Date]?"
- Context menu: "Skip", "Move", "Remove"
- "Reset Schedule" button: Revert all manual changes

---

## Module-Level Requirements

### Performance Requirements
- Schedule load: <1s (fetch active programs + calculate current week assignments)
- Drag & drop responsiveness: <16ms frame time (60 FPS)
- Date navigation: Instant (client-side calculation)

### Security Requirements
- User can only view/modify their own schedule
- Firestore rules: `allow read, write: if request.auth.uid == request.resource.data.userId`

### Accessibility Requirements
- WCAG 2.1 Level AA
- Keyboard navigation: Tab through days, Arrow keys for date navigation, Enter to assign workout
- Screen reader: Announces day, workout, rest day status

### Browser/Platform Support
- All modern browsers
- Responsive: Mobile (vertical scroll), tablet (compact grid), desktop (full grid)

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 7.1: Weekly Schedule View (foundation)
2. Function 7.2: Program Auto-Assignment (core integration)
3. Function 7.3: Manual Assignment (flexibility)
4. Function 7.4: Schedule Adjustments (advanced editing)

**Estimated Effort:**
- Function 7.1: 4-6 hours / 5 story points
- Function 7.2: 4-6 hours / 5 story points (program integration logic)
- Function 7.3: 3-4 hours / 3 story points
- Function 7.4: 5-7 hours / 5 story points (drag & drop complexity)
- **Total Module Estimate:** 16-23 hours / 18 story points

**Technical Risks & Mitigation:**
- **Risk:** Conflicts between multiple active programs
  **Mitigation:** Visual indicators for conflicts, allow user to resolve manually
- **Risk:** Drag & drop on mobile (touch precision)
  **Mitigation:** Large drop zones, haptic feedback, "Move" button as alternative
- **Risk:** Date calculations across DST boundaries
  **Mitigation:** Use date-fns consistently, store UTC timestamps

**Dependencies on External Factors:**
- @dnd-kit/core stability
- date-fns accuracy for week calculations

---

## Related Documentation

- [Program Management Requirements](./04_program_management_requirements.md)
- [Workout Builder Requirements](./03_workout_builder_requirements.md)
- [Architecture - Calendar Integration](../core/04_ARCHITECTURE.md#calendar-system)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development
