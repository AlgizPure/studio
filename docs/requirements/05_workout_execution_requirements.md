# Workout Execution Module Requirements

**Module ID:** Module 5
**Total Functions:** 7
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Workout Builder, Program Management

---

## Overview

The Workout Execution module transforms planned workouts into interactive, real-time training sessions. This is where users actually perform their training, logging each set, rest period, and perceived exertion in real-time. The execution mode provides a focused, distraction-free interface optimized for use in the gym.

Real-time tracking ensures data integrity (no retroactive logging errors), while features like automatic rest timers, RPE sliders, and exercise notes enhance the training experience. All logged data is immediately persisted to Firestore, feeding into analytics and AI recommendation systems.

**Key Capabilities:**
- Dedicated execution mode UI (fullscreen, minimal distractions)
- Set-by-set tracking: weight, reps, RPE per set
- Automatic rest timer with notifications
- RPE (Rate of Perceived Exertion) input via slider (1-10 scale)
- Exercise and workout notes (form cues, observations)
- Workout completion with summary and feedback tags
- Optimistic UI updates with offline support

**Integration Points:**
- **Workout Builder:** Executes workouts created in the builder
- **Program Management:** Executes scheduled program workouts
- **Workout History:** Completed workouts saved to history
- **Analytics:** Logged data feeds progression charts
- **AI Integration:** Performance data used for AI recommendations
- **Firestore:** `/workoutLogs/{logId}` collection for persistence

---

## Function 5.1: Execution Mode UI

### User Story
**As a** user in the gym
**I want** a focused, fullscreen execution interface
**So that** I can follow my workout without distractions and easily log each set

### Acceptance Criteria

**Scenario 1: Start Workout Execution**
- **Given** I have a workout "Push Day A" scheduled for today
- **When** I click "Start Workout" on the dashboard or schedule page
- **Then** Execution mode launches with fullscreen/maximized view
- **And** I see the first exercise: "Barbell Bench Press - 4 sets x 8-12 reps"
- **And** UI shows: Exercise name, sets/reps target, weight target, current set (1/4)

**Scenario 2: Exercise Card Layout**
- **Given** I am in execution mode
- **When** I view an exercise card
- **Then** I see:
  - Exercise name (large, bold)
  - Muscle groups + equipment (smaller text)
  - Set tracker: "Set 1 of 4" with progress bar
  - Weight input field (kg)
  - Reps input field
  - RPE slider (1-10)
  - "Complete Set" button (prominent, green)
  - "Skip Exercise" button (small, secondary)

**Scenario 3: Navigation Between Exercises**
- **Given** I completed all sets for "Bench Press"
- **When** The exercise is complete
- **Then** UI automatically advances to next exercise: "Incline Dumbbell Press"
- **And** Brief success animation/feedback
- **When** I swipe left or click "Next Exercise" manually
- **Then** I can advance early (useful if skipping)

**Scenario 4: Workout Progress Indicator**
- **Given** I am executing a 5-exercise workout
- **When** I complete 2 exercises
- **Then** I see progress: "2 of 5 exercises complete (40%)"
- **And** Progress bar at top of screen fills 40%
- **And** Time elapsed: "15:32" (minutes:seconds)

**Scenario 5: Exit Execution Mode**
- **Given** I am in the middle of a workout
- **When** I click "Exit" button
- **Then** Confirmation modal: "Exit workout? Progress will be saved as incomplete."
- **And** Options:
  - "Save & Exit" (saves current progress)
  - "Discard & Exit" (deletes log)
  - "Cancel" (stays in execution mode)

### Technical Requirements

**Frontend:**
- Component: `WorkoutExecutionMode`, `ExerciseExecutionCard`, `SetTracker`
- Location: `src/components/workout-execution/workout-execution-mode.tsx`
- Fullscreen: CSS-based fullscreen UI (not browser fullscreen API)
- State: Local state + React Query for workout data

**Backend:**
- Firestore: Create `/workoutLogs/{logId}` document on start
- Optimistic updates: UI updates immediately, syncs to Firestore every 10s or on set complete

**Data Structure:**
```typescript
interface WorkoutLog {
  id: string;
  userId: string;
  workoutId: string; // Reference to workout template
  workoutName: string;
  programId?: string; // If part of program
  weekNumber?: number;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'in_progress' | 'completed' | 'abandoned';
  exercises: ExerciseLog[];
  overallRating?: number; // 1-5 stars (post-workout)
  notes?: string;
  feedbackTags?: string[]; // e.g., ["great-session", "felt-strong"]
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetLog[];
  notes?: string;
}

interface SetLog {
  setNumber: number; // 1, 2, 3, 4
  weight: number; // kg
  reps: number;
  rpe?: number; // 1-10
  skipped: boolean; // true if user skipped this set
  completedAt: Timestamp;
}
```

