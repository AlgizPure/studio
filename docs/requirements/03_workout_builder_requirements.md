# Workout Builder Module Requirements

**Module ID:** Module 3
**Total Functions:** 5
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Exercise Library

---

## Overview

The Workout Builder module provides an intuitive, drag-and-drop interface for creating structured workout sessions. This is a critical module that enables users to compose workouts by selecting exercises from the library, organizing them into cycles (supersets, circuits), configuring sets/reps/weights, and saving templates for reuse.

The module uses industry-leading @dnd-kit libraries for smooth, accessible drag-and-drop interactions. Real-time validation ensures workouts meet minimum requirements, while Firestore persistence enables cross-device access.

**Key Capabilities:**
- Visual workout construction with drag-and-drop reordering
- Cycle system for supersets/circuits (group exercises with shared rest periods)
- Granular set/rep/weight/RPE configuration for each exercise
- Template system for saving and reusing workout structures
- Real-time validation and Firestore auto-save

**Integration Points:**
- **Exercise Library:** Source for exercise selection
- **Program Management:** Workouts can be assigned to programs
- **Workout Execution:** Built workouts are executed in Workout Mode
- **Firebase Firestore:** `/workouts/{workoutId}` collection for persistence

---

## Function 3.1: Exercise Selection from Library

### User Story
**As a** user creating a workout
**I want to** select exercises from the exercise library
**So that** I can add them to my workout without manually entering exercise details

### Acceptance Criteria

**Scenario 1: Open Exercise Selector**
- **Given** I am on the workout builder page
- **When** I click "Add Exercise" button
- **Then** A modal/drawer opens showing all exercises from the library
- **And** I see exercise cards with name, category, muscle groups, equipment

**Scenario 2: Search and Filter Exercises**
- **Given** The exercise selector is open
- **When** I type "bench press" in the search bar
- **Then** Only exercises matching "bench press" are shown
- **And** I can further filter by category or muscle group

**Scenario 3: Select Exercise and Add to Workout**
- **Given** I am viewing the exercise library in the selector
- **When** I click on "Barbell Bench Press" exercise card
- **Then** The exercise is added to my workout
- **And** A new exercise block appears in the workout builder
- **And** Default values are set: 3 sets, 8-12 reps, 0 weight

**Scenario 4: Add Multiple Exercises**
- **Given** I have added "Bench Press" to workout
- **When** I click "Add Exercise" again and select "Incline Dumbbell Press"
- **Then** Both exercises appear in the workout list
- **And** They are ordered sequentially

**Scenario 5: Empty State - No Exercises in Library**
- **Given** The exercise library is empty (unlikely but possible)
- **When** I open the exercise selector
- **Then** I see message: "No exercises available. Add custom exercises first."

### Technical Requirements

**Frontend:**
- Component: `WorkoutBuilder`, `ExerciseSelector` dialog
- Location: `src/components/workout-builder/workout-builder.tsx`, `exercise-selector.tsx`
- State: React useState for selected exercises array
- UI Framework: Radix UI Dialog for modal

**Backend:**
- Firestore Query: `collection('exercises').get()` (fetches all exercises)
- Client-side filtering for search/category
- Optimistic UI updates (add to state immediately, sync to Firestore after)

**Data Structure:**
```typescript
interface WorkoutExercise {
  exerciseId: string; // Reference to exercise in library
  name: string; // Denormalized for quick access
  category: string;
  order: number; // Position in workout
  sets: number; // Default: 3
  targetReps: number | string; // "8-12" or 10
  targetWeight: number; // Default: 0
  restSeconds: number; // Default: 60
  rpe?: number; // Default: undefined
  notes?: string;
}
```

### UI Behavior

**Layout:**
- **Workout Builder:** Main page with workout name input, exercise list, "Add Exercise" button
- **Exercise Selector Dialog:** Full-screen on mobile, centered modal on desktop
- **Exercise Cards:** Grid layout (2 cols mobile, 3-4 cols desktop)

**User Interactions:**
1. User clicks "Add Exercise" → Dialog opens with loading state → Exercises load
2. User searches/filters → Real-time filtering
3. User clicks exercise card → Exercise added to workout → Dialog closes
4. Workout auto-saves to Firestore after 500ms debounce

**UI States:**
- **Loading:** Skeleton cards while fetching exercises
- **Success:** Exercise cards displayed
- **Empty Search:** "No exercises match your search. Try different terms."
- **Added Feedback:** Brief toast: "Exercise added to workout"

