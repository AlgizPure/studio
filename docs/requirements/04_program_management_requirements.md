# Program Management Module Requirements

**Module ID:** Module 4
**Total Functions:** 5
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Exercise Library, Workout Builder

---

## Overview

The Program Management module enables users to create and manage structured training programs with periodization principles. Unlike individual workouts, programs span multiple weeks/months and organize workouts into mesocycles, microcycles, and training days with specific goals (accumulation, intensification, deload, peak).

This module is essential for serious training progression. It implements professional periodization concepts while maintaining an intuitive UI. The integration with ZTL (Zenith Training Language) allows programs to be exported as structured YAML files for version control, sharing, and AI analysis.

**Key Capabilities:**
- Multi-week/month program planning with cycle-based periodization
- Drag-and-drop workout assignment to program days
- Program templates for common training goals (hypertrophy, strength, powerlifting)
- ZTL DSL export/import for programmatic manipulation and AI analysis
- Calendar-based program scheduling with automated progression

**Integration Points:**
- **Workout Builder:** Programs consist of workouts created in the builder
- **Schedule & Planning:** Programs are assigned to calendar days
- **ZTL Module:** Programs can be exported/imported as YAML
- **AI Integration:** Exported programs analyzed by AI for optimization
- **Firestore:** `/programs/{programId}` collection with nested structure

---

## Function 4.1: Program Creation & Structure

### User Story
**As a** user planning long-term training
**I want to** create multi-week programs with defined cycles and goals
**So that** I can follow structured periodization principles and track progress over mesocycles

### Acceptance Criteria

**Scenario 1: Create New Program**
- **Given** I am on the Programs page
- **When** I click "Create Program"
- **Then** A program creation modal opens
- **And** I can enter: program name, goal (hypertrophy/strength/endurance), duration (weeks)
- **And** I can choose to start from template or blank

**Scenario 2: Define Program Metadata**
- **Given** I am creating a program "Strength Program Q1 2025"
- **When** I fill in details:
  - Name: "Strength Program Q1 2025"
  - Goal: Strength
  - Duration: 12 weeks
  - Start date: 2025-01-06
  - Training days per week: 4
- **Then** Program is created with this metadata
- **And** I am redirected to the program builder

**Scenario 3: Cycle-Based Structure Creation**
- **Given** I created a 12-week program
- **When** The program builder loads
- **Then** I see default cycle structure suggested:
  - Weeks 1-4: Accumulation (volume focus)
  - Weeks 5-8: Intensification (intensity focus)
  - Weeks 9-11: Peaking (max strength)
  - Week 12: Deload (recovery)
- **And** I can customize these cycles

**Scenario 4: Add/Remove Cycles**
- **Given** I have a program with default cycles
- **When** I click "Add Cycle"
- **Then** A new cycle is added with configurable:
  - Name (e.g., "Accumulation 1")
  - Type (accumulation/intensification/peak/deload)
  - Duration (weeks)
  - Goal/focus (volume/intensity/technique/recovery)
- **When** I remove a cycle, weeks are redistributed to remaining cycles

**Scenario 5: Nested Structure (Program → Cycles → Weeks → Days)**
- **Given** I have a 12-week program
- **Then** I see hierarchy:
  ```
  Program: Strength Q1 2025
    ├── Cycle 1: Accumulation (Weeks 1-4)
    │   ├── Week 1 (Days: Mon, Wed, Fri, Sat)
    │   ├── Week 2
    │   ├── Week 3
    │   └── Week 4
    ├── Cycle 2: Intensification (Weeks 5-8)
    └── Cycle 3: Deload (Week 12)
  ```
- **And** Each level is collapsible/expandable

### Technical Requirements

**Frontend:**
- Component: `ProgramBuilder`, `CycleEditor`, `ProgramMetadataForm`
- Location: `src/app/programs/page.tsx`, `src/components/programs/program-card.tsx`
- State: React Query + local state for editing

**Backend:**
- Firestore Collection: `/programs/{programId}`
- Nested structure: Program → Cycles → Weeks → WorkoutAssignments

