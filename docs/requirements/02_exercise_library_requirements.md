# Exercise Library Module Requirements

**Module ID:** Module 2
**Total Functions:** 4
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication, Data Management

---

## Overview

The Exercise Library module provides a comprehensive database of exercises with categorization, filtering, and search capabilities. Users can browse pre-defined exercises and create custom exercises tailored to their training needs.

This module serves as the foundation for the Workout Builder, Program Management, and Workout Execution modules. A well-organized exercise library enables users to quickly find exercises and construct effective training programs.

**Key Capabilities:**
- Browse exercises by category (strength, cardio, flexibility, other)
- Search exercises by name, muscle group, or equipment
- Filter exercises using multiple criteria
- Create custom exercises with detailed specifications
- Share exercises across the platform (pre-defined exercises visible to all users)

**Integration Points:**
- **Authentication:** User identification for custom exercise ownership
- **Workout Builder:** Exercise selection when building workouts
- **Program Management:** Exercise references in programs
- **Workout Execution:** Exercise metadata display during workouts

---

## Function 2.1: Exercise Database

### User Story
**As a** user  
**I want to** browse a comprehensive library of pre-defined exercises  
**So that** I can find exercises for my workouts without manually creating each one

### Acceptance Criteria

**Scenario 1: View Exercise Library**
- **Given** I navigate to the library page
- **When** The page loads
- **Then** I see a list of exercises (default: all categories)
- **And** Each exercise card shows: name, category, primary muscle groups, equipment
- **And** Exercises are sorted alphabetically

**Scenario 2: View Exercise Details**
- **Given** I am viewing the exercise library
- **When** I click on an exercise card
- **Then** A modal/detail view opens
- **And** I see full exercise information: name, category, all muscle groups, equipment, description
- **And** I see an "Add to Workout" button (future feature)

**Scenario 3: Empty State (No Exercises Match Filter)**
- **Given** I apply filters
- **When** No exercises match my criteria
- **Then** I see empty state: "No exercises found. Try adjusting your filters."
- **And** A "Reset Filters" button is shown

### Technical Requirements

**Frontend:**
- Component: `ExerciseLibrary`
- Location: `src/app/library/page.tsx`
- UI: Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)

**Backend:**
- Firestore Collection: `/exercises/{exerciseId}`
- Query: Fetch all exercises (or with filters applied)
- Security Rules: Allow read for all authenticated users

**Exercise Document Schema:**
```typescript
interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'other';
  muscleGroups: string[]; // ['chest', 'triceps', 'shoulders']
  equipment: string[]; // ['barbell', 'bench']
  description?: string;
  videoUrl?: string; // future
  isCustom: boolean; // true = user-created
  userId?: string; // if isCustom, owner's userId
  createdAt: Timestamp;
}
```

### UI Behavior

**Layout:**
- Filter sidebar (left): Category checkboxes, muscle group multi-select, equipment multi-select
- Exercise grid (right): Cards with exercise details
- Search bar (top): Text search by name

**User Interactions:**
1. User scrolls through exercise cards
2. User clicks exercise → Detail modal opens
3. User can filter by category, muscle group, equipment
4. User can search by name (real-time filtering)

**UI States:**
- **Loading:** Skeleton cards while fetching exercises
- **Success:** Exercise cards displayed
- **Empty:** "No exercises found" message
- **Error:** "Failed to load exercises. Retry?" button

**Responsive:**
- Mobile: 1 column, full-width cards
- Tablet: 2 columns
- Desktop: 3-4 columns

### Error Handling

**System Errors:**
- Firestore query failure → "Failed to load exercises. Please try again."
- Network error → "Network error. Check your connection."

**Recovery:**
- Retry button re-fetches exercises

### Edge Cases

- Very long exercise names → Truncate with ellipsis, show full name on hover
- Exercise with no equipment → Show "Bodyweight"
- Exercise with many muscle groups → Show primary 2-3, "+ X more" badge

### Dependencies

**Requires:**
- Authentication (user must be logged in)
- Firestore exercises collection populated

