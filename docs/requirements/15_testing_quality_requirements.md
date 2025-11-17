# Testing & Quality Module Requirements

**Module ID:** Module 15
**Total Functions:** 5
**Priority:** MEDIUM
**Status:** 🟡 Implemented 60% (Critical unit tests + smoke E2E complete)
**Dependencies:** All modules (testing is cross-cutting)

---

## Overview

The Testing & Quality module ensures code reliability, maintainability, and user experience quality through comprehensive testing and code quality tools. Current implementation (60%) includes TypeScript strict mode, ESLint configuration, Vitest setup with 35 passing unit tests covering critical utilities, and Playwright smoke tests.

The module targets 40-50% code coverage on critical paths (analytics, habits, reflections, wheel-of-life utilities) with focus on pure function testing and smoke E2E tests for basic app functionality.

**Key Capabilities:**
- TypeScript strict mode for type safety
- ESLint for code quality and consistency
- Vitest for unit testing (35 tests, 100% pass rate)
- Playwright for E2E testing (smoke tests)
- Future: Component testing with React Testing Library
- Future: Integration tests for API routes

**Integration Points:**
- **All Modules:** Testing covers all features
- **CI/CD:** Automated test runs on PR/push (future)
- **Performance Module:** Performance tests with Playwright

---

## Core Functions

### Function 15.1: TypeScript Strict Mode - ✅ 100%

**Purpose:** Enforce strict type checking for runtime error prevention.

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Benefits:**
- Catch type errors at compile time (not runtime)
- Better IDE autocomplete and refactoring
- Self-documenting code (types as documentation)

**Technical:**
- TypeScript 5.x with strict mode enabled
- Zero `any` types allowed (explicit unknown/cast required)
- All files must pass type check to build

---

### Function 15.2: ESLint Configuration - ✅ 100%

**Purpose:** Enforce code style, catch common mistakes, ensure consistency.

**Configuration:**
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Checks:**
- Next.js best practices (next/core-web-vitals)
- TypeScript rules (no `any`, unused vars)
- React Hooks rules (proper dependency arrays)
- Code style (consistent formatting)

**Integration:**
- Pre-commit hook: Run ESLint on staged files (future: Husky + lint-staged)
- IDE: Real-time linting in VS Code

**Technical:**
- ESLint 8.x with TypeScript plugin
- Next.js ESLint config (built-in)

---

### Function 15.3: E2E Testing (Playwright) - 🟡 Partial (20%)

**Purpose:** Test critical user flows end-to-end in real browser.

**Current Status (20%):**
- ✅ Playwright installed (@playwright/test 1.56.1)
- ✅ Config file created (`playwright.config.ts`)
- ✅ Smoke tests implemented (`tests/e2e/smoke.spec.ts` - 4 tests)
  - App loads home page
  - Login page accessible
  - Sign up page accessible
  - Proper meta tags present

**Test Coverage Needed (90%):**

**Critical Flows to Test:**
1. **Authentication Flow**
   - Sign up with email/password
   - Sign in with Google
   - Sign out
   - Password reset

2. **Workout Execution Flow**
   - Start workout from program
   - Log sets (weight, reps, RPE)
   - Complete workout
   - View workout in history

3. **Program Management Flow**
   - Create new program
   - Add workouts to program days
   - Schedule program
   - Export program (ZTL)

4. **Exercise Library Flow**
   - Browse exercises
   - Filter by category
   - Create custom exercise
   - Add to workout

5. **Habit Tracking Flow**
   - Create habit
   - Log habit completion (swipe)
   - View streak
   - Archive habit

**Example Test:**
```typescript
// tests/e2e/workout-execution.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Workout Execution', () => {
  test('should complete full workout flow', async ({ page }) => {
    // Sign in
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Navigate to program
    await page.click('text=My Program');
    await page.click('text=Start Workout'); // Monday's workout

    // Log first exercise set
    await page.fill('input[placeholder="Weight"]', '100');
    await page.fill('input[placeholder="Reps"]', '8');
    await page.click('button:has-text("Complete Set")');

    // Verify set logged
    await expect(page.locator('text=Set 1: 100kg x 8')).toBeVisible();

    // Complete workout
    await page.click('button:has-text("Finish Workout")');
    await expect(page.locator('text=Workout Completed')).toBeVisible();
  });

  test('should handle rest timer', async ({ page }) => {
    // ... test rest timer countdown, notifications
  });
});
```

