# Performance & Optimization Module Requirements

**Module ID:** Module 14
**Total Functions:** 5
**Priority:** MEDIUM
**Status:** ✅ Implemented 100% (All optimizations and monitoring complete)
**Dependencies:** All modules (performance is cross-cutting)

---

## Overview

The Performance & Optimization module ensures Zenith Trainer delivers fast, responsive user experiences across all devices. Using Next.js built-in optimizations (Turbopack, code splitting, image optimization), Firebase offline persistence, and planned performance monitoring, the module targets sub-2s page loads and smooth interactions.

Current implementation (100%) includes development build optimization (Turbopack), automatic code splitting, Next.js Image component optimization, Firebase offline caching, Firestore-based API caching for AI endpoints, and Firebase Performance Monitoring with custom traces for critical paths.

**Key Capabilities:**
- Next.js Turbopack for fast dev builds (<1s HMR)
- Automatic code splitting (route-based, component-level)
- Next.js Image optimization (WebP conversion, lazy loading, responsive)
- Firebase offline persistence (local cache for Firestore)
- Future: Firebase Performance Monitoring (trace network, render times)

**Integration Points:**
- **Next.js Framework:** Built-in optimization features
- **Firebase:** Offline persistence, Performance SDK
- **All Modules:** Performance applies to all features

---

## Core Functions

### Function 14.1: Next.js Turbopack - ✅ 100%

**Purpose:** Fast development builds with Hot Module Replacement (HMR).

**Configuration:**
- Next.js 15.5.6 with Turbopack enabled in dev mode
- Build tool: Turbopack (Rust-based, replaces Webpack in dev)
- HMR: <1s for most changes (vs. 3-5s with Webpack)

**Setup:**
```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```

**Benefits:**
- 5-10x faster dev server startup
- Incremental compilation (only rebuild changed modules)
- Better TypeScript performance in dev

**Technical:**
- Next.js config: Turbopack enabled by default in dev (Next.js 15+)
- Production: Uses standard Next.js build (not Turbopack yet)

---

### Function 14.2: Code Splitting - ✅ 100%

**Purpose:** Load only necessary JavaScript for each page.

**Strategy:**
1. **Route-based splitting**: Next.js automatic (each route = separate bundle)
2. **Component-level splitting**: Dynamic imports for large components
3. **Third-party libraries**: Separate vendor chunk

**Implementation:**

**Automatic Route Splitting:**
```typescript
// Next.js App Router automatically code-splits by route
// /app/dashboard/page.tsx → dashboard.js
// /app/programs/page.tsx → programs.js
```

**Manual Component Splitting:**
```typescript
import dynamic from 'next/dynamic';

// Heavy chart component loaded only when needed
const AnalyticsChart = dynamic(() => import('@/components/analytics-chart'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false, // Client-only if chart library doesn't support SSR
});
```

**Bundle Analysis:**
```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

**Technical:**
- Next.js: Automatic code splitting by default
- Manual: `dynamic()` for on-demand component loading
- Target: Keep initial bundle <200KB (gzipped)

---

### Function 14.3: Image Optimization - ✅ 100%

**Purpose:** Optimize images for fast loading and responsive display.

**Next.js Image Component:**
```typescript
import Image from 'next/image';

<Image
  src="/images/exercise-demo.jpg"
  alt="Bench Press Demo"
  width={800}
  height={600}
  priority={false} // Lazy load by default
  placeholder="blur" // Optional blur-up effect
/>
```

**Features:**
- **Automatic WebP/AVIF**: Serve modern formats to supported browsers
- **Responsive images**: Generate multiple sizes, serve optimal for device
- **Lazy loading**: Load images as they enter viewport (IntersectionObserver)
- **Priority**: Flag above-fold images for preload

**Image Hosting:**
- Static images: `/public/images/` (Next.js built-in optimization)
- User uploads: Firebase Storage (planned) with CDN

**Technical:**
- Next.js Image component: Built-in optimization
- Formats: Auto-detect browser support (WebP → AVIF → JPEG fallback)
- CDN: Vercel Edge Network (if deployed on Vercel) or Firebase Hosting CDN

---

### Function 14.4: Caching Strategy - ✅ Complete (100%)

**Purpose:** Cache data for offline access and faster repeat loads.

**Implementation:**

**1. Firebase Offline Persistence (Client-side):**
```typescript
// src/firebase/firestore.ts
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
```

**Benefits:**
- Firestore queries cached locally (IndexedDB)
- Offline mode: Read cached data when network unavailable
- Automatic sync when back online

**2. AI API Route Caching (Server-side):**
All AI API routes use Firestore-based caching with 24-hour TTL:

**Routes with Caching:**
- `/api/ai/progressions` - Firestore cache per programId
- `/api/ai/insights` - Firestore cache per timeframe
- `/api/ai/recommendations` - Firestore cache per programId + daysBack
- `/api/ai/habit-insights` - Firestore cache per weeksBack

**Cache Implementation:**
```typescript
// src/lib/ai-helpers.ts
export async function getCachedInsights(
  firestore: Firestore,
  userId: string,
  cacheKey: string,
  ttlHours: number = 24
): Promise<CachedInsight | null>