**Responsive Behavior:**
- Mobile: Full-screen selector, larger touch targets
- Desktop: Modal dialog (max-width 800px)

### Error Handling

**Validation Errors:**
- Exercise already in workout → Show warning: "This exercise is already in your workout. Add anyway?"

**System Errors:**
- Firestore fetch failure → "Failed to load exercises. Retry?"
- Network error → "Network error. Check connection."

**Recovery:**
- Retry button re-fetches exercises
- Cached exercises loaded if available (offline support)

### Edge Cases

- **Duplicate exercises:** Allow adding same exercise multiple times (for different set/rep schemes)
- **Very long exercise names:** Truncate with ellipsis
- **No exercises selected yet:** Workout can be saved with 0 exercises (validation happens at program assignment)

### Dependencies

**Requires:**
- Authentication (user must be logged in)
- Exercise Library (exercises must exist)

**Blocks:**
- Workout Execution (need exercises to execute)

**External Dependencies:**
- Firestore `/exercises` collection

### Testing Considerations

**Unit Tests:**
- Exercise selection logic
- Search/filter functionality
- Duplicate exercise handling

**Integration Tests:**
- Firestore query returns exercises
- Exercise added to workout state

**E2E Tests:**
- Open exercise selector → Search → Add exercise → Verify appears in workout
- Add multiple exercises → Verify order

---

## Function 3.2: Set/Rep/Weight Configuration

### User Story
**As a** user building a workout
**I want to** configure sets, reps, target weight, and rest time for each exercise
**So that** I have a precise plan for execution

### Acceptance Criteria

**Scenario 1: Inline Editing - Sets**
- **Given** I have added "Bench Press" to workout
- **When** I click on the "3 sets" field
- **Then** An inline number input appears
- **And** I can change to any number 1-10
- **And** Changes save automatically after 500ms

**Scenario 2: Inline Editing - Target Reps**
- **Given** I have an exercise in workout
- **When** I click on "8-12 reps" field
- **Then** I can enter a single number (e.g., "10") or range (e.g., "6-8")
- **And** Validation: 1-100 reps

**Scenario 3: Inline Editing - Target Weight**
- **Given** I have an exercise in workout
- **When** I click on weight field (default "0 kg")
- **Then** Number input appears
- **And** I can enter weight in kg (0-500)
- **And** Decimal values allowed (e.g., 82.5)

**Scenario 4: Rest Time Configuration**
- **Given** I have an exercise in workout
- **When** I click on "Rest: 60s" field
- **Then** I can select from presets (30s, 60s, 90s, 120s, 180s)
- **Or** Enter custom value (15-600 seconds)

**Scenario 5: RPE (Rate of Perceived Exertion)**
- **Given** I have an exercise configured
- **When** I open advanced options and enable RPE tracking
- **Then** A target RPE slider appears (1-10)
- **And** I can set target RPE for this exercise

**Scenario 6: Invalid Input Handling**
- **Given** I am editing target reps
- **When** I enter "abc" or "0"
- **Then** Validation error shows: "Reps must be 1-100"
- **And** Input reverts to previous valid value on blur

### Technical Requirements

**Frontend:**
- Component: `ExerciseConfigPanel` within `WorkoutBuilder`
- Inline editing with focus/blur handlers
- Debounced auto-save (500ms after last change)
- Validation: Zod schema

**Zod Schema:**
```typescript
const exerciseConfigSchema = z.object({
  sets: z.number().min(1).max(10),
  targetReps: z.union([
    z.number().min(1).max(100), // Single number
    z.string().regex(/^\d+-\d+$/) // Range like "8-12"
  ]),
  targetWeight: z.number().min(0).max(500), // kg
  restSeconds: z.number().min(15).max(600),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().max(500).optional()
});
```

**Backend:**
- Firestore: Update `/workouts/{workoutId}/exercises` array
- Optimistic updates (UI updates immediately, syncs to Firestore)

### UI Behavior

**Layout:**
- **Exercise Block:** Card showing exercise name, category
- **Config Row:** Inline-editable fields: Sets | Reps | Weight | Rest
- **Advanced Panel:** Collapsible section for RPE, notes, exercise-specific options

**User Interactions:**
1. User clicks field → Inline input appears with current value selected
2. User types new value → Validation runs on blur
3. Valid input → Auto-save after 500ms → Success indicator (subtle checkmark)
4. Invalid input → Red border, error message, reverts on blur

