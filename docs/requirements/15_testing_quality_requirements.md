# Testing & Quality Module Requirements

**Module ID:** Module 15
**Total Functions:** 5
**Priority:** MEDIUM
**Status:** 🟡 Implemented 20% (Tooling setup, tests not written)
**Dependencies:** All modules (testing is cross-cutting)

---

## Overview

The Testing & Quality module ensures code reliability, maintainability, and user experience quality through comprehensive testing and code quality tools. Current implementation (20%) includes TypeScript strict mode, ESLint configuration, and Playwright setup. Missing (80%): Actual test suites (E2E, unit, integration).

The module aims for 70%+ code coverage on critical paths (authentication, workout execution, program management, data persistence) with a focus on E2E tests for user flows and unit tests for business logic.

**Key Capabilities:**
- TypeScript strict mode for type safety
- ESLint for code quality and consistency
- Playwright for end-to-end testing (setup complete, tests pending)
- Future: Vitest for unit/integration testing
- Future: React Testing Library for component testing

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

### Function 15.3: E2E Testing (Playwright) - 🟡 Partial (10%)

**Purpose:** Test critical user flows end-to-end in real browser.

**Current Status (10%):**
- Playwright installed (@playwright/test 1.56.1)
- Config file created (`playwright.config.ts`)
- No tests written yet

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

### Function 15.4: Unit Testing - ❌ Not Started (0%)

**Purpose:** Test individual functions and business logic in isolation.

**Testing Framework:**
- Vitest (fast, Vite-native, Jest-compatible API)
- Alternative: Jest (if compatibility needed)

**Coverage:**
1. **Utility Functions** (70%+ coverage)
   - `src/lib/calculations/*`: Volume, 1RM, RPE calculations
   - `src/lib/date-utils/*`: Date formatting, week calculations
   - `src/lib/ztl/*`: ZTL parser, converter, validator

2. **Data Validation** (80%+ coverage)
   - Zod schemas: Test valid/invalid inputs
   - Firestore helpers: CRUD operations (mock Firestore)

3. **Business Logic** (60%+ coverage)
   - Program progression logic
   - Streak calculation
   - AI prompt generation

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
- Functions 15.1-15.2: ✅ Complete (20% of module)
- Functions 15.3-15.5: ❌ Not Started (80% of module)

**Recommended Implementation Order (for remaining 80%):**
1. Function 15.4: Unit Testing (12-16 hours / 13 story points)
   - Start with utilities (easy wins, high value)
   - Mock Firebase for data layer tests
2. Function 15.3: E2E Testing (16-20 hours / 13 story points)
   - Focus on top 5 user flows
   - Run in CI before deploy
3. Function 15.5: Integration Testing (10-14 hours / 10 story points)
   - API route + database tests
   - Component integration tests

**Estimated Effort (Remaining):**
- Unit tests: 12-16 hours / 13 story points
- E2E tests: 16-20 hours / 13 story points
- Integration tests: 10-14 hours / 10 story points
- **Total Remaining:** 38-50 hours / 36 story points

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

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 20% Complete (Tooling setup done, tests pending)
