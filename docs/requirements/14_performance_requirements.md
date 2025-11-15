# Performance & Optimization Module Requirements

**Module ID:** Module 14
**Total Functions:** 5
**Priority:** MEDIUM
**Status:** 🟡 Implemented 60% (Core optimizations done, monitoring pending)
**Dependencies:** All modules (performance is cross-cutting)

---

## Overview

The Performance & Optimization module ensures Zenith Trainer delivers fast, responsive user experiences across all devices. Using Next.js built-in optimizations (Turbopack, code splitting, image optimization), Firebase offline persistence, and planned performance monitoring, the module targets sub-2s page loads and smooth interactions.

Current implementation (60%) includes development build optimization (Turbopack), automatic code splitting, Next.js Image component optimization, and basic Firebase offline caching. Missing (40%): Comprehensive caching strategy, Firebase Performance Monitoring integration, and performance budgets.

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

### Function 14.4: Caching Strategy - 🟡 Partial (50%)

**Purpose:** Cache data for offline access and faster repeat loads.

**Current Implementation (50%):**

**Firebase Offline Persistence:**
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

**Missing (50%):**

**API Route Caching:**
- Cache AI API responses (e.g., progression suggestions for same exercise/date)
- Strategy: In-memory cache (Node.js) or Redis (future)

**Static Data Caching:**
- Pre-defined exercises: Cache aggressively (rarely change)
- User data: Cache with TTL (Time-To-Live)

**Next.js Caching:**
```typescript
// Example: Cache AI suggestions for 5 minutes
export const revalidate = 300; // seconds

export async function GET() {
  // This response cached for 5 min
  const suggestions = await getAISuggestions();
  return Response.json(suggestions);
}
```

**Technical:**
- Current: Firebase offline persistence (client-side)
- Needed: Server-side API caching, static data caching
- Estimated effort: 4-6 hours / 5 story points

---

### Function 14.5: Performance Monitoring - ❌ Not Started (0%)

**Purpose:** Track and analyze app performance in production.

**Metrics to Track:**
1. **Page Load Time**: Time to Interactive (TTI), First Contentful Paint (FCP)
2. **API Response Time**: Firestore queries, AI API calls
3. **User Interactions**: Button clicks, form submissions (time to response)
4. **Network Requests**: Firebase, Gemini API latency
5. **Client-side Errors**: JavaScript errors, failed API calls

**Firebase Performance Monitoring:**
```typescript
// src/firebase/performance.ts
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance(app);

// Custom trace example
const traceAI = trace(perf, 'ai_progression_suggestions');
traceAI.start();
// ... call AI API
traceAI.stop();

// Automatic traces:
// - Page loads
// - Network requests (Firebase, external APIs)
```

**Integration:**
- Firebase Performance SDK: `firebase/performance`
- Dashboard: Firebase Console → Performance tab
- Alerts: Set thresholds (e.g., TTI > 3s triggers alert)

**Custom Metrics:**
```typescript
// Track workout execution performance
const workoutTrace = trace(perf, 'workout_execution_complete');
workoutTrace.putMetric('exercise_count', exerciseCount);
workoutTrace.putMetric('duration_minutes', durationMin);
workoutTrace.start();
// ... user completes workout
workoutTrace.stop();
```

**Technical:**
- Library: `firebase/performance`
- Setup: Add to Firebase config (`src/firebase/performance.ts`)
- Estimated effort: 4-6 hours / 5 story points

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
- Function 14.4: 🟡 50% complete (Firebase offline done, API caching pending)
- Function 14.5: ❌ Not Started (0%)

**Recommended Implementation Order (for remaining 40%):**
1. Function 14.4: Complete caching strategy (4-6 hours / 5 story points)
   - API route caching for AI responses
   - Static data caching with TTL
2. Function 14.5: Firebase Performance Monitoring (4-6 hours / 5 story points)
   - SDK integration
   - Custom traces for critical paths
   - Dashboard setup and alerts

**Estimated Effort (Remaining):**
- Caching: 4-6 hours / 5 story points
- Performance monitoring: 4-6 hours / 5 story points
- **Total Remaining:** 8-12 hours / 10 story points

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

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 60% Complete (Core optimizations done, monitoring pending)