### UI Behavior

**Layout:**
- **Fullscreen/Maximized:** Minimal chrome, focuses on current exercise
- **Top Bar:** Progress (2/5), time elapsed, exit button
- **Main Area:** Current exercise card (large)
- **Bottom Navigation:** "Previous Exercise" | "Next Exercise" buttons

**User Interactions:**
1. User starts workout → Execution mode loads → First exercise shown
2. User enters weight, reps for Set 1 → Clicks "Complete Set" → Set logged
3. Rest timer starts automatically → User proceeds to Set 2
4. After all sets → Auto-advance to next exercise

**UI States:**
- **Loading:** Skeleton while fetching workout
- **Active Set:** Input fields enabled, "Complete Set" button active
- **Resting:** Input fields disabled, rest timer counting down
- **Exercise Complete:** Green checkmark, "Next Exercise" button
- **Workout Complete:** Summary screen

**Responsive:**
- Mobile: Full-screen, touch-optimized (large buttons)
- Tablet: Optimized layout with larger fonts
- Desktop: Maximized window, keyboard shortcuts

### Error Handling

**Validation Errors:**
- Empty weight/reps → "Weight and reps are required"
- Weight < 0 or > 500kg → "Invalid weight"
- Reps < 1 or > 100 → "Reps must be 1-100"

**System Errors:**
- Firestore save failure → Retry with exponential backoff → If persistent, queue for offline sync
- Network offline → Toast: "Offline mode - data will sync when connected"

**Recovery:**
- Auto-save every 10 seconds to Firestore
- Local storage backup in case of crash
- Resume workout: If user closes tab mid-workout, offer to resume on return

### Edge Cases

- **Phone call/interruption mid-workout:** Pause timer automatically when app goes to background
- **Very long workout (3+ hours):** Supported, but warn user if exceeding typical duration
- **Skip entire exercise:** Allowed, exercise marked as skipped in log

### Dependencies

**Requires:**
- Authentication
- Workout exists (created in Workout Builder or from Program)

**Blocks:**
- Workout History (logs are created here)
- Analytics (performance data generated here)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Workout log creation
- Set completion logic
- Progress calculation

**Integration Tests:**
- Start workout → Firestore document created
- Complete set → Document updated

**E2E Tests:**
- Start workout → Complete 2 sets → Exit → Resume → Verify sets persisted
- Complete workout → Verify status = 'completed'

---

## Function 5.2: Set-by-Set Tracking

### User Story
**As a** user performing a workout
**I want to** log weight, reps, and RPE for each set
**So that** I have accurate performance data for tracking progress

### Acceptance Criteria

**Scenario 1: Log First Set**
- **Given** I am on "Bench Press" Set 1 of 4
- **When** I perform the set with 100kg for 10 reps
- **Then** I enter: Weight = 100, Reps = 10
- **And** I optionally set RPE to 8 (using slider)
- **And** I click "Complete Set"
- **Then** Set 1 is logged with timestamp
- **And** UI advances to Set 2
- **And** Rest timer starts (60s default for this exercise)

**Scenario 2: Pre-fill from Previous Set**
- **Given** I completed Set 1: 100kg x 10 reps, RPE 8
- **When** Set 2 UI loads
- **Then** Weight field pre-filled with "100" (same as Set 1)
- **And** Reps field pre-filled with "10"
- **And** RPE slider at 8
- **And** I can adjust if I did 9 reps this set (fatigue)

**Scenario 3: Skip Set**
- **Given** I am on Set 3 but feeling fatigued
- **When** I click "Skip Set"
- **Then** Confirmation: "Skip Set 3? This set will be marked as skipped."
- **And** I confirm → Set marked as `skipped: true`, no weight/reps logged
- **And** UI advances to Set 4

**Scenario 4: Edit Previous Set (Correction)**
- **Given** I completed Set 2 but entered wrong reps (typed 12 instead of 10)
- **When** I click "Edit Set 2" in the set history panel
- **Then** Set 2 fields become editable
- **And** I change reps to 10 → Click "Save"
- **Then** Set 2 updated in Firestore

**Scenario 5: View Set History During Workout**
- **Given** I am on Set 4
- **When** I expand "Set History" panel
- **Then** I see:
  - Set 1: 100kg x 10 reps, RPE 8
  - Set 2: 100kg x 9 reps, RPE 8.5
  - Set 3: 100kg x 8 reps, RPE 9
  - Set 4: [Current] 100kg x __ reps (in progress)