**Data Structure:**
```typescript
interface Program {
  id: string;
  userId: string;
  name: string;
  goal: 'hypertrophy' | 'strength' | 'endurance' | 'general';
  durationWeeks: number;
  startDate: Timestamp;
  trainingDaysPerWeek: number;
  cycles: ProgramCycle[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isTemplate?: boolean;
}

interface ProgramCycle {
  id: string;
  name: string;
  type: 'accumulation' | 'intensification' | 'peak' | 'deload';
  startWeek: number; // 1-indexed
  endWeek: number;
  goal: string; // "Build volume" or "Increase 1RM"
  weeks: ProgramWeek[];
}

interface ProgramWeek {
  weekNumber: number; // 1-indexed (1-12 for 12-week program)
  workoutAssignments: WorkoutAssignment[];
}

interface WorkoutAssignment {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  workoutId: string; // Reference to workout in /workouts collection
  workoutName: string; // Denormalized for quick display
  order: number; // If multiple workouts same day
}
```

### UI Behavior

**Layout:**
- **Programs List Page:** Grid of program cards showing name, goal, weeks completed/total, progress bar
- **Program Builder:** Left sidebar with cycle/week tree, main area with week calendar view
- **Cycle Editor:** Modal for adding/editing cycles

**User Interactions:**
1. User clicks "Create Program" → Metadata form opens
2. User fills form → Clicks "Create" → Program created → Redirected to builder
3. User sees default cycle structure → Can accept or customize
4. User expands cycle → Sees weeks → Clicks week → Sees day assignments

**UI States:**
- **Loading:** Skeleton program cards
- **Empty:** "No programs yet. Create your first training program!"
- **Success:** Program card with progress indicator
- **Editing:** Inline editing for program name, cycle names

**Responsive:**
- Mobile: Vertical stacked layout, collapsible tree
- Desktop: Sidebar + main area split view

### Error Handling

**Validation Errors:**
- Empty program name → "Program name is required"
- Duration < 1 week → "Program must be at least 1 week"
- Overlapping cycles → "Cycles cannot overlap weeks"
- Cycle end week > program duration → "Cycle exceeds program duration"

**System Errors:**
- Firestore save failure → "Failed to create program. Retry?"
- Network error → "Network error. Check connection."

**Recovery:**
- Auto-save with retry logic
- Offline mode: Changes queued for sync

### Edge Cases

- **Very long program names:** Truncate with ellipsis in cards
- **1-week program:** Allowed (single deload week or test week)
- **Unassigned weeks:** Allowed (user can leave weeks blank)
- **Delete cycle with workouts:** Warn: "This cycle has assigned workouts. Delete anyway?"

### Dependencies

**Requires:**
- Authentication (user must be logged in)
- Workout Builder (programs reference workouts)

**Blocks:**
- Workout Execution (programs must be scheduled first)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Program creation logic
- Cycle nesting validation
- Week overlap detection

**Integration Tests:**
- Create program → Firestore document structure correct
- Add cycle → Nested correctly in program

**E2E Tests:**
- Create program → Fill metadata → Verify created
- Add cycle → Verify in cycle list
- Expand/collapse cycle tree → Verify UI updates

---

## Function 4.2: Workout Assignment to Program Days

### User Story
**As a** user building a program
**I want to** assign specific workouts to specific days in my program
**So that** I have a complete, executable training plan

### Acceptance Criteria

**Scenario 1: Assign Workout to Day**
- **Given** I have a program and 3 workouts: "Push A", "Pull A", "Legs A"
- **When** I navigate to Week 1, Monday
- **Then** I can click "Assign Workout"
- **And** A workout selector opens showing my saved workouts
- **And** I select "Push A" → Workout assigned to Monday Week 1

**Scenario 2: View Weekly Schedule**
- **Given** I have assigned workouts to Week 1:
  - Monday: Push A
  - Wednesday: Pull A
  - Friday: Legs A
  - Saturday: Push B
- **Then** I see a calendar view for Week 1 with workouts on respective days
- **And** Rest days (Tue, Thu, Sun) are marked as "Rest"

**Scenario 3: Reassign Workout (Change Assignment)**
- **Given** Monday Week 1 has "Push A" assigned
- **When** I click the workout assignment and select "Change Workout"
- **Then** Workout selector opens
- **And** I select "Push B" → "Push B" replaces "Push A" on Monday