**UI States:**
- **Editing:** Input focused, blue border
- **Saving:** Subtle spinner in corner
- **Saved:** Brief green checkmark
- **Error:** Red border, error message below field

**Responsive:**
- Mobile: Vertical stack of fields
- Desktop: Horizontal row

### Error Handling

**Validation Errors:**
- Sets < 1 → "Sets must be at least 1"
- Reps > 100 → "Reps must be 1-100"
- Weight > 500 → "Weight must be 0-500 kg"
- Rest < 15 → "Rest must be 15-600 seconds"

**System Errors:**
- Firestore update failure → "Failed to save changes. Retry?"
- Auto-save with retry (3 attempts, exponential backoff)

**Recovery:**
- Failed saves queued and retried
- Offline mode: Changes saved locally, synced on reconnect

### Edge Cases

- **Very fast editing:** Debounce ensures only last value saved
- **Navigate away while editing:** Auto-save triggered on page unload
- **Decimal weights:** Allowed (e.g., 82.5 kg)

### Dependencies

**Requires:**
- Exercise added to workout

**Blocks:**
- Workout Execution (needs configured sets/reps/weight)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Validation schema (valid/invalid inputs)
- Debounce logic
- Input parsing (handle "8-12" format)

**Integration Tests:**
- Auto-save triggers Firestore update
- Optimistic UI updates

**E2E Tests:**
- Edit sets → Verify auto-save → Reload page → Verify persisted
- Invalid input → Verify error → Blur → Verify revert
- Rapid edits → Verify debounce (only last value saved)

---

## Function 3.3: Drag & Drop Reordering

### User Story
**As a** user building a workout
**I want to** reorder exercises by dragging and dropping
**So that** I can organize my workout in the optimal sequence

### Acceptance Criteria

**Scenario 1: Drag Exercise to Reorder**
- **Given** I have 3 exercises in workout: Bench Press, Squat, Deadlift
- **When** I drag "Squat" above "Bench Press"
- **Then** Order changes to: Squat, Bench Press, Deadlift
- **And** Order is saved to Firestore

**Scenario 2: Visual Feedback During Drag**
- **Given** I start dragging an exercise
- **When** The drag is in progress
- **Then** Dragged item has elevated shadow and reduced opacity
- **And** Drop zones highlighted with blue border
- **And** Other exercises shift to show insertion point

**Scenario 3: Cancel Drag (ESC or Drop Outside)**
- **Given** I start dragging "Bench Press"
- **When** I press ESC or drag outside valid drop zone
- **Then** Drag cancels, exercise returns to original position
- **And** No Firestore update triggered

**Scenario 4: Drag Handles (Touch-Friendly)**
- **Given** I am on mobile device
- **When** I see exercise cards
- **Then** Each card has a drag handle icon (6 dots)
- **And** Dragging only works when touching the handle (prevents accidental drags)

**Scenario 5: Keyboard Accessibility**
- **Given** I am using keyboard navigation
- **When** I focus on an exercise and press Space
- **Then** Drag mode activates
- **And** Arrow keys move exercise up/down
- **And** Space/Enter confirms, ESC cancels

### Technical Requirements

**Frontend:**
- Library: **@dnd-kit/core** + **@dnd-kit/sortable**
- Components: `DndContext`, `SortableContext`, `useSortable` hook
- Accessibility: Full keyboard support, screen reader announcements

**Implementation:**
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