- **And** I can see progression/regression within workout

### Technical Requirements

**Frontend:**
- Component: `SetTracker`, `SetLogInput`
- Location: `src/components/workout-execution/set-tracker.tsx`
- Input: Number inputs for weight/reps, Slider for RPE
- Validation: Zod schema

**Zod Schema:**
```typescript
const setLogSchema = z.object({
  weight: z.number().min(0).max(500),
  reps: z.number().min(1).max(100),
  rpe: z.number().min(1).max(10).optional(),
  skipped: z.boolean().default(false)
});
```

**Backend:**
- Firestore: Update `/workoutLogs/{logId}/exercises/{exerciseIndex}/sets` array
- Optimistic update: Add set to local state immediately, sync to Firestore

**Auto-fill Logic:**
```typescript
const getNextSetDefaults = (previousSets: SetLog[]) => {
  if (previousSets.length === 0) {
    // First set: use workout template defaults
    return { weight: exercise.targetWeight, reps: exercise.targetReps };
  }

  // Subsequent sets: copy previous set
  const lastSet = previousSets[previousSets.length - 1];
  return { weight: lastSet.weight, reps: lastSet.reps, rpe: lastSet.rpe };
};
```

### UI Behavior

**Layout:**
- **Set Input Card:** Large, centered on screen
- **Fields:** Weight (number), Reps (number), RPE (slider with emoji feedback)
- **Complete Button:** Large, green, "Complete Set X"
- **Set History:** Collapsible panel below showing completed sets

**User Interactions:**
1. User enters weight → Tabs to reps → Adjusts RPE → Clicks "Complete Set"
2. Set logged → Rest timer starts → UI auto-advances to next set
3. User can edit previous sets if needed

**UI States:**
- **Input Active:** Fields enabled, button enabled
- **Invalid Input:** Red border, button disabled, error message
- **Saving:** Brief spinner on "Complete Set" button
- **Saved:** Green checkmark animation

**Responsive:**
- Mobile: Vertical stack, large touch inputs
- Desktop: Horizontal layout, keyboard shortcuts (Enter to complete set)

### Error Handling

**Validation Errors:**
- Empty fields → "Weight and reps are required"
- Invalid values → "Weight must be 0-500kg, Reps must be 1-100"

**System Errors:**
- Firestore update failure → Retry, queue for offline sync

**Recovery:**
- Auto-retry failed updates
- Local storage backup

### Edge Cases

- **0 kg weight (bodyweight):** Allowed
- **Very high reps (50+):** Allowed (e.g., bodyweight squats)
- **Decimal weights:** Allowed (82.5kg)

### Dependencies

**Requires:**
- Execution Mode active

**Blocks:**
- Analytics (needs set data)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Set log validation
- Auto-fill logic

**Integration Tests:**
- Complete set → Firestore updated
- Edit set → Update persisted

**E2E Tests:**
- Complete 4 sets → Verify all logged → View set history → Verify accurate

---

## Function 5.3: Rest Timer

### User Story
**As a** user resting between sets
**I want** an automatic countdown timer
**So that** I rest consistently and don't waste time checking my phone

### Acceptance Criteria

**Scenario 1: Automatic Rest Timer Start**
- **Given** I completed Set 1 of Bench Press (rest time: 60s)
- **When** Set 1 is marked complete
- **Then** Rest timer starts automatically: "60s" countdown
- **And** Large countdown display appears: "59... 58... 57..."
- **And** Notification (if permissions granted): "Rest time: 60s"

**Scenario 2: Timer Countdown Display**
- **Given** Rest timer is active
- **When** Counting down
- **Then** I see large timer: "00:45" (MM:SS)
- **And** Progress ring animates (visual countdown)
- **And** At 10s remaining: Timer turns yellow (warning)
- **And** At 0s: Timer turns green, chime sound (if enabled)