**Blocks:**
- Workout Builder (needs exercises to select)
- Program Management (needs exercises for workouts)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Exercise card rendering with various data
- Filter logic (category, muscle group)
- Search filtering

**Integration Tests:**
- Firestore query returns exercises
- Real-time filter updates

**E2E Tests:**
- Load library → Verify exercises displayed
- Apply filter → Verify filtered results
- Search → Verify search results
- Click exercise → Verify detail modal

---

## Function 2.2: Exercise Categories

### User Story
**As a** user  
**I want to** filter exercises by category (strength, cardio, flexibility, other)  
**So that** I can quickly find the type of exercise I need for my workout

### Acceptance Criteria

**Scenario 1: Filter by Single Category**
- **Given** I am viewing all exercises
- **When** I select "Strength" category filter
- **Then** Only strength exercises are displayed
- **And** The filter badge shows "Category: Strength"

**Scenario 2: Filter by Multiple Categories**
- **Given** I have "Strength" selected
- **When** I also select "Cardio"
- **Then** Both strength and cardio exercises are shown
- **And** Filter badges show both categories

**Scenario 3: Clear Category Filter**
- **Given** I have category filters applied
- **When** I click "Clear Filters" or deselect all categories
- **Then** All exercises are shown again

### Technical Requirements

**Frontend:**
- Component: `CategoryFilter`
- UI: Checkbox list or button group
- State: React useState for selected categories

**Backend:**
- Firestore query: `where('category', 'in', selectedCategories)`
- Client-side filtering (if exercises already fetched)

**Categories:**
- `strength`: Resistance training (squats, bench press, deadlifts, etc.)
- `cardio`: Cardiovascular (running, cycling, rowing, etc.)
- `flexibility`: Stretching, mobility (yoga, stretches, etc.)
- `other`: Miscellaneous (calisthenics, sports-specific, etc.)

### UI Behavior

**Layout:**
- Sidebar filter section: "Category"
- Checkboxes for each category
- Active filter count badge

**User Interactions:**
1. User clicks category checkbox → Filter applies immediately
2. Exercise grid updates with filtered results
3. User can select/deselect multiple categories

**UI States:**
- **Active filter:** Checkbox checked, badge shown
- **Inactive:** Checkbox unchecked
- **Loading:** Skeleton while re-filtering

### Error Handling

**No errors expected** (client-side filtering)

### Edge Cases

- All categories deselected → Show all exercises (no filter)
- Only one category has exercises → Other category filters show (0 results)

### Dependencies

**Requires:**
- Exercise database

**Blocks:**
- None (filtering is enhancement)

**External Dependencies:**
- None

### Testing Considerations

**Unit Tests:**
- Filter logic (single category, multiple categories)
- Clear filters

**E2E Tests:**
- Select category → Verify filtered
- Select multiple → Verify combined results
- Clear → Verify all exercises shown

---

## Function 2.3: Search & Filter

### User Story
**As a** user  
**I want to** search exercises by name, muscle group, or equipment  
**So that** I can quickly find specific exercises I'm looking for

### Acceptance Criteria

**Scenario 1: Search by Name**
- **Given** I am viewing exercises
- **When** I type "bench press" in the search bar
- **Then** Exercises containing "bench press" are shown
- **And** Other exercises are hidden
- **And** Search is case-insensitive

**Scenario 2: Filter by Muscle Group**
- **Given** I select "Chest" muscle group filter
- **When** The filter applies
- **Then** Only exercises targeting chest are shown

**Scenario 3: Filter by Equipment**
- **Given** I select "Barbell" equipment filter
- **When** The filter applies
- **Then** Only exercises using barbell are shown

**Scenario 4: Combined Filters**
- **Given** I search "press" AND filter by "Chest" muscle group
- **When** Both filters apply
- **Then** Only chest exercises with "press" in the name are shown

**Scenario 5: No Results**
- **Given** I search "xyz123nonexistent"
- **When** No exercises match
- **Then** I see "No exercises found. Try different search terms."

### Technical Requirements

