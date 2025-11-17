// tests/setup.ts
// Global test setup with mocks for Next.js and Firebase

import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Firebase (for tests that don't need real Firebase)
vi.mock('@/firebase/provider', () => ({
  useAuth: () => null,
  useFirestore: () => null,
  useStorage: () => null,
  useUser: () => ({ user: null, isUserLoading: false }),
}));

// Mock Firebase Performance (client-side only)
vi.mock('@/firebase/performance', () => ({
  createTrace: vi.fn(() => null),
  measurePerformance: vi.fn(async (name, fn) => await fn()),
  traceSync: vi.fn((name, fn) => fn()),
  TraceNames: {
    FIRESTORE_QUERY: 'firestore_query',
    WORKOUT_EXECUTION: 'workout_execution',
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));