**Scenario 3: Adjust Rest Time Mid-Timer**
- **Given** Timer is at 30s remaining
- **When** I click "+15s" button
- **Then** Timer adds 15 seconds: now 45s remaining
- **When** I click "-15s" button
- **Then** Timer subtracts 15s: now 30s remaining
- **And** Minimum timer: 0s (doesn't go negative)

**Scenario 4: Skip Rest (Start Next Set Early)**
- **Given** Rest timer is at 40s remaining
- **When** I feel recovered and click "Skip Rest"
- **Then** Timer stops immediately
- **And** UI advances to next set input
- **And** I can start Set 2 early

**Scenario 5: Pause/Resume Timer**
- **Given** Rest timer is active
- **When** I click "Pause" button
- **Then** Timer pauses at current time (e.g., 35s)
- **When** I click "Resume"
- **Then** Timer continues from 35s

**Scenario 6: Background Timer (App Minimized)**
- **Given** Rest timer is running at 50s
- **When** I minimize the app or switch tabs
- **Then** Timer continues in background
- **And** At 0s: Browser notification "Rest complete - start next set!" (if permissions granted)
- **When** I return to app
- **Then** Timer shows correct time (synced)

### Technical Requirements

**Frontend:**
- Component: `RestTimer`
- Location: `src/components/workout-execution/rest-timer.tsx`
- Timer Logic: JavaScript `setInterval`, synchronized with `Date.now()` to prevent drift
- Notifications: Browser Notification API (requires user permission)

**Timer Implementation:**
```typescript
const useRestTimer = (durationSeconds: number) => {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const endTimeRef = useRef<number>();

  useEffect(() => {
    endTimeRef.current = Date.now() + (durationSeconds * 1000);

    const interval = setInterval(() => {
      if (isPaused) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        playChime(); // Audio feedback
        sendNotification("Rest complete!"); // Browser notification
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [durationSeconds, isPaused]);

  return { timeRemaining, isPaused, setIsPaused };
};
```

**Notification:**
```typescript
const sendNotification = (message: string) => {
  if (Notification.permission === 'granted') {
    new Notification('Zenith Trainer', { body: message, icon: '/icon.png' });
  }
};

// Request permission on first workout start
const requestNotificationPermission = async () => {
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};
```

### UI Behavior

**Layout:**
- **Timer Display:** Large (80px font), centered, MM:SS format
- **Progress Ring:** Circular progress indicator around timer
- **Controls:** +15s, -15s, Pause/Resume, Skip buttons below timer

**User Interactions:**
1. Set complete → Timer starts → Large countdown display
2. User can adjust, pause, or skip
3. At 0s → Chime + notification → Auto-advance to next set input

**UI States:**
- **Counting:** Blue progress ring, black timer text
- **Warning (≤10s):** Yellow ring, orange text
- **Complete (0s):** Green ring, green text, chime sound
- **Paused:** Gray ring, "Paused" label

**Responsive:**
- Mobile: Full-width timer, large touch buttons
- Desktop: Centered timer, keyboard shortcuts (Space to pause/resume)

### Error Handling

**System Errors:**
- Notification permission denied → Fallback to visual-only (no error shown)
- Tab backgrounded (mobile): Timer continues, notification sent

**Recovery:**
- Timer drift correction: Sync with `Date.now()` every 1s to prevent accumulation errors

### Edge Cases

- **Very long rest (300s+):** Supported, but warn if exceeding typical rest times
- **Multiple tabs open:** Only active tab runs timer (prevent duplicates)
- **Browser crash mid-timer:** Timer resets on reload (acceptable trade-off)

### Dependencies

**Requires:**
- Execution Mode active
- Set completed

**Blocks:**
- None (timer is enhancement)

**External Dependencies:**
- Browser Notification API (optional)

### Testing Considerations

**Unit Tests:**
- Timer countdown logic
- Pause/resume functionality
- Adjust time (+/-15s)

**Integration Tests:**
- Timer completes → Notification sent

**E2E Tests:**
- Complete set → Verify timer starts → Wait for 0s → Verify chime/notification
- Adjust timer → Verify time changes
- Pause → Resume → Verify accurate time

---

## Function 5.4: RPE Input (Rate of Perceived Exertion)

### User Story
**As a** user tracking training intensity
**I want to** rate the difficulty of each set using RPE (1-10 scale)
**So that** I can track intensity progression and avoid overtraining

### Acceptance Criteria

**Scenario 1: RPE Slider Input**
- **Given** I am logging Set 1 of Bench Press
- **When** I see the RPE input field
- **Then** A slider appears with range 1-10
- **And** Default position: 7 (moderate intensity)
- **And** As I move slider: emoji feedback (😊 at 1, 😰 at 10)
- **And** Current value displayed: "RPE: 8"

**Scenario 2: RPE Visual Feedback**
- **Given** I move the RPE slider
- **Then** I see emoji feedback:
  - RPE 1-3: 😊 "Easy"
  - RPE 4-6: 🙂 "Moderate"
  - RPE 7-8: 😅 "Challenging"
  - RPE 9: 😰 "Very Hard"
  - RPE 10: 🥵 "Maximum Effort"
- **And** Slider color changes: Green (1-6) → Yellow (7-8) → Red (9-10)

**Scenario 3: Optional RPE Entry**
- **Given** I am logging a set
- **When** I don't move the RPE slider
- **Then** RPE is saved as `undefined` (optional field)
- **And** Set can still be completed without RPE
- **When** I do set RPE
- **Then** It's saved with the set

**Scenario 4: View RPE History**
- **Given** I completed 4 sets with RPE: [8, 8.5, 9, 9.5]
- **When** I view set history panel
- **Then** Each set shows RPE with emoji: "Set 1: 100kg x 10, RPE 8 😅"
- **And** I can see RPE progression (increasing fatigue)

**Scenario 5: RPE in Analytics (Future)**
- **Given** I have logged multiple workouts with RPE
- **When** I view analytics
- **Then** I see average RPE over time: "Avg RPE: 8.2 (last 4 weeks)"
- **And** Charts showing RPE trends
- **And** AI uses RPE data for recovery recommendations

### Technical Requirements

**Frontend:**
- Component: `RPESlider` (Radix UI Slider component)
- Location: Within `SetTracker` component
- UI: Slider (1-10), emoji feedback, color coding

**Radix UI Slider:**
```typescript
import { Slider } from '@radix-ui/react-slider';

const RPESlider = ({ value, onChange }: { value?: number, onChange: (v: number) => void }) => {
  const [rpe, setRPE] = useState(value || 7);

  return (
    <div>
      <label>RPE (Rate of Perceived Exertion): {rpe} {getEmoji(rpe)}</label>
      <Slider
        min={1}
        max={10}
        step={0.5} // Allow half increments (e.g., 8.5)
        value={[rpe]}
        onValueChange={([v]) => { setRPE(v); onChange(v); }}
        className={`rpe-slider ${getRPEColor(rpe)}`}
      />
      <div className="rpe-labels">
        <span>Easy</span>
        <span>Moderate</span>
        <span>Very Hard</span>
      </div>
    </div>
  );
};

const getEmoji = (rpe: number) => {
  if (rpe <= 3) return '😊';
  if (rpe <= 6) return '🙂';
  if (rpe <= 8) return '😅';
  if (rpe === 9) return '😰';
  return '🥵';
};

const getRPEColor = (rpe: number) => {
  if (rpe <= 6) return 'green';
  if (rpe <= 8) return 'yellow';
  return 'red';
};
```

### UI Behavior

**Layout:**
- **RPE Slider:** Below weight/reps inputs, full-width
- **Emoji Feedback:** Right of slider thumb, large (24px)
- **Labels:** "Easy", "Moderate", "Very Hard" below slider

**User Interactions:**
1. User drags slider → Emoji updates in real-time
2. User releases slider → RPE value captured
3. User completes set → RPE saved with set

**UI States:**
- **Default:** Slider at 7 (middle)
- **Active:** Thumb dragging, emoji animating
- **Saved:** RPE displayed in set history

**Responsive:**
- Mobile: Full-width slider, larger thumb (48px touch target)
- Desktop: Standard slider

### Error Handling

**No errors expected** (RPE is optional, slider is constrained to valid range)

### Edge Cases

- **RPE not set:** Saved as `undefined`, not required
- **Fractional RPE (8.5):** Supported (slider step: 0.5)

### Dependencies

**Requires:**
- Execution Mode active

**Blocks:**
- Analytics (RPE data used for trend analysis)

**External Dependencies:**
- @radix-ui/react-slider

### Testing Considerations

**Unit Tests:**
- Emoji selection logic
- Color coding logic

**E2E Tests:**
- Drag slider → Verify emoji changes
- Complete set with RPE → Verify saved

---

## Function 5.5: Exercise Notes

### User Story
**As a** user tracking form cues and observations
**I want to** add notes to each exercise
**So that** I can remember technique cues, form issues, or observations for next workout

### Acceptance Criteria

**Scenario 1: Add Exercise Notes**
- **Given** I am performing "Bench Press"
- **When** I expand "Exercise Notes" section
- **Then** A text area appears
- **And** I can type: "Elbows felt good, focus on bar path"
- **And** Notes auto-save after 500ms debounce

**Scenario 2: View Previous Workout Notes**
- **Given** I performed this exercise last week with notes: "Lower back tight"
- **When** I start this exercise
- **Then** I see "Previous notes (Nov 8): Lower back tight"
- **And** I can reference previous observations

**Scenario 3: Set-Specific Notes (Optional)**
- **Given** I notice something specific on Set 3
- **When** I add set-specific note: "Failed rep 9, spotter assist"
- **Then** Note attached to Set 3 specifically
- **And** Displayed in set history: "Set 3: 100kg x 8*, RPE 10" (* indicates note)

**Scenario 4: Notes in Workout Summary**
- **Given** I completed workout with exercise notes
- **When** I view workout summary
- **Then** All exercise notes displayed:
  - Bench Press: "Elbows felt good, focus on bar path"
  - Squat: "Hit depth easily, increase weight next week"
- **And** I can review observations

### Technical Requirements

**Frontend:**
- Component: `ExerciseNotes`, collapsible section
- Input: Textarea, auto-resize, max 500 characters
- Auto-save: Debounced (500ms)

**Backend:**
- Firestore: Update `/workoutLogs/{logId}/exercises/{exerciseIndex}/notes` field

**Auto-save:**
```typescript
const useAutoSaveNotes = (workoutLogId: string, exerciseIndex: number) => {
  const [notes, setNotes] = useState('');
  const debouncedSave = useDebouncedCallback((value: string) => {
    updateExerciseNotes(workoutLogId, exerciseIndex, value);
  }, 500);

  const handleChange = (value: string) => {
    setNotes(value);
    debouncedSave(value);
  };

  return { notes, handleChange };
};
```

### UI Behavior

**Layout:**
- **Notes Section:** Collapsible panel below set inputs
- **Textarea:** Auto-resize (min 2 rows, max 8 rows)
- **Previous Notes:** Read-only card above current notes input

**User Interactions:**
1. User expands notes → Textarea appears
2. User types → Auto-save after 500ms
3. User collapses → Notes saved

**UI States:**
- **Collapsed:** "Add notes" link
- **Expanded:** Textarea visible
- **Saving:** Subtle spinner in corner
- **Saved:** Green checkmark

**Responsive:**
- Mobile: Full-width textarea
- Desktop: Standard width

### Error Handling

**Validation Errors:**
- Notes > 500 characters → "Notes limited to 500 characters"

**System Errors:**
- Firestore save failure → Retry, queue for offline sync

**Recovery:**
- Auto-retry failed saves

### Edge Cases

- **Very long notes (500 chars):** Truncated with ellipsis, expandable
- **Special characters/emojis:** Allowed

### Dependencies

**Requires:**
- Execution Mode active

**Blocks:**
- None (notes are optional)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Debounce logic
- Character limit validation

**Integration Tests:**
- Type notes → Auto-save → Verify Firestore updated

**E2E Tests:**
- Add notes → Complete workout → View summary → Verify notes displayed

---

## Function 5.6: Workout Completion

### User Story
**As a** user finishing a workout
**I want to** complete the workout and view a summary
**So that** I can see my performance and save it to history

### Acceptance Criteria

**Scenario 1: Complete All Exercises**
- **Given** I completed all 5 exercises in my workout
- **When** The last set of the last exercise is marked complete
- **Then** Workout auto-transitions to completion screen
- **And** Status changes to `completed`

**Scenario 2: Workout Summary Display**
- **Given** I just completed the workout
- **When** Completion screen loads
- **Then** I see summary:
  - Total time: "45:32"
  - Exercises completed: "5 of 5 (100%)"
  - Sets completed: "18 of 18"
  - Total volume: "4,250 kg" (sum of weight × reps)
  - Average RPE: "8.2"
- **And** List of all exercises with sets/reps

**Scenario 3: Early Completion (Workout Stopped Mid-Way)**
- **Given** I completed 3 of 5 exercises
- **When** I click "Finish Workout Early"
- **Then** Confirmation: "Finish early? Remaining exercises will be marked incomplete."
- **And** I confirm → Workout marked as `completed` with partial data
- **And** Summary shows: "Exercises completed: 3 of 5 (60%)"

**Scenario 4: Save to History**
- **Given** Workout is complete
- **When** Completion screen is shown
- **Then** Workout automatically saved to history (Firestore `/workoutLogs`)
- **And** `endTime` timestamp recorded
- **And** Toast: "Workout saved to history!"

**Scenario 5: Post-Workout Actions**
- **Given** I am on completion screen
- **When** I see action buttons:
  - "View History" → Navigates to workout history
  - "Start Next Workout" → If in program, loads next day's workout
  - "Return to Dashboard" → Go home
- **Then** I can choose next action

### Technical Requirements

**Frontend:**
- Component: `WorkoutCompletionScreen`
- Calculations: Total volume, avg RPE, time elapsed
- Navigation: React Router for post-workout actions

**Backend:**
- Firestore: Update `/workoutLogs/{logId}` with `status: 'completed'`, `endTime`

**Summary Calculations:**
```typescript
const calculateWorkoutSummary = (workoutLog: WorkoutLog) => {
  const totalSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = workoutLog.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => !s.skipped).length, 0
  );
  const totalVolume = workoutLog.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
  }, 0);
  const avgRPE = workoutLog.exercises.reduce((sum, ex) => {
    const exerciseAvgRPE = ex.sets.reduce((s, set) => s + (set.rpe || 0), 0) / ex.sets.length;
    return sum + exerciseAvgRPE;
  }, 0) / workoutLog.exercises.length;

  const duration = (workoutLog.endTime.toMillis() - workoutLog.startTime.toMillis()) / 1000; // seconds

  return {
    duration: formatDuration(duration), // "45:32"
    totalSets,
    completedSets,
    totalVolume: Math.round(totalVolume),
    avgRPE: avgRPE.toFixed(1)
  };
};
```

### UI Behavior

**Layout:**
- **Completion Screen:** Full-screen, celebratory animation (confetti/checkmark)
- **Summary Card:** Centered, shows key metrics
- **Exercise List:** Expandable, shows all exercises with sets
- **Action Buttons:** Bottom, prominent

**User Interactions:**
1. Complete last set → Auto-transition to completion screen
2. User reviews summary
3. User clicks action button → Navigate accordingly

**UI States:**
- **Calculating:** Brief spinner while calculating summary
- **Success:** Summary displayed, celebratory animation
- **Saving:** "Saving to history..." spinner
- **Saved:** "Workout saved!" toast

**Responsive:**
- Mobile: Full-screen, vertical scroll
- Desktop: Centered card (max-width 800px)

### Error Handling

**System Errors:**
- Firestore save failure → Retry, show error: "Failed to save workout. Retrying..." → If persistent: "Workout saved locally, will sync when online."

**Recovery:**
- Auto-retry with exponential backoff
- Offline mode: Queue for sync

### Edge Cases

- **Workout duration < 5 minutes:** Possible (quick session or test)
- **0 sets completed:** Allowed (user started but didn't log any sets)

### Dependencies

**Requires:**
- Workout started (workoutLog exists)

**Blocks:**
- Workout History (logs displayed there)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Summary calculations (volume, avg RPE, duration)

**Integration Tests:**
- Complete workout → Firestore document updated with `status: 'completed'`

**E2E Tests:**
- Complete all exercises → Verify summary displayed → Click "View History" → Verify workout in history

---

## Function 5.7: Post-Workout Feedback Dialog

### User Story
**As a** user who just finished a workout
**I want to** provide quick feedback on how the session felt
**So that** I can track subjective performance for AI analysis

### Acceptance Criteria

**Scenario 1: Feedback Dialog After Completion**
- **Given** I just completed a workout
- **When** Completion screen is shown
- **Then** Feedback dialog overlays: "How was your workout?"
- **And** I see 6 quick-tag options:
  - "Great session" 💪
  - "Felt strong" 🔥
  - "Struggled today" 😓
  - "Good recovery" ✅
  - "New PR!" 🎉
  - "Tired/Fatigued" 😴
- **And** Optional text field: "Additional notes (optional)"

**Scenario 2: Select Feedback Tags**
- **Given** Feedback dialog is open
- **When** I click "Felt strong" and "New PR!"
- **Then** Both tags highlighted (multi-select)
- **And** I can add text: "Hit new 5-rep max on squat!"
- **And** I click "Submit Feedback"
- **Then** Feedback saved to workout log
- **And** Dialog closes, summary screen remains

**Scenario 3: Skip Feedback**
- **Given** Feedback dialog is open
- **When** I click "Skip" button
- **Then** Dialog closes without saving feedback
- **And** Workout summary remains

**Scenario 4: View Feedback in History**
- **Given** I submitted feedback: ["Great session", "Felt strong"] + "Best workout this month"
- **When** I view this workout in history
- **Then** I see feedback tags and note displayed
- **And** AI can use this data for correlations (e.g., "Great session" correlates with good sleep)

### Technical Requirements

**Frontend:**
- Component: `WorkoutFeedbackDialog`
- Location: `src/components/workout-feedback-dialog.tsx`
- UI: Radix UI Dialog, tag buttons (multi-select), textarea

**Backend:**
- Firestore: Update `/workoutLogs/{logId}` with `feedbackTags` and `notes`

**Data Structure:**
```typescript
interface WorkoutLog {
  // ... existing fields
  feedbackTags?: string[]; // ["great-session", "felt-strong", "new-pr"]
  feedbackNotes?: string; // "Hit new 5-rep max on squat!"
  overallRating?: number; // 1-5 stars (optional, future)
}
```

### UI Behavior

**Layout:**
- **Dialog:** Centered modal, semi-transparent backdrop
- **Tags:** 2x3 grid of large buttons with emoji + text
- **Text Field:** Below tags, optional, max 200 chars
- **Buttons:** "Submit Feedback" (primary), "Skip" (secondary)

**User Interactions:**
1. Workout completes → Feedback dialog appears
2. User selects tags (multi-select) → Adds optional text
3. User submits → Feedback saved → Dialog closes

**UI States:**
- **Active Tags:** Blue background, checkmark icon
- **Inactive Tags:** Gray background
- **Submitting:** Spinner on submit button
- **Success:** Dialog closes

**Responsive:**
- Mobile: Full-screen dialog, larger tag buttons
- Desktop: Centered modal (max-width 600px)

### Error Handling

**System Errors:**
- Firestore save failure → Retry, show error: "Failed to save feedback."

**Recovery:**
- Auto-retry

### Edge Cases

- **No tags selected:** Allowed (optional)
- **Very long text (> 200 chars):** Truncated with validation error

### Dependencies

**Requires:**
- Workout completed

**Blocks:**
- AI Integration (feedback used for correlations)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Tag selection logic (multi-select)

**Integration Tests:**
- Submit feedback → Firestore updated

**E2E Tests:**
- Complete workout → Select tags → Submit → View history → Verify feedback displayed

---

## Module-Level Requirements

### Performance Requirements
- Execution mode launch: <1s (load workout + first exercise)
- Set logging: <200ms (optimistic UI + Firestore sync)
- Rest timer accuracy: ±1s over 5 minutes
- Workout summary calculation: <500ms

### Security Requirements
- User can only execute and view their own workouts
- Firestore Security Rules:
  ```javascript
  match /workoutLogs/{logId} {
    allow create: if request.auth.uid == request.resource.data.userId;
    allow read, update: if request.auth.uid == resource.data.userId;
    allow delete: if request.auth.uid == resource.data.userId;
  }
  ```

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Tab through inputs, Enter to complete set, Space to pause timer
- Screen reader: Announces timer countdown, set completion, validation errors
- Large touch targets: 48px minimum for mobile

### Browser/Platform Support
- All modern browsers
- Responsive: Optimized for mobile (primary use case in gym)
- Offline support: Workout logs queued for sync when online

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 5.1: Execution Mode UI (foundation)
2. Function 5.2: Set-by-Set Tracking (core logging)
3. Function 5.3: Rest Timer (enhances UX)
4. Function 5.4: RPE Input (intensity tracking)
5. Function 5.5: Exercise Notes (optional but valuable)
6. Function 5.6: Workout Completion (finalize workflow)
7. Function 5.7: Post-Workout Feedback (AI data collection)

**Estimated Effort:**
- Function 5.1: 6-8 hours / 5 story points
- Function 5.2: 8-10 hours / 8 story points (complex state management)
- Function 5.3: 5-7 hours / 5 story points (timer logic + notifications)
- Function 5.4: 3-4 hours / 3 story points (Radix UI Slider)
- Function 5.5: 3-4 hours / 3 story points (simple textarea + auto-save)
- Function 5.6: 4-6 hours / 5 story points (summary calculations)
- Function 5.7: 3-4 hours / 3 story points (feedback dialog)
- **Total Module Estimate:** 32-43 hours / 32 story points

**Technical Risks & Mitigation:**
- **Risk:** Timer accuracy in background (browser throttling)
  **Mitigation:** Sync with `Date.now()` to prevent drift
- **Risk:** Offline workout logging (network issues in gym)
  **Mitigation:** Local storage backup, queue for sync
- **Risk:** Accidental data loss (user closes tab mid-workout)
  **Mitigation:** Auto-save every 10s, resume workout on return

**Dependencies on External Factors:**
- Browser Notification API support (fallback to visual-only)
- Firestore write performance (optimistic UI mitigates perceived latency)

---

## Related Documentation

- [Architecture - Data Model](../core/04_ARCHITECTURE.md#data-model)
- [Workout Builder Requirements](./03_workout_builder_requirements.md)
- [Workout History Requirements](./06_workout_history_requirements.md)
- [Analytics Requirements](./11_analytics_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development