**Frontend:**
- Component: `SearchBar` + `FilterPanel`
- Debounced search (300ms delay to avoid excessive re-renders)
- Multi-select filters (muscle group, equipment)

**Backend:**
- Client-side filtering (exercises fetched once, filtered in memory)
- Future: Algolia/Firestore full-text search for scalability

**Filter Logic:**
```typescript
exercises.filter(ex => {
  const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesMuscleGroup = selectedMuscleGroups.length === 0 || 
    ex.muscleGroups.some(mg => selectedMuscleGroups.includes(mg));
  const matchesEquipment = selectedEquipment.length === 0 || 
    ex.equipment.some(eq => selectedEquipment.includes(eq));
  return matchesSearch && matchesMuscleGroup && matchesEquipment;
});
```

### UI Behavior

**Layout:**
- Top: Search bar (prominent, full-width on mobile)
- Sidebar: Muscle group multi-select, equipment multi-select
- Active filters shown as badges (dismissable)

**User Interactions:**
1. User types in search → Real-time filtering (debounced)
2. User selects muscle group → Filter applies
3. User selects equipment → Filter applies
4. User clicks filter badge ✕ → Removes that filter

**UI States:**
- **Active search:** Search input has value, clear button shown
- **Active filters:** Filter badges displayed
- **No results:** Empty state message

### Error Handling

**No critical errors** (client-side filtering)

**Edge Cases:**
- Very long search term → Handle gracefully (no UI break)
- Special characters in search → Sanitize input

### Edge Cases

- Empty search → Show all exercises
- Search + no results → Empty state
- Multiple muscle groups → OR logic (any match)

### Dependencies

**Requires:**
- Exercise database

**Blocks:**
- None

**External Dependencies:**
- None

### Testing Considerations

**Unit Tests:**
- Search filtering logic
- Multi-select filter logic
- Combined filter logic
- Debounce behavior

**E2E Tests:**
- Type search → Verify results update
- Select filters → Verify filtered results
- Clear filters → Verify all shown

---

## Function 2.4: Custom Exercise Creation

### User Story
**As a** user  
**I want to** create custom exercises not in the pre-defined library  
**So that** I can track exercises specific to my training (e.g., specialty movements, machine variants)

### Acceptance Criteria

**Scenario 1: Create Custom Exercise**
- **Given** I click "Create Custom Exercise"
- **When** A form modal opens
- **Then** I can enter: name, category, muscle groups, equipment, description
- **And** I click "Create"
- **Then** The exercise is saved to Firestore
- **And** It appears in my library with a "Custom" badge

**Scenario 2: Validation - Required Fields**
- **Given** I try to create exercise without name
- **When** I submit the form
- **Then** I see validation error: "Exercise name is required"

**Scenario 3: Edit Custom Exercise**
- **Given** I created a custom exercise
- **When** I click "Edit" on the exercise card
- **Then** The form opens pre-filled with current values
- **And** I can update any field
- **And** Changes are saved

**Scenario 4: Delete Custom Exercise**
- **Given** I have a custom exercise
- **When** I click "Delete" and confirm
- **Then** The exercise is removed from Firestore
- **And** It disappears from my library

**Scenario 5: Custom Exercise Visibility**
- **Given** I created a custom exercise
- **When** Another user views the library
- **Then** They do NOT see my custom exercise (user-scoped)

### Technical Requirements

**Frontend:**
- Component: `CreateExerciseDialog`
- Form: React Hook Form + Zod validation
- Multi-select: Muscle groups, equipment

**Zod Schema:**
```typescript
const exerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['strength', 'cardio', 'flexibility', 'other']),
  muscleGroups: z.array(z.string()).min(1, 'Select at least one muscle group'),
  equipment: z.array(z.string()),
  description: z.string().optional(),
});
```

**Backend:**
- Firestore: Create document in `/exercises/` with `isCustom: true`, `userId: currentUser.uid`
- Security Rules: Users can only create/edit/delete their own custom exercises

**Firestore Security Rule:**
```javascript
match /exercises/{exerciseId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}
```

### UI Behavior