**Playwright Config:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Technical:**
- Playwright 1.56.1 with TypeScript
- Test runner: `npx playwright test`
- CI: GitHub Actions (future)
- Estimated effort: 16-20 hours / 13 story points

---

### Function 15.4: Unit Testing - 🟡 Partial (50%)

**Purpose:** Test individual functions and business logic in isolation.

**Testing Framework:**
- ✅ Vitest installed (v4.0.10)
- ✅ Configuration complete (`vitest.config.ts`)
- ✅ Test setup with mocks (`tests/setup.ts`)
- ✅ npm scripts (`test`, `test:run`, `test:coverage`, `test:ui`)

**Implemented Tests (35 tests, 100% pass rate):**

1. **Analytics - Volume Calculations** (`tests/unit/analytics/volume.test.ts` - 8 tests)
   - ✅ calculateWorkoutVolume: single exercise, multiple exercises, incomplete sets
   - ✅ calculateTotalVolume: sum across workouts, missing totalVolume
   - ✅ Edge cases: no cycles, duration exercises

2. **Wheel of Life Utilities** (`tests/unit/wheel-of-life.test.ts` - 13 tests)
   - ✅ calculateBalanceScore: perfect balance, varied values, ratings
   - ✅ calculateDimensionTrends: upward, downward, stable trends
   - ✅ getLatestContext: most recent, empty array, single context

3. **Reflections Utilities** (`tests/unit/reflections.test.ts` - 14 tests)
   - ✅ calculateCorrelation: perfect positive/negative, low correlation, edge cases
   - ✅ hasReflectedToday: today vs yesterday
   - ✅ getTopGratitudes: frequency sorting, empty data, limits

**Coverage:**
- **Utility Functions:** ~45% coverage (3 critical files tested)
  - ✅ `src/lib/analytics/volume.ts`: 100%
  - ✅ `src/lib/wheel-of-life.ts`: ~80%
  - ✅ `src/lib/reflections.ts`: ~60%
  - ⏳ `src/lib/ztl/*`: Not yet tested
  - ⏳ `src/lib/analytics/statistics.ts`: Not yet tested

**Example Test:**
```typescript
// tests/unit/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateOneRepMax, calculateVolume } from '@/lib/calculations';

describe('Calculations', () => {
  describe('calculateOneRepMax', () => {
    it('should calculate 1RM using Epley formula', () => {
      const result = calculateOneRepMax(100, 8);
      expect(result).toBeCloseTo(126.7, 1);
    });

    it('should return weight for 1 rep', () => {
      const result = calculateOneRepMax(150, 1);
      expect(result).toBe(150);
    });
  });

  describe('calculateVolume', () => {
    it('should sum weight * reps across sets', () => {
      const sets = [
        { weight: 100, reps: 8 },
        { weight: 100, reps: 7 },
        { weight: 100, reps: 6 },
      ];
      const volume = calculateVolume(sets);
      expect(volume).toBe(2100); // 800 + 700 + 600
    });
  });
});
```

**Mocking Firebase:**
```typescript
// tests/mocks/firebase.ts
import { vi } from 'vitest';

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
};
```

**Technical:**
- Framework: Vitest 1.x (recommended) or Jest
- Coverage: `vitest --coverage` (uses v8 or istanbul)
- Target: 70%+ coverage on `/src/lib/`
- Estimated effort: 12-16 hours / 13 story points

---

### Function 15.5: Integration Testing - ❌ Not Started (0%)

**Purpose:** Test interactions between multiple components/modules.

**Coverage:**
1. **API Routes + Database**
   - POST `/api/workouts` → creates Firestore doc → returns ID
   - GET `/api/programs/:id` → fetches from Firestore → returns program

2. **React Component + State**
   - Workout logger component → updates local state → calls API → re-renders

3. **Multi-step Workflows**
   - Program creation → workout assignment → schedule → export ZTL

**Framework:**
- React Testing Library (component integration)
- MSW (Mock Service Worker) for API mocking

**Example Test:**
```typescript
// tests/integration/workout-api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/workouts/route';

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => mockFirestore,
}));

describe('Workout API Integration', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should create workout and return ID', async () => {
    const request = new Request('http://localhost:3000/api/workouts', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user123',
        name: 'Push Day',
        exercises: [
          { exerciseId: 'bench-press', sets: 4, reps: 8 },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(mockFirestore.collection).toHaveBeenCalledWith('workouts');
  });
});
```