**Scenario 4: Remove Workout Assignment**
- **Given** Monday has "Push A" assigned
- **When** I click "Remove Workout"
- **Then** Confirmation dialog: "Remove Push A from Monday Week 1?"
- **And** I confirm → Workout removed, Monday becomes rest day

**Scenario 5: Copy Week to Multiple Weeks**
- **Given** I have fully configured Week 1 with 4 workouts
- **When** I click "Copy Week" and select Weeks 2, 3, 4
- **Then** All 4 weeks have identical workout assignments
- **And** I can individually modify each week afterward

**Scenario 6: Drag & Drop Assignment (Optional)**
- **Given** I have a list of workouts in sidebar
- **When** I drag "Push A" from sidebar to Monday Week 1
- **Then** "Push A" is assigned to that day
- **And** Visual feedback during drag (drop zones highlighted)

### Technical Requirements

**Frontend:**
- Component: `ProgramCalendar`, `WorkoutAssignmentSelector`
- Drag & Drop: Optional enhancement with @dnd-kit
- Calendar View: Custom React component (7-column grid for week)

**Backend:**
- Firestore: Update `/programs/{programId}/cycles/{cycleIndex}/weeks/{weekIndex}/workoutAssignments` array
- References: Store `workoutId` and denormalized `workoutName` for quick display

**Assignment Logic:**
```typescript
const assignWorkout = async (
  programId: string,
  weekNumber: number,
  dayOfWeek: number,
  workoutId: string
) => {
  const program = await getProgram(programId);
  const week = findWeek(program, weekNumber);

  // Check if day already has assignment
  const existingIndex = week.workoutAssignments.findIndex(
    a => a.dayOfWeek === dayOfWeek
  );

  if (existingIndex >= 0) {
    // Replace existing
    week.workoutAssignments[existingIndex] = {
      dayOfWeek,
      workoutId,
      workoutName: (await getWorkout(workoutId)).name,
      order: 0
    };
  } else {
    // Add new
    week.workoutAssignments.push({...});
  }

  await updateProgram(programId, program);
};
```

### UI Behavior

**Layout:**
- **Week Calendar:** 7-column grid (Sun-Sat)
- **Day Cell:** Shows assigned workout name or "Rest Day"
- **Workout Selector:** Modal with searchable workout list

**User Interactions:**
1. User clicks day cell → Workout selector opens
2. User searches/selects workout → Clicks "Assign"
3. Workout appears in day cell → Auto-saved to Firestore
4. User can click workout to view details, change, or remove

**UI States:**
- **Unassigned Day:** Gray background, "+ Assign Workout" text
- **Assigned Day:** Blue background, workout name displayed
- **Rest Day:** "Rest" label, darker gray
- **Loading:** Skeleton calendar cells

**Responsive:**
- Mobile: Single-column weekly view (vertical scroll)
- Desktop: Full 7-column calendar

### Error Handling

**Validation Errors:**
- Assign workout that doesn't exist → "Workout not found. It may have been deleted."
- Network timeout → "Failed to assign workout. Retry?"

**System Errors:**
- Firestore update failure → Optimistic UI reverts → "Failed to save. Retry?"

**Recovery:**
- Retry with exponential backoff
- Offline queue for assignments

### Edge Cases

- **Multiple workouts same day:** Supported (stored in `order` field, displayed as "Workout 1, Workout 2")
- **Assign same workout to multiple days:** Allowed
- **Delete workout that's assigned to program:** Warn: "This workout is assigned to X programs. Delete anyway?" → On delete, assignment shows "Workout deleted"

### Dependencies

**Requires:**
- Program created
- Workouts exist in /workouts collection

**Blocks:**
- Workout Execution (program must be assigned to execute)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Assignment logic (add, replace, remove)
- Copy week logic

**Integration Tests:**
- Assign workout → Firestore document updated
- Remove assignment → Document updated

**E2E Tests:**
- Navigate to week → Assign workout → Verify displayed
- Remove workout → Verify "Rest Day"
- Copy week → Verify assignments duplicated

---

## Function 4.3: Program Templates

