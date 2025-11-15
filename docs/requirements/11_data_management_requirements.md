# Data Management Module Requirements

**Module ID:** Module 11
**Total Functions:** 5
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Authentication

---

## Overview

The Data Management module handles all data persistence, validation, and security for Zenith Trainer. Using Firebase Firestore as the NoSQL database, it ensures data integrity through Zod schemas, enforces user-scoped security with Firestore Security Rules, and provides efficient querying with composite indexes.

All modules depend on Data Management for storing and retrieving data. The module abstracts Firestore operations, provides type-safe data access, and handles date operations consistently across the app.

**Key Capabilities:**
- 7 Firestore collections (users, exercises, workouts, programs, workoutLogs, habits, habitLogs)
- Zod schema validation for all document types
- Firestore Security Rules (user-scoped access control)
- Data truncation (limit query results for performance)
- Date handling (date-fns library for consistency)

**Integration Points:**
- All modules write/read via Data Management
- Authentication provides user context (`userId`)
- Firestore SDK for real-time listeners and queries

---

## Core Functions

### Function 11.1: Firestore Collections

**Purpose:** Define and manage 7 core collections.

**Collections:**

1. **`/users/{userId}`** - User Profiles
   ```typescript
   interface UserProfile {
     email: string;
     displayName: string;
     createdAt: Timestamp;
     preferences: {
       theme: 'light' | 'dark' | 'system';
       defaultRestTime: number;
       defaultRPE: number;
     };
   }
   ```

2. **`/exercises`** - Exercise Library
   ```typescript
   interface Exercise {
     id: string;
     name: string;
     category: 'strength' | 'cardio' | 'flexibility' | 'other';
     muscleGroups: string[];
     equipment: string[];
     description?: string;
     isCustom: boolean;
     userId?: string; // If custom
     createdAt: Timestamp;
   }
   ```

3. **`/workouts/{workoutId}`** - Workout Templates
   ```typescript
   interface Workout {
     id: string;
     userId: string;
     name: string;
     exercises: WorkoutExercise[];
     isTemplate: boolean;
     createdAt: Timestamp;
   }
   ```

4. **`/programs/{programId}`** - Training Programs
   ```typescript
   interface Program {
     id: string;
     userId: string;
     name: string;
     goal: 'strength' | 'hypertrophy' | 'endurance' | 'general';
     durationWeeks: number;
     cycles: ProgramCycle[];
     startDate: Timestamp;
     status: 'scheduled' | 'active' | 'paused' | 'completed';
     createdAt: Timestamp;
   }
   ```

5. **`/workoutLogs/{logId}`** - Completed Workouts
   ```typescript
   interface WorkoutLog {
     id: string;
     userId: string;
     workoutId: string;
     programId?: string;
     exercises: ExerciseLog[];
     startTime: Timestamp;
     endTime?: Timestamp;
     status: 'in_progress' | 'completed' | 'abandoned';
   }
   ```

6. **`/habits/{habitId}`** - Habit Definitions
   ```typescript
   interface Habit {
     id: string;
     userId: string;
     name: string;
     type: 'daily' | 'weekly' | 'count' | 'duration';
     createdAt: Timestamp;
   }
   ```

7. **`/habitLogs/{logId}`** - Habit Completion Logs
   ```typescript
   interface HabitLog {
     id: string;
     userId: string;
     habitId: string;
     date: Timestamp;
     completed: boolean;
     value?: number; // For count/duration habits
     createdAt: Timestamp;
   }
   ```

**Technical:**
- Files: `src/firebase/firestore.ts`, `src/lib/types/*`
- SDK: Firebase Firestore Web SDK (modular)

---

### Function 11.2: Zod Schema Validation

**Purpose:** Runtime type validation for all Firestore documents.

**Approach:**
- Define Zod schemas mirroring TypeScript interfaces
- Validate data before writes
- Parse data after reads (type coercion)

**Example:**
```typescript
import { z } from 'zod';

const WorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  exercises: z.array(WorkoutExerciseSchema),
  isTemplate: z.boolean(),
  createdAt: z.instanceof(Timestamp)
});

// Usage
const createWorkout = async (data: unknown) => {
  const validated = WorkoutSchema.parse(data); // Throws if invalid
  await setDoc(doc(db, 'workouts', validated.id), validated);
};
```

**Benefits:**
- Catch data corruption at runtime
- Type-safe Firestore reads/writes
- Clear error messages for validation failures