**Layout:**
- Button: "Create Custom Exercise" (prominent, top-right)
- Form modal: Fields for all exercise properties
- Submit button: "Create Exercise"

**User Interactions:**
1. User clicks "Create Custom Exercise" → Modal opens
2. User fills form → Real-time validation
3. User clicks "Create" → Loading state → Success
4. Exercise appears in library with "Custom" badge

**UI States:**
- **Loading:** Submit button disabled, spinner
- **Success:** Toast: "Exercise created", modal closes
- **Error:** Alert banner with error message
- **Validation:** Inline field errors

**Responsive:**
- Mobile: Full-screen modal
- Desktop: Centered dialog (max-width 600px)

### Error Handling

**Validation Errors:**
- Empty name → "Exercise name is required"
- No muscle groups selected → "Select at least one muscle group"
- No category → "Select a category"

**System Errors:**
- Firestore write failure → "Failed to create exercise. Please try again."
- Duplicate name (same user) → Warning: "You already have an exercise with this name"

**Recovery:**
- Allow user to correct and retry
- Preserve form data if error occurs

### Edge Cases

- Very long exercise name (>100 chars) → Validation error
- Special characters in name → Allowed
- User creates many custom exercises → Pagination (future)
- Deleting exercise used in workouts → Show warning: "This exercise is used in X workouts. Delete anyway?"

### Dependencies

**Requires:**
- Authentication (custom exercises are user-scoped)
- Firestore write access

**Blocks:**
- None (custom exercises are optional)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Form validation
- Zod schema validation

**Integration Tests:**
- Firestore create/update/delete
- Security rules (user can only modify own exercises)

**E2E Tests:**
- Create custom exercise → Verify appears in library
- Edit custom exercise → Verify changes saved
- Delete custom exercise → Verify removed
- Custom exercise visibility (not shown to other users)

---

## Module-Level Requirements

### Performance Requirements
- Exercise library load: <1s (fetching all exercises)
- Search/filter response: <100ms (client-side)
- Custom exercise creation: <2s (Firestore write)
- Image load (future): Lazy loading, WebP format

### Security Requirements
- Exercise read: Requires authentication
- Custom exercise write: User can only modify their own
- Pre-defined exercises: Read-only for all users
- Input sanitization: Prevent XSS in exercise names/descriptions

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Arrow keys to navigate exercise grid
- Screen reader: Exercise details announced on focus
- Focus trap in modal dialogs

### Browser/Platform Support
- All modern browsers (same as project-wide requirements)
- Responsive: Works on mobile, tablet, desktop

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 2.1: Exercise Database (foundation)
2. Function 2.2: Exercise Categories (simple filtering)
3. Function 2.3: Search & Filter (advanced filtering)
4. Function 2.4: Custom Exercise Creation (user content)

**Estimated Effort:**
- Function 2.1: 6-8 hours / 5 story points
- Function 2.2: 2-3 hours / 2 story points
- Function 2.3: 6-8 hours / 5 story points
- Function 2.4: 8-10 hours / 8 story points
- **Total Module Estimate:** 22-29 hours / 20 story points

**Technical Risks & Mitigation:**
- **Risk:** Search performance with 1000+ exercises  
  **Mitigation:** Client-side search sufficient for MVP (<500 exercises expected), move to Algolia if needed
- **Risk:** Custom exercises pollution (users create many duplicates)  
  **Mitigation:** Future: Suggest existing exercises before creating custom one
- **Risk:** Image hosting costs (future: exercise videos/images)  
  **Mitigation:** Firebase Storage, compress images, lazy loading

**Dependencies on External Factors:**
- Firestore query performance (generally fast for <10k documents)
- Pre-defined exercise database (need to seed with common exercises)

---

## Related Documentation

- [Architecture - Data Model](../core/02_ARCHITECTURE.md#data-model-firestore)
- [Workout Builder Requirements](./03_workout_builder_requirements.md)

---

**Last Updated:** November 14, 2025  
**Author:** Bootstrap PHASE 5  
**Status:** ✅ Ready for Development