// In WorkoutBuilder component
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setExercises((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
    // Auto-save to Firestore after reorder
  }
};
```

**Backend:**
- Firestore: Update workout document with new exercise order
- Each exercise has `order` field (0, 1, 2, ...)

### UI Behavior

**Layout:**
- Exercise cards stacked vertically
- Drag handle (⠿ icon) on left of each card
- Drop zones appear between cards during drag

**User Interactions:**
1. User grabs drag handle → Cursor changes to grab
2. User drags → Item lifts (shadow + opacity), drop zones highlight
3. User drops → Smooth animation to new position → Auto-save

**UI States:**
- **Idle:** Normal card appearance
- **Dragging (active item):** Elevated, semi-transparent
- **Dragging (other items):** Shift smoothly to show drop zone
- **Drop zone:** Blue dashed border

**Responsive:**
- Mobile: Larger drag handles (48px touch target)
- Desktop: Smaller handles (24px)

### Error Handling

**System Errors:**
- Firestore save failure → Optimistic UI update reverts → Toast: "Failed to save order. Retry?"

**Recovery:**
- Auto-retry on failure (3 attempts)
- If persistent failure, order locked until reconnect

### Edge Cases

- **Single exercise:** Drag disabled (no reordering needed)
- **Drag between cycles:** Supported (moves exercise to different cycle)
- **Rapid drags:** Debounced save (500ms)

### Dependencies

**Requires:**
- Exercises added to workout

**Blocks:**
- None (reordering is optional)

**External Dependencies:**
- @dnd-kit/core, @dnd-kit/sortable

### Testing Considerations

**Unit Tests:**
- Array reordering logic (arrayMove)
- Order field updates

**Integration Tests:**
- Drag event triggers Firestore update
- Order persists after reload

**E2E Tests:**
- Drag exercise from position 2 to position 0 → Verify order
- Keyboard navigation: Focus, Space, Arrow keys, Enter → Verify reorder
- Accessibility: Screen reader announces drag start/end

---

## Function 3.4: Workout Templates (Save & Reuse)

### User Story
**As a** user who trains with similar workouts
**I want to** save my workouts as templates
**So that** I can quickly create new workouts without rebuilding from scratch

### Acceptance Criteria

**Scenario 1: Save Workout as Template**
- **Given** I have created a workout with 5 exercises
- **When** I click "Save as Template" and enter name "Push Day A"
- **Then** The workout is saved with `isTemplate: true` flag
- **And** It appears in my Templates list

**Scenario 2: Create Workout from Template**
- **Given** I have a template "Push Day A"
- **When** I click "Use Template" in the template list
- **Then** A new workout is created with identical exercise configuration
- **And** I can edit this workout without affecting the template

**Scenario 3: Update Existing Template**
- **Given** I have a template "Push Day A"
- **When** I make changes and click "Update Template"
- **Then** The template is updated with new configuration
- **And** Previously created workouts from this template are NOT affected

**Scenario 4: Delete Template**
- **Given** I have a template I no longer use
- **When** I click "Delete Template" and confirm
- **Then** Template is deleted from Firestore
- **And** Workouts created from this template remain unaffected

**Scenario 5: Template Library View**
- **Given** I have 10 saved templates
- **When** I navigate to Templates tab
- **Then** I see all templates in a grid/list
- **And** Each shows: name, exercise count, last modified date
- **And** I can search/filter templates

### Technical Requirements

**Frontend:**
- Component: `WorkoutTemplates` page, `TemplateCard` component
- Location: `src/app/templates/page.tsx` (or within workout builder)
- State: React Query for template fetching

**Backend:**
- Firestore Collection: Same `/workouts/{workoutId}` collection
- Template Flag: `{ isTemplate: true, userId: string }`
- Security Rules: Users can only CRUD their own templates

**Firestore Document:**
```typescript
interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  isTemplate: true; // Differentiates from regular workouts
  exercises: WorkoutExercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[]; // e.g., ["push", "hypertrophy"]
}
```

**Create from Template Logic:**
```typescript
const createFromTemplate = async (templateId: string) => {
  const template = await getWorkout(templateId);
  const newWorkout = {
    ...template,
    id: nanoid(), // New ID
    isTemplate: false, // This is a regular workout
    createdAt: serverTimestamp(),
    name: `${template.name} - ${new Date().toLocaleDateString()}`
  };
  await saveWorkout(newWorkout);
  return newWorkout.id;
};
```

### UI Behavior

**Layout:**
- **Templates Page:** Grid of template cards (2 cols mobile, 3-4 cols desktop)
- **Template Card:** Name, exercise count, preview (first 3 exercises), "Use Template" button
- **Search Bar:** Top of page for filtering templates

**User Interactions:**
1. User builds workout → Clicks "Save as Template" → Modal opens
2. User enters template name → Clicks "Save" → Template created
3. User navigates to Templates → Browses templates
4. User clicks "Use Template" → New workout created → Redirected to workout builder

**UI States:**
- **Loading:** Skeleton template cards
- **Empty:** "No templates yet. Save your first workout as a template!"
- **Success (save):** Toast: "Template saved successfully"
- **Success (use):** Toast: "Workout created from template"

**Responsive:**
- Mobile: 2 col grid, full-width cards
- Desktop: 3-4 col grid

### Error Handling

**Validation Errors:**
- Empty template name → "Template name is required"
- Duplicate name → Warning: "Template with this name exists. Save anyway?"

**System Errors:**
- Firestore save failure → "Failed to save template. Retry?"
- Network error → Queue for offline sync

**Recovery:**
- Retry mechanism for failed saves
- Templates cached locally for offline access

### Edge Cases

- **Very long template names:** Truncate with ellipsis
- **Template with 0 exercises:** Allowed (useful for starting point)
- **Delete template while someone is using it:** No effect (new workout already created)

### Dependencies

**Requires:**
- Authentication (templates are user-scoped)
- Workout Builder (templates created from built workouts)

**Blocks:**
- None (templates are optional)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Template creation logic
- Clone workout from template

**Integration Tests:**
- Save template → Firestore document created
- Use template → New workout document created

**E2E Tests:**
- Build workout → Save as template → Navigate to templates → Verify exists
- Use template → Verify new workout created → Edit → Verify template unchanged
- Delete template → Verify removed from list

---

## Function 3.5: Cycle System (Supersets/Circuits)

### User Story
**As a** user who trains with supersets and circuits
**I want to** group exercises into cycles with shared rest periods
**So that** I can efficiently organize and execute compound training methods

### Acceptance Criteria

**Scenario 1: Create Cycle (Superset)**
- **Given** I have added "Bench Press" and "Bent-over Row" to workout
- **When** I select both exercises and click "Create Cycle"
- **Then** A cycle is created containing both exercises
- **And** The cycle has a shared rest period (default: 120s)
- **And** Visual grouping shows these exercises belong to same cycle

**Scenario 2: Add Exercise to Existing Cycle**
- **Given** I have a cycle with "Bench Press" and "Row"
- **When** I add "Face Pull" to workout
- **Then** I can drag "Face Pull" into the existing cycle
- **And** It becomes the 3rd exercise in that cycle

**Scenario 3: Reorder Exercises Within Cycle**
- **Given** A cycle has "Bench Press" (1st), "Row" (2nd), "Face Pull" (3rd)
- **When** I drag "Row" to first position within the cycle
- **Then** Order changes to: Row, Bench Press, Face Pull
- **And** Cycle structure maintained

**Scenario 4: Remove Exercise from Cycle**
- **Given** A cycle with 3 exercises
- **When** I remove "Face Pull" from the cycle
- **Then** Face Pull becomes a standalone exercise (outside any cycle)
- **And** The cycle still contains the other 2 exercises

**Scenario 5: Delete Entire Cycle**
- **Given** A cycle with 3 exercises
- **When** I click "Delete Cycle" and confirm
- **Then** All 3 exercises become standalone (ungrouped)
- **And** They retain their individual configurations

**Scenario 6: Cycle Rest Time Configuration**
- **Given** A cycle exists
- **When** I set cycle rest time to 90 seconds
- **Then** After completing all exercises in the cycle, user rests 90s before next cycle/exercise
- **And** Individual exercise rest times within cycle are ignored (or shown as "0s - cycle rest applies")

### Technical Requirements

**Frontend:**
- Components: `CycleBuilder`, `DraggableCycle`
- Location: `src/components/workout-builder/cycle-builder.tsx`, `draggable-cycle.tsx`
- Drag & Drop: @dnd-kit supports nested sortable contexts (cycles within workout)

**Backend:**
- Firestore: Nested structure in workout document

**Data Structure:**
```typescript
interface Cycle {
  id: string;
  name?: string; // Optional cycle name (e.g., "Chest/Back Superset")
  type: 'superset' | 'circuit' | 'straight_set'; // Cycle type
  restSeconds: number; // Rest after completing all exercises in cycle
  exercises: WorkoutExercise[]; // Exercises in this cycle
}