### User Story
**As a** user who follows proven training methodologies
**I want to** access pre-built program templates (e.g., 5/3/1, PPL, Upper/Lower)
**So that** I can start training immediately without designing a program from scratch

### Acceptance Criteria

**Scenario 1: Browse Program Templates**
- **Given** I am on the Programs page
- **When** I click "Browse Templates"
- **Then** I see a gallery of pre-built templates:
  - "PPL - Hypertrophy Focus (6 weeks)"
  - "5/3/1 BBB - Strength (12 weeks)"
  - "Upper/Lower Split (8 weeks)"
  - "Full Body 3x/week (4 weeks)"
- **And** Each template shows: name, duration, goal, training days/week, preview

**Scenario 2: View Template Details**
- **Given** I am browsing templates
- **When** I click "PPL - Hypertrophy Focus"
- **Then** A detail modal opens showing:
  - Full program structure (cycles, weeks)
  - Sample workouts assigned to Week 1
  - Description of methodology
  - Recommended for: "Intermediate lifters, hypertrophy focus"
- **And** "Use Template" button at bottom

**Scenario 3: Create Program from Template**
- **Given** I am viewing "PPL - Hypertrophy Focus" template
- **When** I click "Use Template"
- **Then** Program creation modal opens pre-filled with template data
- **And** I can customize name (e.g., "My PPL Program"), start date
- **And** I click "Create" → Full program created with all assignments
- **And** I am redirected to program builder where I can make further edits

**Scenario 4: Custom Templates (Save Own Program as Template)**
- **Given** I have created and fine-tuned "My Perfect Program"
- **When** I click "Save as Template" in program settings
- **Then** Program is marked as `isTemplate: true`
- **And** It appears in my "My Templates" section
- **And** I can reuse it or share (future feature)

**Scenario 5: Template Categories**
- **Given** I am browsing templates
- **When** I filter by category (Strength, Hypertrophy, Endurance, Beginner-Friendly)
- **Then** Only templates matching that category are shown
- **And** I can multi-select filters

### Technical Requirements

**Frontend:**
- Component: `ProgramTemplates`, `TemplateCard`, `TemplateDetailModal`
- Location: `src/app/programs/templates/page.tsx`
- State: React Query for template fetching

**Backend:**
- Firestore: Same `/programs` collection with `isTemplate: true` flag
- System Templates: Seeded in Firestore with `userId: 'system'` (read-only for all users)
- User Templates: `userId: <user-id>` (user can CRUD their own templates)

**Firestore Security Rules:**
```javascript
match /programs/{programId} {
  allow read: if request.auth != null; // All users can read templates
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}
```

**Template Document:**
```typescript
interface ProgramTemplate extends Program {
  isTemplate: true;
  category: 'strength' | 'hypertrophy' | 'endurance' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  recommendedFor: string;
  tags: string[]; // e.g., ["ppl", "hypertrophy", "6-week"]
}
```

**Create from Template:**
```typescript
const createFromTemplate = async (templateId: string, customName: string, startDate: Date) => {
  const template = await getProgram(templateId);
  const newProgram = {
    ...template,
    id: nanoid(),
    userId: currentUser.uid,
    name: customName,
    startDate: Timestamp.fromDate(startDate),
    isTemplate: false, // User's copy is NOT a template
    createdAt: serverTimestamp()
  };
  await saveProgram(newProgram);
  return newProgram.id;
};
```

### UI Behavior

**Layout:**
- **Templates Gallery:** Grid layout (2 cols mobile, 3-4 cols desktop)
- **Template Card:** Image/icon, name, duration, goal, training days, "View Details" button
- **Template Detail Modal:** Full-screen on mobile, large modal on desktop

**User Interactions:**
1. User navigates to Templates → Gallery loads
2. User browses, filters by category
3. User clicks template → Detail modal opens
4. User clicks "Use Template" → Customization form → Creates program

**UI States:**
- **Loading:** Skeleton template cards
- **Empty (system):** Should never be empty (system templates always present)
- **Empty (user):** "You haven't created any custom templates yet"
- **Success:** Templates displayed

**Responsive:**
- Mobile: 2-col grid, full-screen detail modal
- Desktop: 3-4 col grid, large centered modal

### Error Handling