**Technical:**
- Files: `src/lib/types/schemas.ts`
- Library: Zod 3.24.2

---

### Function 11.3: Firestore Security Rules

**Purpose:** Enforce user-scoped access control at database level.

**Principles:**
- Users can only access their own data
- System data (pre-defined exercises) readable by all authenticated users
- Write operations validate data structure

**Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: Can only read/write own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Exercises: Read all, write only own custom exercises
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Workouts: Only access own
    match /workouts/{workoutId} {
      allow read, write: if request.auth.uid == request.resource.data.userId;
    }

    // Programs: Only access own
    match /programs/{programId} {
      allow read, write: if request.auth.uid == request.resource.data.userId;
    }

    // Workout Logs: Only access own
    match /workoutLogs/{logId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
    }

    // Habits: Only access own
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == request.resource.data.userId;
    }

    // Habit Logs: Only access own
    match /habitLogs/{logId} {
      allow read, write: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**Technical:**
- File: `firestore.rules` (deployed via Firebase CLI)
- Testing: Firebase Emulator Suite for local rule testing

---

### Function 11.4: Data Truncation & Query Limits

**Purpose:** Prevent performance issues from large datasets.

**Limits:**
- Default query limit: 20 documents (pagination required)
- Max query limit: 100 documents
- Infinite scroll: Use `startAfter` cursor for next page

**Example:**
```typescript
const getWorkoutLogs = async (userId: string, limit = 20) => {
  const q = query(
    collection(db, 'workoutLogs'),
    where('userId', '==', userId),
    orderBy('startTime', 'desc'),
    limit(limit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
```

**Technical:**
- Firestore: `limit()` query modifier
- Pagination: React Query `useInfiniteQuery`

---

### Function 11.5: Date Handling (date-fns)

**Purpose:** Consistent date/time operations across app.

**Library:** date-fns (3.6.0)
- Lightweight (vs. moment.js)
- Tree-shakeable (only import needed functions)
- Immutable (pure functions)

**Common Operations:**
- Format: `format(date, 'MMM dd, yyyy')` → "Nov 14, 2025"
- Add: `addDays(date, 7)` → 7 days later
- Diff: `differenceInDays(end, start)` → Number of days
- Week: `startOfWeek(date)`, `endOfWeek(date)`

**Firestore Integration:**
```typescript
import { Timestamp } from 'firebase/firestore';

// Firestore → JavaScript Date
const jsDate = timestamp.toDate();

// JavaScript Date → Firestore
const timestamp = Timestamp.fromDate(new Date());

// Server timestamp (preferred for creation times)
const timestamp = serverTimestamp();
```

**Technical:**
- Library: date-fns 3.6.0
- Firebase: Firestore `Timestamp` class
- Storage: Always store UTC, convert to local for display

---

## Module-Level Requirements

### Performance Requirements
- Read query: <500ms for 20 documents
- Write operation: <200ms
- Index creation: Required for composite queries (handled by Firebase)

### Security Requirements
- All data scoped to user (`userId` field)
- Security Rules tested with Firebase Emulator
- No PII in insecure fields (e.g., workout names may contain private info)

### Data Integrity
- Zod validation on all writes
- Firestore transactions for multi-document updates
- Backup: Firebase automatic daily backups

### Browser/Platform Support
- Firestore Web SDK: All modern browsers
- Offline persistence: Enabled via `enableIndexedDbPersistence()`

---

## Implementation Notes

**Status:** ✅ 100% Complete

**Estimated Effort (Already Completed):**
- Function 11.1: 6-8 hours / 5 story points
- Function 11.2: 4-6 hours / 5 story points
- Function 11.3: 4-6 hours / 5 story points (includes testing)
- Function 11.4: 2-3 hours / 2 story points
- Function 11.5: 2-3 hours / 2 story points
- **Total Module Estimate:** 18-26 hours / 19 story points

**Technical Risks & Mitigation:**
- **Risk:** Firestore cost with large datasets
  **Mitigation:** Pagination, query limits, composite indexes (reduce reads)
- **Risk:** Security rule misconfiguration (data leak)
  **Mitigation:** Thorough testing with Firebase Emulator, audit rules regularly

**Dependencies on External Factors:**
- Firebase Firestore availability (99.95% SLA)
- Firestore pricing (pay-per-read/write)

---

## Related Documentation

- [Architecture - Data Model](../core/04_ARCHITECTURE.md#database-architecture)
- [Tech Stack - Firebase](../core/03_TECH_STACK.md#backend--database)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development (100% Complete)