export async function saveInsightsCache(
  firestore: Firestore,
  userId: string,
  cacheKey: string,
  data: any
): Promise<void>
```

**Benefits:**
- Reduces AI API calls (cost savings)
- Faster response times (cache hit = instant)
- Fallback to expired cache on generation failure
- User-specific caching (isolated by userId)

**Why Firestore over Redis:**
- Serverless environment compatibility
- POST endpoints (Next.js revalidate only works for GET)
- Already integrated Firestore infrastructure

**Technical:**
- Client-side: Firebase offline persistence (IndexedDB)
- Server-side: Firestore-based caching (24h TTL)
- Cache invalidation: TTL-based (automatic expiry)
- Completion: November 17, 2025
- Estimated: 4-6 hours | Actual: ~1 hour (verification only)

---

### Function 14.5: Performance Monitoring - ✅ Complete (100%)

**Purpose:** Track and analyze app performance in production.

**Metrics Tracked:**
1. **Automatic traces** (Firebase SDK):
   - Page Load Time: Time to Interactive (TTI), First Contentful Paint (FCP)
   - Network Requests: Firebase, external APIs
   - HTTP requests latency
2. **Custom traces**:
   - Firestore queries (with document_count metric)
   - Workout execution (with duration_minutes, total_volume, cycles_completed)
   - AI API calls (future enhancement)

**Implementation:**

**1. Firebase Performance SDK Wrapper** (`src/firebase/performance.ts` - 196 lines):
```typescript
import { getPerformance, trace } from 'firebase/performance';

// Initialize (client-side only, non-blocking)
export function initializePerformance(app: FirebaseApp): void {
  if (typeof window === 'undefined') return; // Server-side safety

  setTimeout(() => {
    perfInstance = getPerformance(app);
  }, 100); // Delay to avoid blocking startup
}

// Predefined trace names for consistency
export const TraceNames = {
  PAGE_DASHBOARD: 'page_dashboard',
  WORKOUT_EXECUTION: 'workout_execution',
  FIRESTORE_QUERY: 'firestore_query',
  AI_API_CALL: 'ai_api_call',
  // ... 15+ predefined traces
} as const;

// Create custom trace
export function createTrace(traceName: string): Trace | null

// Measure async performance
export async function measurePerformance<T>(
  traceName: string,
  fn: () => Promise<T>,
  metrics?: Record<string, number>
): Promise<T>
```

**2. Integration** (`src/firebase/init.ts`):
```typescript
import { initializePerformance } from '@/firebase/performance';

export function initializeFirebase() {
  // ... initialize Firebase app
  initializePerformance(firebaseApp); // Auto-init Performance
  return getSdks(firebaseApp);
}
```

**3. Firestore Query Tracing** (`src/firebase/firestore/use-collection.tsx`):
```typescript
import { createTrace, TraceNames } from '@/firebase/performance';

useEffect(() => {
  const queryTrace = createTrace(TraceNames.FIRESTORE_QUERY);
  if (queryTrace) queryTrace.start();

  const unsubscribe = onSnapshot(
    query,
    (snapshot) => {
      // Success: add document count metric
      if (queryTrace) {
        queryTrace.putMetric('document_count', snapshot.docs.length);
        queryTrace.stop();
      }
    },
    (error) => {
      // Error: stop trace
      if (queryTrace) queryTrace.stop();
    }
  );
  return () => unsubscribe();
}, [query]);
```

**4. Workout Execution Tracing** (`src/components/workout-execution/workout-execution-mode.tsx`):
```typescript
import { createTrace, TraceNames, type Trace } from '@/firebase/performance';