**Validation Errors:**
- Empty program name when creating from template → "Program name is required"

**System Errors:**
- Failed to load templates → "Failed to load templates. Retry?"
- Failed to create from template → "Failed to create program. Retry?"

**Recovery:**
- Retry mechanism for template fetch
- Templates cached for offline access

### Edge Cases

- **Very long template names:** Truncate with ellipsis
- **Template with missing workouts:** Warning: "Some workouts in this template are missing. Create anyway?" (assigns placeholders)
- **Delete template while someone is using it:** No effect (user's program is independent copy)

### Dependencies

**Requires:**
- Authentication
- Workouts exist (templates reference workouts)

**Blocks:**
- None (templates are optional productivity feature)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Template filtering logic
- Create from template (deep copy)

**Integration Tests:**
- Fetch templates → Firestore query returns system + user templates
- Create from template → New program document created

**E2E Tests:**
- Browse templates → Filter by category → Verify filtered
- View template details → Use template → Verify program created
- Save program as template → Verify appears in "My Templates"

---

## Function 4.4: Program Scheduling to Calendar

### User Story
**As a** user who has created a program
**I want to** schedule the program to my calendar
**So that** I know which workout to do each day and can track adherence

### Acceptance Criteria

**Scenario 1: Schedule Program to Start Date**
- **Given** I have created "Strength Q1 2025" program (12 weeks)
- **When** I set start date to January 6, 2025 (Monday)
- **Then** Week 1 is scheduled to Jan 6-12
- **And** Week 2 to Jan 13-19
- **And** Week 12 ends on March 30, 2025

**Scenario 2: View Program on Main Calendar**
- **Given** My program is scheduled starting Jan 6
- **When** I navigate to the main Schedule/Calendar page
- **Then** I see program workouts on their respective days:
  - Jan 6 (Mon): Push A
  - Jan 8 (Wed): Pull A
  - Jan 10 (Fri): Legs A
  - Jan 11 (Sat): Push B
- **And** Rest days have no workouts assigned

**Scenario 3: Program Progress Tracking**
- **Given** I am in Week 2 of my program (current date: Jan 14)
- **When** I view the program
- **Then** I see progress indicator: "Week 2 of 12 (17% complete)"
- **And** Completed workouts marked with green checkmark
- **And** Upcoming workouts highlighted

**Scenario 4: Reschedule Program (Change Start Date)**
- **Given** My program starts Jan 6
- **When** I change start date to Jan 13
- **Then** Confirmation: "This will reschedule all weeks. Continue?"
- **And** I confirm → All weeks shift by 7 days
- **And** Week 1 now Jan 13-19

**Scenario 5: Pause/Resume Program**
- **Given** I am in Week 3 but need to take a break (injury/vacation)
- **When** I click "Pause Program"
- **Then** Program is marked as paused
- **And** It does not appear on calendar
- **When** I click "Resume" and select date (Feb 1)
- **Then** Program resumes from Week 3 starting Feb 1

### Technical Requirements

**Frontend:**
- Component: `ProgramScheduler`, integrated with `Calendar` component
- Location: `src/components/workout-builder/workout-schedule-setup.tsx`, `src/app/schedule/page.tsx`
- Date Calculations: date-fns library for week arithmetic

**Backend:**
- Firestore: `/programs/{programId}` with `startDate`, `currentWeek`, `status` fields

**Data Structure:**
```typescript
interface Program {
  // ... existing fields
  startDate: Timestamp;
  endDate: Timestamp; // Calculated: startDate + (durationWeeks * 7 days)
  currentWeek: number; // 1-12 (which week user is on)
  status: 'scheduled' | 'active' | 'paused' | 'completed';
  pausedDate?: Timestamp; // When paused
  completedWorkouts: string[]; // Array of workoutLogIds for progress tracking
}
```

**Week Calculation:**
```typescript
const calculateWeekDates = (program: Program) => {
  const startDate = program.startDate.toDate();
  const weeks = [];

  for (let i = 0; i < program.durationWeeks; i++) {
    const weekStart = addDays(startDate, i * 7);
    const weekEnd = addDays(weekStart, 6);
    weeks.push({ weekNumber: i + 1, start: weekStart, end: weekEnd });
  }

  return weeks;
};

const getCurrentWeek = (program: Program, today: Date) => {
  const weeks = calculateWeekDates(program);
  return weeks.find(w => isWithinInterval(today, { start: w.start, end: w.end }))?.weekNumber || 1;
};
```

### UI Behavior

**Layout:**
- **Program Card:** Shows start date, end date, current week, progress bar
- **Calendar Integration:** Program workouts overlay on main calendar
- **Program Detail:** Full schedule view with all weeks/days

**User Interactions:**
1. User creates program → Sets start date → Program scheduled
2. User views calendar → Sees program workouts on respective days
3. User completes workout → Checkmark appears on program progress
4. User pauses program → Workouts disappear from calendar

**UI States:**
- **Scheduled:** Future program, gray color
- **Active:** Current program, blue color, progress bar animating
- **Paused:** Yellow badge, "Resume" button
- **Completed:** Green checkmark, archived

**Responsive:**
- Mobile: Vertical timeline view for program weeks
- Desktop: Calendar grid view

### Error Handling

**Validation Errors:**
- Start date in past → Warning: "Starting program in the past. Continue?"
- Overlapping programs → Warning: "Another program is active in this period. Continue anyway?"

**System Errors:**
- Firestore update failure → "Failed to schedule program. Retry?"

**Recovery:**
- Auto-save with retry

### Edge Cases

- **Very long programs (52+ weeks):** Supported, but UI may paginate calendar view
- **Multiple active programs:** Allowed (user manages own conflicts)
- **Delete active program:** Confirm: "This program is active. Workouts will be removed from calendar. Delete?"

### Dependencies

**Requires:**
- Program created with workout assignments

**Blocks:**
- Workout Execution (user executes scheduled workouts)

**External Dependencies:**
- date-fns

### Testing Considerations

**Unit Tests:**
- Week date calculation
- Current week detection
- Progress calculation

**Integration Tests:**
- Schedule program → Firestore dates correct
- Reschedule → Dates updated

**E2E Tests:**
- Create program → Set start date → View calendar → Verify workouts appear
- Pause program → Verify removed from calendar
- Resume → Verify reappears

---

## Function 4.5: ZTL Import/Export

### User Story
**As a** user managing complex programs
**I want to** export my program as YAML (ZTL format) and import programs from YAML
**So that** I can version-control programs, share them, and leverage AI analysis

### Acceptance Criteria

**Scenario 1: Export Program to ZTL YAML**
- **Given** I have a complete 12-week program
- **When** I click "Export to ZTL"
- **Then** A YAML file is generated containing:
  - Program metadata (name, goal, duration, start date)
  - All cycles with their configurations
  - All weeks with workout assignments
  - Embedded AI analysis prompts
- **And** File downloads as `program-name.yaml`

**Scenario 2: ZTL YAML Structure**
- **Given** I open the exported YAML file
- **Then** I see structured format:
```yaml
version: "1.0"
metadata:
  name: "Strength Q1 2025"
  goal: strength
  duration_weeks: 12
  training_days_per_week: 4
  start_date: "2025-01-06"

cycles:
  - name: "Accumulation"
    type: accumulation
    weeks: [1, 2, 3, 4]
    focus: "Volume building"

  - name: "Intensification"
    type: intensification
    weeks: [5, 6, 7, 8]
    focus: "Intensity increase"

weeks:
  week_1:
    monday:
      workout: "Push Day A"
      exercises: [...]
    wednesday:
      workout: "Pull Day A"
      exercises: [...]
```
- **And** Embedded AI prompt at bottom for Claude analysis

**Scenario 3: Import ZTL YAML**
- **Given** I have a ZTL YAML file (e.g., from coach or AI-optimized version)
- **When** I click "Import Program" and select the file
- **Then** ZTL parser validates YAML structure
- **And** Preview modal shows: program name, cycles, weeks, workouts
- **And** I can review before importing

**Scenario 4: ZTL Validation**
- **Given** I try to import a malformed YAML
- **When** Parser detects errors (invalid cycle weeks, missing fields)
- **Then** I see detailed error messages:
  - "Line 23: Cycle weeks overlap (Cycle 1: weeks 1-4, Cycle 2: weeks 3-6)"
  - "Line 45: Missing required field 'workout' in week_1.monday"
- **And** Import is blocked until errors are fixed

**Scenario 5: Import with Conflicting Workouts**
- **Given** YAML references workout "Push Day A" that doesn't exist in my library
- **When** I import the program
- **Then** Warning: "3 workouts not found in your library. Import will create placeholders."
- **And** I can choose:
  - Option 1: Skip missing workouts (leave days unassigned)
  - Option 2: Create placeholder workouts (to be filled later)
- **And** I confirm → Program imported

**Scenario 6: Bidirectional Workflow (Export → AI Analysis → Import)**
- **Given** I exported "Strength Q1 2025" to ZTL
- **When** I send the YAML to Claude for analysis
- **Then** Claude uses embedded prompts to analyze:
  - Volume progression appropriateness
  - Deload timing
  - Exercise selection balance
  - Recommendations for optimization
- **And** Claude returns modified YAML with improvements
- **When** I import the AI-optimized YAML
- **Then** My program is updated with recommended changes

### Technical Requirements

**Frontend:**
- Component: `ExportProgramDialog`, `ImportProgramDialog`
- Location: `src/components/import-program-dialog.tsx`, `src/lib/ztl/`
- File Handling: Browser File API for YAML download/upload

**Backend (ZTL Module):**
- Library: `yaml` (parse/stringify)
- Validation: Zod schema (`src/lib/ztl/schema.ts`)
- Export: `src/lib/ztl/export-full-analysis.ts`
- Import: `src/lib/ztl/parser.ts`

**ZTL Schema (Zod):**
```typescript
const ZTLProgramSchema = z.object({
  version: z.string(),
  metadata: z.object({
    name: z.string(),
    goal: z.enum(['strength', 'hypertrophy', 'endurance', 'general']),
    duration_weeks: z.number().min(1).max(104),
    training_days_per_week: z.number().min(1).max(7),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }),
  cycles: z.array(z.object({
    name: z.string(),
    type: z.enum(['accumulation', 'intensification', 'peak', 'deload']),
    weeks: z.array(z.number()),
    focus: z.string().optional()
  })),
  weeks: z.record(z.object({
    monday: WorkoutAssignmentSchema.optional(),
    tuesday: WorkoutAssignmentSchema.optional(),
    // ... all days
  }))
});
```

**Export Logic:**
```typescript
const exportToZTL = async (programId: string) => {
  const program = await getProgram(programId);
  const workouts = await fetchProgramWorkouts(program);

  const ztl = {
    version: "1.0",
    metadata: {
      name: program.name,
      goal: program.goal,
      duration_weeks: program.durationWeeks,
      training_days_per_week: program.trainingDaysPerWeek,
      start_date: format(program.startDate.toDate(), 'yyyy-MM-dd')
    },
    cycles: program.cycles.map(c => ({
      name: c.name,
      type: c.type,
      weeks: range(c.startWeek, c.endWeek + 1),
      focus: c.goal
    })),
    weeks: buildWeeksObject(program, workouts),
    ai_analysis_prompt: getEmbeddedAIPrompt()
  };

  const yamlString = yaml.stringify(ztl);
  downloadFile(`${program.name}.yaml`, yamlString);
};
```

### UI Behavior

**Layout:**
- **Export Button:** "Export to ZTL" in program settings dropdown
- **Import Button:** "Import Program" on Programs page
- **Import Preview:** Modal showing parsed YAML structure

**User Interactions:**
1. User clicks "Export" → YAML downloads immediately
2. User clicks "Import" → File picker opens → User selects YAML
3. Parser validates → If valid, preview modal shows
4. User reviews → Clicks "Import" → Program created

**UI States:**
- **Exporting:** Brief spinner, then download
- **Importing:** Parsing spinner → Preview or Error
- **Validation Error:** Red alert with line numbers and messages
- **Success:** Toast: "Program imported successfully"

**Responsive:**
- Mobile: Full-screen import preview
- Desktop: Large modal (800px width)

### Error Handling

**Validation Errors:**
- Invalid YAML syntax → "YAML parse error at line X: unexpected token"
- Schema validation failure → "Invalid program structure: [field] is required"
- Overlapping cycles → "Cycle weeks overlap: Cycle 1 (weeks 1-4), Cycle 2 (weeks 3-6)"

**System Errors:**
- Firestore save failure → "Failed to import program. Retry?"
- File read error → "Failed to read file. Ensure it's a valid YAML file."

**Recovery:**
- Detailed error messages with line numbers
- Validation errors block import (user must fix YAML)

### Edge Cases

- **Very large programs (104 weeks):** YAML file may be large (100KB+), but manageable
- **Missing workouts:** Create placeholders or skip
- **Import duplicate program name:** Append "(Imported)" to name

### Dependencies

**Requires:**
- ZTL Module (parser, validator, exporter)
- Workout Builder (programs reference workouts)

**Blocks:**
- AI Integration (ZTL exports used for AI analysis)

**External Dependencies:**
- `yaml` library
- Zod

### Testing Considerations

**Unit Tests:**
- YAML parse/stringify
- Schema validation (valid/invalid YAML)
- Cycle overlap detection

**Integration Tests:**
- Export → Import → Verify program structure identical
- Invalid YAML → Verify error messages

**E2E Tests:**
- Export program → Download file → Import file → Verify program created
- Import with missing workouts → Verify placeholder creation
- Import invalid YAML → Verify error displayed

---

## Module-Level Requirements

### Performance Requirements
- Program list load: <1.5s (fetching programs + workouts)
- Program builder load: <2s (nested structure with cycles/weeks)
- ZTL export: <3s (including workout fetching)
- ZTL import: <5s (parse + validate + create program)

### Security Requirements
- User can only CRUD their own programs
- Template read access: All authenticated users
- Firestore Security Rules:
  ```javascript
  match /programs/{programId} {
    allow read: if request.auth != null;
    allow create: if request.auth.uid == request.resource.data.userId;
    allow update, delete: if request.auth.uid == resource.data.userId;
  }
  ```
- ZTL import: Sanitize all user-provided YAML to prevent injection

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Full support for program creation, cycle editing, workout assignment
- Screen reader: Announces program progress, cycle structure, validation errors
- Focus management: Logical tab order, focus trapped in modals

### Browser/Platform Support
- All modern browsers (Chrome 111+, Firefox 128+, Safari 16.4+, Edge 111+)
- Responsive: Mobile-first design
- File downloads: Works in all browsers

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 4.1: Program Creation & Structure (foundation)
2. Function 4.2: Workout Assignment (core functionality)
3. Function 4.4: Program Scheduling (calendar integration)
4. Function 4.3: Program Templates (productivity feature)
5. Function 4.5: ZTL Import/Export (advanced feature)

**Estimated Effort:**
- Function 4.1: 8-10 hours / 8 story points (complex nested structure)
- Function 4.2: 6-8 hours / 5 story points
- Function 4.3: 5-7 hours / 5 story points
- Function 4.4: 6-8 hours / 5 story points (date math complexity)
- Function 4.5: 8-10 hours / 8 story points (ZTL integration)
- **Total Module Estimate:** 33-43 hours / 31 story points

**Technical Risks & Mitigation:**
- **Risk:** Nested Firestore structure complexity (program → cycles → weeks → workouts)
  **Mitigation:** Use clear data models, thoroughly test nested updates, consider flattening if performance issues
- **Risk:** ZTL YAML parsing edge cases (malformed files, encoding issues)
  **Mitigation:** Robust validation with Zod, detailed error messages, extensive test coverage
- **Risk:** Date calculations (week arithmetic, timezone handling)
  **Mitigation:** Use date-fns consistently, store UTC timestamps, test edge cases (DST, year boundaries)

**Dependencies on External Factors:**
- `yaml` library stability (mature library, stable)
- date-fns accuracy for date arithmetic
- Firestore query performance with nested structures

---

## Related Documentation

- [Architecture - Data Model](../core/04_ARCHITECTURE.md#data-model)
- [Workout Builder Requirements](./03_workout_builder_requirements.md)
- [ZTL Module Requirements](./08_ztl_requirements.md)
- [Schedule & Planning Requirements](./07_schedule_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development