**Component Integration:**
```typescript
// tests/integration/workout-logger.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkoutLogger from '@/components/workout-logger';

it('should log set and update UI', async () => {
  render(<WorkoutLogger workoutId="workout123" />);

  // Fill in weight and reps
  fireEvent.change(screen.getByPlaceholderText('Weight'), { target: { value: '100' } });
  fireEvent.change(screen.getByPlaceholderText('Reps'), { target: { value: '8' } });

  // Click complete set
  fireEvent.click(screen.getByText('Complete Set'));

  // Verify set appears in list
  await waitFor(() => {
    expect(screen.getByText('Set 1: 100kg x 8')).toBeInTheDocument();
  });
});
```

**Technical:**
- React Testing Library for component tests
- MSW for API mocking (avoid actual network calls)
- Target: 50%+ coverage on critical component interactions
- Estimated effort: 10-14 hours / 10 story points

---

## Module-Level Requirements

### Coverage Targets
- **Overall:** 60%+ code coverage
- **Critical paths:** 80%+ (auth, workout execution, data persistence)
- **Utilities:** 70%+ (`/src/lib/`)
- **Components:** 50%+ (focus on interactive components)

### Test Performance
- Unit tests: <5s for full suite
- Integration tests: <30s for full suite
- E2E tests: <5 min for full suite (parallel execution)

### CI/CD Integration (Future)
- GitHub Actions: Run tests on PR, block merge if failing
- Coverage reports: Upload to Codecov or similar
- E2E tests: Run on staging environment before deploy

### Test Stability
- Flaky tests: <5% failure rate (retries for E2E)
- Deterministic: No random data, use fixed seeds/mocks

---

## Implementation Notes

**Status:**
- Functions 15.1-15.2: ✅ Complete (tooling - 20%)
- Function 15.3: 🟡 Partial (E2E smoke tests - 20%)
- Function 15.4: 🟡 Partial (unit tests for critical utilities - 50%)
- Function 15.5: ❌ Not Started (integration tests - 0%)
- **Module: 🟡 60% Complete**

**Completed Implementation (Nov 17, 2025):**
1. Function 15.4: Unit Testing Foundation ✅
   - Vitest setup with TypeScript and React support
   - 35 tests across 3 critical utility files (100% pass rate)
   - Test suites: volume calculations, wheel-of-life, reflections/correlations
   - Coverage: ~45% of critical utilities
2. Function 15.3: E2E Smoke Tests ✅
   - Playwright configuration verified
   - 4 smoke tests for basic app functionality
   - Verifies app loads, auth pages accessible, meta tags present

**Remaining Work (40%):**
1. Function 15.4: Additional Unit Tests (6-8 hours)
   - ZTL parser/helpers tests
   - Analytics statistics tests
   - Habit utilities tests
2. Function 15.3: Comprehensive E2E Tests (12-16 hours)
   - Auth flow (sign up, sign in, sign out)
   - Workout execution flow
   - Program management flow
3. Function 15.5: Integration Testing (10-14 hours)
   - API route tests
   - Component integration tests

**Actual Effort:**
- Unit tests foundation: 4 hours / 5 story points (vs. 12-16h estimate)
- E2E smoke tests: 1 hour / 1 story point
- **Total:** 5 hours / 6 story points (very efficient!)

**Estimated Effort (Remaining):**
- Unit tests: 6-8 hours / 7 story points
- E2E tests: 12-16 hours / 13 story points
- Integration tests: 10-14 hours / 10 story points
- **Total Remaining:** 28-38 hours / 30 story points

**Technical Risks & Mitigation:**
- **Risk:** Tests become brittle (break with minor UI changes)
  **Mitigation:** Focus on user-facing behavior, not implementation details (use accessible queries)
- **Risk:** E2E tests slow and flaky
  **Mitigation:** Run in parallel, use retries, isolate test data
- **Risk:** Low test coverage on edge cases
  **Mitigation:** Prioritize critical paths first, expand coverage iteratively

**Dependencies on External Factors:**
- Firebase Emulator for local testing (available)
- CI/CD platform (GitHub Actions free tier)
- Test framework stability (Vitest, Playwright both stable)

---

## Related Documentation

- [Architecture - Testing Strategy](../core/04_ARCHITECTURE.md)
- [Contributing Guide](../../CONTRIBUTING.md) (future: testing guidelines)

---

**Last Updated:** November 17, 2025
**Author:** Development Sprint (Module 15)
**Status:** 🟡 60% Complete (Critical unit tests + smoke E2E complete)
