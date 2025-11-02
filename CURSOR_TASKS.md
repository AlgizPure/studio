# Remaining Tasks for Cursor IDE

## Context
A comprehensive code review and testing was performed on this Next.js 15 fitness tracking application. Many critical issues have been fixed, but some tasks remain that require manual intervention or Firebase credentials.

---

## ✅ Already Completed
- Fixed all TypeScript type errors (8 errors fixed)
- Updated Next.js to 15.5.6 (fixed 3 moderate security vulnerabilities)
- Fixed security vulnerabilities (now 0 vulnerabilities)
- Removed ignoreBuildErrors and ignoreDuringBuilds from next.config.ts
- Created Playwright configuration
- Created .env.example template
- Fixed empty catch blocks with proper error logging
- Added missing `status` field to WorkoutExtended creation

---

## 🔴 Priority 1: Critical (Blocks Production)

### 1. Create Firebase Configuration (.env.local)
**Why:** Build fails during static page generation due to missing Firebase credentials.

**Steps:**
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get Firebase credentials from [Firebase Console](https://console.firebase.google.com/):
   - Go to Project Settings > General > Your apps
   - Find your web app or create one
   - Copy the config values:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. Get Google AI API Key from [Google AI Studio](https://makersuite.google.com/app/apikey):
   - `GOOGLE_GENAI_API_KEY`

4. For Firebase Admin (server-side):
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Update `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH` in `.env.local`

5. Verify build works:
   ```bash
   npm run build
   ```

**Error to fix:**
```
FirebaseError: Firebase: Error (auth/invalid-api-key)
```

---

## 🟡 Priority 2: Important (Improves Code Quality)

### 2. Replace console.log with Proper Logging System
**Why:** 70 console.log statements found in production code (22 files).

**Recommendation:** Create a logging utility:

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
```

**Files with most console.log usage:**
- AI flows: generate-insights.ts, parse-reflection.ts, progression-suggestions.ts, quick-insights.ts
- Firebase: init.ts, messaging.ts, auth/use-user.tsx
- Components: notification-center.tsx, insights-dialog.tsx, habit-tracker.tsx

**Find & Replace Pattern:**
```typescript
// Find:
console.log(
console.error(
console.warn(
console.debug(

// Replace with:
import { logger } from '@/lib/logger';
logger.info(
logger.error(
logger.warn(
logger.debug(
```

---

### 3. Complete TODO Comments
**Why:** 6 TODO comments indicate incomplete functionality.

**Files and TODOs:**
1. `src/components/today-schedule.tsx:73`
   ```typescript
   // TODO: Открыть интерфейс выполнения тренировки
   ```
   **Task:** Implement workout execution interface

2. `src/components/today-schedule.tsx:94`
   ```typescript
   // TODO: загрузить тренировки из подколлекций программ
   ```
   **Task:** Load workouts from program subcollections

3. `src/components/today-schedule.tsx:138`
   ```typescript
   completed: false, // TODO: проверить выполнена ли тренировка сегодня
   ```
   **Task:** Check if workout is completed today

4. `src/lib/ztl/helpers.ts:52`
   ```typescript
   // TODO: phase-aware logic can go here
   ```
   **Task:** Implement phase-aware logic for workout progression

5. `src/components/habit-tracker.tsx:461`
   ```typescript
   // TODO: Implement skip with token choice
   ```
   **Task:** Add token selection UI when skipping habits

6. `src/components/swipeable-habit-card.tsx:226`
   ```typescript
   // TODO: Open context menu
   ```
   **Task:** Implement context menu for habit actions

**Suggested Approach:**
- Either implement the features
- Or remove TODO comments and create GitHub issues for future work

---

## 🟢 Priority 3: Nice to Have (Testing & Documentation)

### 4. Add Unit Tests
**Why:** No unit test files found. Testing infrastructure exists but no tests written.

**Recommendation:** Use Jest or Vitest for unit testing.

**Setup Vitest:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**High-Priority Test Files to Create:**
- `src/lib/habits.test.ts` - Test habit logic
- `src/lib/progression-engine.test.ts` - Test workout progression
- `src/lib/utils/schedule-builder.test.ts` - Test schedule generation
- `src/components/workout-builder/workout-builder.test.tsx` - Test workout creation
- `src/lib/export.test.ts` - Test data export functionality

---

### 5. Complete E2E Tests with Playwright
**Why:** E2E test files exist but no Playwright config was present (now created).

**Steps:**
1. Review and update existing E2E tests:
   - `e2e/global-setup.ts`
   - `e2e/utils/auth-setup.ts`

2. Create test files in `e2e/` directory:
   - `e2e/auth.spec.ts` - Login/signup flows
   - `e2e/habits.spec.ts` - Habit tracking
   - `e2e/workouts.spec.ts` - Workout creation and execution
   - `e2e/programs.spec.ts` - Program management

3. Add test script to `package.json`:
   ```json
   "scripts": {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui"
   }
   ```

4. Run tests:
   ```bash
   npm run test:e2e
   ```

---

### 6. Add Missing Type Definitions
**Why:** Improve type safety and developer experience.

**Recommendations:**

1. **Create type guards:**
   ```typescript
   // src/lib/type-guards.ts
   export function isWorkoutExtended(obj: any): obj is WorkoutExtended {
     return obj && typeof obj === 'object' && 'status' in obj;
   }
   ```

2. **Add stricter Firebase types:**
   ```typescript
   // src/lib/firebase-types.ts
   import type { Firestore, CollectionReference } from 'firebase/firestore';

   export type UserCollection<T> = CollectionReference<T>;

   export function getUserCollection<T>(
     firestore: Firestore,
     userId: string,
     collectionName: string
   ): UserCollection<T> {
     return collection(firestore, `users/${userId}/${collectionName}`) as UserCollection<T>;
   }
   ```

---

### 7. Performance Optimizations

**Identified Issues:**

1. **Large bundle size warning:**
   ```
   @opentelemetry/instrumentation - Critical dependency warning
   ```
   **Fix:** Add to `next.config.ts`:
   ```typescript
   webpack: (config, { isServer }) => {
     if (!isServer) {
       config.resolve.fallback = {
         ...config.resolve.fallback,
         fs: false,
       };
     }
     return config;
   },
   ```

2. **Optimize re-renders:**
   - Add `React.memo()` to frequently rendered components
   - Use `useMemo()` and `useCallback()` where appropriate
   - Files to optimize:
     - `src/components/habit-tracker.tsx`
     - `src/components/daily-schedule.tsx`
     - `src/components/workout-builder/workout-builder.tsx`

---

## 📋 Quick Command Reference

```bash
# Verify TypeScript (should pass now)
npm run typecheck

# Check for security vulnerabilities (should be 0)
npm audit

# Run development server
npm run dev

# Build for production
npm run build

# Run E2E tests (after setup)
npm run test:e2e

# Run unit tests (after setup)
npm run test
```

---

## 🎯 Suggested Work Order

1. **First:** Create `.env.local` with Firebase credentials (blocks everything)
2. **Second:** Replace console.log with logger utility (improves debugging)
3. **Third:** Complete or remove TODO comments (clarifies codebase)
4. **Fourth:** Add unit tests for critical business logic
5. **Fifth:** Complete E2E test suite
6. **Last:** Performance optimizations

---

## 📝 Notes

- TypeScript strict mode is enabled ✅
- All type errors are now fixed ✅
- Security vulnerabilities are resolved ✅
- Build process is configured correctly ✅
- Playwright is configured and ready ✅

Good luck! 🚀