const workoutTrace = useRef<Trace | null>(null);

const handleStart = () => {
  workoutTrace.current = createTrace(TraceNames.WORKOUT_EXECUTION);
  if (workoutTrace.current) workoutTrace.current.start();
};

const handleFeedbackSubmit = () => {
  if (workoutTrace.current) {
    workoutTrace.current.putMetric('duration_minutes', duration);
    workoutTrace.current.putMetric('total_volume', totalVolume);
    workoutTrace.current.putMetric('cycles_completed', cycleLogs.length);
    workoutTrace.current.stop();
  }
};

const handleCancel = () => {
  if (workoutTrace.current) workoutTrace.current.stop();
};
```

**Dashboard:**
- Firebase Console → Performance tab
- View: Page loads, network requests, custom traces
- Metrics: Duration, frequency, percentiles (p50, p90, p99)
- Alerts: Set thresholds (e.g., TTI > 3s triggers alert)

**Benefits:**
- Real-time performance monitoring in production
- Identify slow queries and bottlenecks
- Track user experience metrics (TTI, FCP)
- Custom metrics for domain-specific operations

**Technical:**
- Library: `firebase/performance` (included in firebase@11.9.1)
- Client-side only (server-side safety checks)
- Non-blocking initialization (100ms delay)
- Auto-capture: Page loads, network requests
- Manual traces: Firestore queries, workout execution
- Completion: November 17, 2025
- Estimated: 4-6 hours | Actual: ~4 hours

---

## Module-Level Requirements

### Performance Targets
- **Page Load (TTI):** <2s on 4G connection
- **API Response:** <500ms (Firestore queries), <5s (AI API)
- **Interaction Response:** <100ms (button clicks, form inputs)
- **HMR (Dev):** <1s for code changes
- **Bundle Size:** Initial load <200KB (gzipped)

### Caching Requirements
- Firestore: Offline persistence enabled (IndexedDB)
- Static assets: Aggressive caching (1 year for immutable)
- API responses: 5-minute TTL for AI suggestions

### Monitoring Requirements
- Real User Monitoring (RUM): Track actual user performance
- Error tracking: Log client-side errors (future: Sentry integration)
- Performance budgets: Alert if TTI > 3s consistently

### Browser/Platform Support
- Modern browsers: Use latest optimization APIs (IntersectionObserver, etc.)
- Legacy browsers: Graceful degradation (no WebP → JPEG fallback)

---

## Implementation Notes

**Status:**
- Functions 14.1-14.3: ✅ Complete (60% of module)
- Function 14.4: ✅ Complete (Firestore caching for AI + offline persistence)
- Function 14.5: ✅ Complete (Firebase Performance SDK + custom traces)
- **Module: ✅ 100% Complete**

**Completed Implementation:**
1. Function 14.4: Caching strategy (✅ Complete)
   - Client-side: Firebase offline persistence (IndexedDB)
   - Server-side: Firestore-based caching for AI API routes (24-hour TTL)
   - Usage limits and fallback to expired cache
2. Function 14.5: Firebase Performance Monitoring (✅ Complete)
   - SDK integration with auto-initialization
   - Custom traces for Firestore queries and workout execution
   - Predefined trace names for consistency
   - Server-side safety checks

**Actual Effort:**
- Caching documentation: 1 hour (already implemented in AI routes)
- Performance monitoring: 3 hours / 4 story points
- **Total:** 4 hours / 4 story points (vs. estimated 8-12 hours)

**Technical Risks & Mitigation:**
- **Risk:** Over-aggressive caching causes stale data
  **Mitigation:** Use appropriate TTLs, cache invalidation on mutations
- **Risk:** Performance monitoring overhead (tracking adds latency)
  **Mitigation:** Firebase Performance SDK optimized (minimal overhead <1%)
- **Risk:** Bundle size grows with features
  **Mitigation:** Regular bundle analysis, dynamic imports for heavy components

**Dependencies on External Factors:**
- Firebase Performance SDK availability (stable)
- Next.js optimization features (built-in, stable)
- Network conditions (users on slow connections still benefit from caching)

---

## Related Documentation

- [Architecture - Performance Considerations](../core/04_ARCHITECTURE.md)
- [Tech Stack - Next.js](../core/03_TECH_STACK.md)

---

**Last Updated:** November 17, 2025
**Author:** Development Sprint (Module 14)
**Status:** ✅ 100% Complete (All optimizations + monitoring complete)