interface Workout {
  id: string;
  name: string;
  cycles: Cycle[]; // Workout is a list of cycles
  // ... other fields
}
```

**Cycle Types:**
- **Straight Set:** Single exercise (no grouping)
- **Superset:** 2-3 exercises, alternating with minimal rest
- **Circuit:** 3+ exercises, performed in sequence

### UI Behavior

**Layout:**
- **Cycle Container:** Card with colored border (e.g., blue for supersets)
- **Cycle Header:** Cycle type icon, name, rest time
- **Exercise List:** Exercises within cycle, vertically stacked
- **Drag Zone:** Exercises can be dragged into/out of cycles

**User Interactions:**
1. User selects multiple exercises → Clicks "Create Cycle" → Cycle dialog opens
2. User chooses cycle type (superset/circuit) → Enters rest time → Confirms
3. Cycle created, exercises grouped visually
4. User can drag new exercises into cycle drop zone

**UI States:**
- **Cycle Active:** Blue border, grouped exercises visible
- **Dragging into Cycle:** Drop zone highlighted
- **Empty Cycle:** "Add exercises to this cycle" placeholder

**Responsive:**
- Mobile: Full-width cycle cards
- Desktop: Compact cycle cards with side-by-side exercises (if space allows)

### Error Handling

**Validation Errors:**
- Cycle with < 2 exercises → "Cycles must have at least 2 exercises"
- Create cycle without selecting exercises → "Select exercises first"

**System Errors:**
- Firestore save failure → "Failed to save cycle. Retry?"

**Recovery:**
- Optimistic UI updates with retry on failure

### Edge Cases

- **Nested cycles:** Not supported (cycles cannot contain other cycles)
- **Drag cycle as whole:** Supported (drag cycle header to reorder entire cycle)
- **Very long cycle names:** Truncate with ellipsis

### Dependencies

**Requires:**
- Exercises added to workout
- Drag & Drop infrastructure

**Blocks:**
- Workout Execution (cycles affect rest period logic)

**External Dependencies:**
- @dnd-kit

### Testing Considerations

**Unit Tests:**
- Cycle creation logic
- Add/remove exercise to/from cycle
- Cycle rest time configuration

**Integration Tests:**
- Create cycle → Firestore document structure correct
- Drag exercise into cycle → Updates persisted

**E2E Tests:**
- Add 2 exercises → Create superset → Verify grouped
- Add 3rd exercise to cycle → Verify order
- Drag cycle to reorder in workout → Verify position
- Delete cycle → Verify exercises become standalone

---

## Module-Level Requirements

### Performance Requirements
- Workout builder page load: <1.5s (includes exercise library fetch)
- Drag & drop responsiveness: <16ms frame time (60 FPS)
- Auto-save debounce: 500ms (balance between UX and Firestore write costs)
- Template creation: <1s

### Security Requirements
- User can only CRUD their own workouts and templates
- Firestore Security Rules enforce user-scoped access:
  ```javascript
  match /workouts/{workoutId} {
    allow read, write: if request.auth.uid == resource.data.userId;
  }
  ```
- Input sanitization: All user inputs validated with Zod schemas

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Full drag-and-drop keyboard support (Space to grab, Arrow keys to move, Enter to drop)
- Screen reader: Announces drag start/end, exercise addition, validation errors
- Focus management: Logical tab order, focus trapped in modals

### Browser/Platform Support
- All modern browsers (Chrome 111+, Firefox 128+, Safari 16.4+, Edge 111+)
- Responsive: Mobile-first design, works on 320px to 4K displays
- Touch gestures: Drag & drop optimized for touch (larger hit areas, visual feedback)

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 3.1: Exercise Selection (foundation - get exercises into workout)
2. Function 3.2: Set/Rep Configuration (make exercises configurable)
3. Function 3.3: Drag & Drop Reordering (add flexibility)
4. Function 3.4: Templates (productivity feature)
5. Function 3.5: Cycle System (advanced feature, requires solid foundation)

**Estimated Effort:**
- Function 3.1: 5-7 hours / 5 story points
- Function 3.2: 6-8 hours / 5 story points
- Function 3.3: 8-10 hours / 8 story points (drag & drop complexity)
- Function 3.4: 4-6 hours / 5 story points
- Function 3.5: 6-8 hours / 8 story points (complex nested drag & drop)
- **Total Module Estimate:** 29-39 hours / 31 story points

**Technical Risks & Mitigation:**
- **Risk:** @dnd-kit learning curve and nested sortable complexity
  **Mitigation:** Reference official examples, start with simple drag & drop, incrementally add nesting
- **Risk:** Firestore write costs with aggressive auto-save
  **Mitigation:** Debounce saves (500ms), batch updates, use offline persistence
- **Risk:** Complex state management with cycles + drag & drop
  **Mitigation:** Use reducer pattern for state updates, thorough testing

**Dependencies on External Factors:**
- @dnd-kit library stability (generally stable, v6+ is production-ready)
- Firestore query performance (fast for small datasets <1000 workouts)

---

## Related Documentation

- [Architecture - Data Model](../core/04_ARCHITECTURE.md#data-model)
- [Exercise Library Requirements](./02_exercise_library_requirements.md)
- [Workout Execution Requirements](./05_workout_execution_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development
