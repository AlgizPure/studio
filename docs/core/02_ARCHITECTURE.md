# Zenith Trainer - Architecture

**Created:** November 14, 2025
**Status:** Production Architecture (65-70% MVP Ready)

---

## Overview

Zenith Trainer follows a **Modular Monolith** architecture built on Next.js App Router with React Server Components. The application combines frontend (Next.js/React), backend (Firebase BaaS), and AI services (Genkit AI) in a cohesive, type-safe structure.

**Architectural Principles:**
1. **Feature-based organization:** Code grouped by domain (workout-builder, programs, analytics)
2. **Type-safe throughout:** TypeScript strict mode, Zod validation, type-safe AI flows
3. **Serverless-first:** Firebase BaaS eliminates server management
4. **Real-time by default:** Firestore listeners for live data sync
5. **AI-ready:** Genkit AI flows integrated from ground up

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS APP (App Router)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Client Components (Radix UI + Tailwind)      │   │
│  │  - Workout Builder (DnD), Execution Mode, Analytics │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Server Components                             │   │
│  │  - Data fetching, Auth checks, Initial render       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   NEXT.JS API ROUTES   │   │   FIREBASE CLIENT SDK        │
│  /api/ai/*             │   │  - Auth (email/password)     │
│  - Genkit AI flows     │   │  - Firestore (real-time)     │
│  - Server-side logic   │   │  - Storage (future)          │
└────────────┬───────────┘   └──────────────┬───────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   GENKIT AI (1.20.0)   │   │   FIREBASE BACKEND           │
│  - 5 AI flows          │   │  ┌──────────────────────────┐│
│  - Gemini API          │   │  │  Firestore (NoSQL)       ││
│  - Type-safe prompts   │   │  │  - 7 collections         ││
│                        │   │  │  - Real-time listeners   ││
│                        │   │  └──────────────────────────┘│
│                        │   │  ┌──────────────────────────┐│
│                        │   │  │  Firebase Auth           ││
│                        │   │  │  - Session management    ││
│                        │   │  └──────────────────────────┘│
│                        │   │  ┌──────────────────────────┐│
│                        │   │  │  Security Rules          ││
│                        │   │  │  - User-scoped access    ││
│                        │   │  └──────────────────────────┘│
└────────────────────────┘   └──────────────────────────────┘
```

---

## Frontend Architecture

### App Router Structure

**Next.js 15 App Router** (file-based routing):

```
src/app/
├── (auth)/                    # Auth group (shared layout)
│   ├── login/page.tsx        # Login page
│   └── signup/page.tsx       # Signup page
├── analytics/                 # Analytics dashboard
│   └── page.tsx
├── habits/                    # Habit tracking
│   └── page.tsx
├── library/                   # Exercise library
│   └── page.tsx
├── programs/                  # Program management
│   ├── page.tsx              # Programs list
│   └── [id]/page.tsx         # Program details
├── schedule/                  # Weekly schedule
│   └── page.tsx
├── workout-history/           # Workout logs
│   └── page.tsx
├── api/                       # API routes
│   └── ai/                    # AI endpoints
│       ├── insights/route.ts
│       ├── progression/route.ts
│       ├── recommendations/route.ts
│       ├── recovery/route.ts
│       └── nutrition/route.ts
├── layout.tsx                 # Root layout (nav, theme provider)
└── page.tsx                   # Home/dashboard
```

**Routing Strategy:**
- Static pages: Pre-rendered at build time (library, programs list)
- Dynamic pages: Server-side rendered (program details, workout history)
- Client-side navigation: Instant page transitions (Next.js prefetching)

### Component Architecture

**Component Types:**

1. **Server Components** (default in App Router)
   - Data fetching components
   - Auth checks (redirect if not authenticated)
   - Initial page rendering
   - Example: `app/programs/page.tsx`

2. **Client Components** (`'use client'`)
   - Interactive components (forms, modals, drag & drop)
   - State management (React hooks)
   - Event handlers
   - Example: `components/workout-builder/exercise-selector.tsx`

**Component Organization:**

```
src/components/
├── ui/                        # Radix UI primitives (Dialog, Select, etc.)
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── slider.tsx
│   └── ... (17 components total)
├── workout-execution/         # Workout execution mode
│   ├── exercise-tracker.tsx  # Track individual exercise
│   ├── rest-timer.tsx        # Rest timer
│   └── rpe-slider.tsx        # RPE input
├── workout-builder/           # Workout builder
│   ├── exercise-selector.tsx # Select exercises (DnD)
│   ├── workout-editor.tsx    # Edit workout
│   └── set-config.tsx        # Configure sets/reps
├── programs/                  # Program components
│   ├── program-card.tsx      # Program list item
│   ├── cycle-editor.tsx      # Edit program cycles
│   └── import-dialog.tsx     # ZTL import
├── analytics/                 # Analytics charts
│   ├── volume-chart.tsx      # Recharts volume over time
│   ├── progress-chart.tsx    # Exercise progression
│   └── stats-card.tsx        # Summary stats
├── habit-*.tsx                # Habit tracker components
│   ├── habit-card.tsx
│   ├── habit-log-swipe.tsx
│   └── habit-stats.tsx
├── main-nav.tsx               # Main navigation
├── theme-toggle.tsx           # Dark/Light mode toggle
└── ... (more feature components)
```

**Component Patterns:**

- **Composition:** Small, reusable components
- **Props typing:** TypeScript interfaces for all props
- **Controlled components:** Form inputs managed by React Hook Form
- **Optimistic updates:** UI updates immediately, syncs to Firestore in background

### State Management

**No global state library** (Zustand, Redux) - intentional choice:

**State Solutions:**

1. **Server State (Firestore):**
   - Real-time listeners via Firebase SDK
   - Example: `useEffect(() => onSnapshot(docRef, ...))`
   - Automatic sync across devices

2. **Form State:**
   - React Hook Form (minimal re-renders)
   - Zod validation
   - Example: Workout Builder, Exercise creation forms

3. **Local UI State:**
   - React `useState` for component-level state
   - Example: Modal open/close, active tab, timer state

4. **URL State:**
   - Search params for filters
   - Route params for IDs
   - Example: `/programs?filter=strength`

**Why no global state manager?**
- Firebase handles data sync
- Server Components reduce client state needs
- Local state sufficient for UI interactions
- Keeps bundle size small

---

## Backend Architecture

### Firebase BaaS Strategy

**Backend as a Service** - No custom server needed:

```
Firebase Backend
├── Authentication
│   ├── Email/Password provider
│   ├── Session tokens (httpOnly cookies)
│   └── User management
├── Firestore Database
│   ├── 7 collections (see Data Model)
│   ├── Real-time listeners
│   ├── Offline persistence (future)
│   └── Security Rules (user-scoped)
├── Storage (future)
│   ├── Workout videos
│   ├── Profile images
│   └── ZTL export files
└── Admin SDK (server-side)
    └── Used in Next.js API routes
```

**Advantages:**
- No server infrastructure to manage
- Auto-scaling (Firebase handles load)
- Real-time data sync out-of-box
- Built-in Auth and security
- Generous free tier

**Trade-offs:**
- Vendor lock-in to Google/Firebase
- Less control over backend logic
- Firestore pricing can scale with heavy usage
- **Mitigation:** ZTL export ensures data portability

### Data Model (Firestore)

**Collections (7 total):**

```typescript
// 1. Users
/users/{userId}
{
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultRestTime: number; // seconds
    defaultRPE: number; // 1-10
  };
}

// 2. Exercises (shared library)
/exercises/{exerciseId}
{
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'other';
  muscleGroups: string[]; // ['chest', 'triceps', ...]
  equipment: string[];
  description?: string;
  videoUrl?: string; // future
  isCustom: boolean; // true = user-created
  userId?: string; // if isCustom
  createdAt: Timestamp;
}

// 3. Workouts (templates)
/workouts/{workoutId}
{
  userId: string; // owner
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repsMin: number;
    repsMax: number;
    restTime: number; // seconds
    rpe?: number; // target RPE
    notes?: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 4. Programs (periodized training programs)
/programs/{programId}
{
  userId: string;
  name: string;
  description?: string;
  cycles: Array<{
    name: string; // 'Accumulation', 'Intensification', etc.
    weeks: number;
    workouts: string[]; // workoutIds
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ztlVersion?: string; // ZTL DSL version
}

// 5. Workout Logs (completed workouts)
/workoutLogs/{logId}
{
  userId: string;
  workoutId?: string; // template reference (optional)
  programId?: string; // if part of program
  date: Timestamp; // when workout performed
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      reps: number;
      weight: number;
      rpe: number; // 1-10
      completed: boolean;
    }>;
  }>;
  duration: number; // seconds
  notes?: string;
  createdAt: Timestamp;
}

// 6. Habits
/habits/{habitId}
{
  userId: string;
  name: string;
  type: 'boolean' | 'count' | 'scale' | 'duration';
  goal?: number; // for count/scale/duration types
  frequency: 'daily' | 'weekly' | 'custom';
  reminders?: Array<{ time: string; enabled: boolean }>;
  createdAt: Timestamp;
  archived: boolean;
}

// 7. Habit Logs
/habitLogs/{logId}
{
  userId: string;
  habitId: string;
  date: Timestamp;
  value: boolean | number; // depends on habit type
  notes?: string;
  createdAt: Timestamp;
}
```

**Indexing Strategy:**
- Composite indexes: `userId + date` (for history queries)
- Single-field indexes: Auto-created by Firestore
- Query optimization: Limit results, use pagination

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Exercises: read all, write own custom exercises
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Workouts: users can only access their own
    match /workouts/{workoutId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Programs: users can only access their own
    match /programs/{programId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Workout Logs: users can only access their own
    match /workoutLogs/{logId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Habits: users can only access their own
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Habit Logs: users can only access their own
    match /habitLogs/{logId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## AI Architecture

### Genkit AI Integration

**Genkit Framework (1.20.0):**

```
src/ai/
├── flows/                     # AI flows (5 total)
│   ├── insights.ts           # Workout insights
│   ├── progression.ts        # Progression suggestions
│   ├── recommendations.ts    # Training recommendations
│   ├── recovery.ts           # Recovery analysis
│   └── nutrition.ts          # Nutrition tips
└── index.ts                   # Genkit config
```

**AI Flow Architecture:**

```typescript
// Example: Progression Suggestions flow
import { ai } from '@/ai';
import { z } from 'zod';

export const progressionFlow = ai.defineFlow(
  {
    name: 'progressionSuggestions',
    inputSchema: z.object({
      userId: z.string(),
      exerciseId: z.string(),
      recentLogs: z.array(z.object({
        weight: z.number(),
        reps: z.number(),
        rpe: z.number(),
        date: z.string(),
      })),
    }),
    outputSchema: z.object({
      shouldIncrease: z.boolean(),
      reason: z.string(),
      newWeight: z.number().optional(),
      newReps: z.number().optional(),
    }),
  },
  async (input) => {
    // AI logic: analyze recent performance
    const { response } = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: `Analyze the following workout progression...`,
      // ... AI processing
    });
    
    return parsedResponse;
  }
);
```

**AI Flow Execution:**

1. User triggers AI action (e.g., clicks "Get Progression Suggestions")
2. Client calls Next.js API route: `POST /api/ai/progression`
3. API route validates request, checks Auth
4. API route invokes Genkit flow with user data
5. Genkit calls Gemini API, processes response
6. API route returns structured result to client
7. Client displays AI suggestions in UI

**Type Safety:**
- Input/output schemas with Zod
- TypeScript types generated from schemas
- No untyped AI responses

---

## ZTL DSL Architecture

### Zenith Training Language (ZTL)

**Purpose:** Machine-readable format for training programs

**Architecture:**

```
src/lib/ztl/
├── parser.ts                  # YAML → TypeScript objects
├── validator.ts               # Zod schema validation
├── converter.ts               # TypeScript ↔ Firestore
├── exporter.ts                # Firestore → YAML file
├── importer.ts                # YAML file → Firestore
└── schemas.ts                 # Zod schemas for ZTL
```

**ZTL Format (YAML):**

```yaml
version: "1.0"
metadata:
  name: "5/3/1 Strength Program"
  author: "user@example.com"
  created: "2025-11-01"
  
cycles:
  - name: "Wave 1"
    weeks: 3
    workouts:
      - name: "Squat Day"
        exercises:
          - exercise: "Back Squat"
            sets: 5
            reps: 5
            intensity: "85% 1RM"
            rest: 180
            rpe: 8
            
      - name: "Bench Day"
        exercises:
          - exercise: "Bench Press"
            sets: 5
            reps: 5
            intensity: "85% 1RM"
```

**Bidirectional Workflow:**

1. **Export:** Firestore program → ZTL YAML → User downloads
2. **AI Analysis:** User sends YAML to Claude/Gemini (with embedded prompts)
3. **AI Response:** AI returns structured recommendations (patches)
4. **Import (Stage 4.2.2):** User uploads patch → ZTL parser → Firestore update

**Benefits:**
- Programs are portable (not locked in Zenith Trainer)
- Version control (users can Git track programs)
- Community sharing (programs on GitHub)
- AI-readable (standardized format for analysis)

---

## Deployment Architecture

### Current: Development

**Local Development:**
- Next.js dev server (localhost:3000)
- Turbopack for fast refresh
- Firebase Emulators (optional, not currently used)

**Environment Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase config

GOOGLE_GENAI_API_KEY=... (for Gemini AI)
```

### Future: Production (Not Yet Decided)

**Options Under Consideration:**

**Option 1: Vercel (Recommended)**
- Pros: Best Next.js support, auto-scaling, edge functions, great DX
- Cons: Vendor lock-in, costs scale with traffic
- Fit: Excellent - Next.js creators, zero config

**Option 2: Netlify**
- Pros: Simple deploy, good free tier
- Cons: Less Next.js optimization than Vercel
- Fit: Good alternative

**Option 3: Self-hosted (Railway, Fly.io, Digital Ocean)**
- Pros: More control, predictable pricing
- Cons: More setup, need to manage infrastructure
- Fit: Possible for cost optimization

**Decision Criteria:**
- Cost at scale (MVP < $50/month ideal)
- Next.js compatibility (Server Components, API routes)
- Performance (edge network, CDN)
- DX (CI/CD, preview deploys)

---

## Security Architecture

### Authentication Flow

```
User Login
    │
    ▼
Firebase Auth (Email/Password)
    │
    ├─ Success → Generate session token (httpOnly cookie)
    │             │
    │             ▼
    │         Set client-side Auth state
    │             │
    │             ▼
    │         Redirect to Dashboard
    │
    └─ Failure → Show error message
```

### Data Access Control

**Firestore Security Rules:**
- User-scoped access (users can only read/write their own data)
- Auth required for all operations
- Server-side validation (double-check in API routes)

**API Route Security:**
```typescript
// Example: /api/ai/progression
export async function POST(req: Request) {
  // 1. Verify Firebase Auth token
  const session = await getServerSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  // 2. Validate request body (Zod)
  const body = await req.json();
  const validated = inputSchema.parse(body);
  
  // 3. Check user owns the data
  if (validated.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // 4. Process request
  const result = await progressionFlow(validated);
  
  return Response.json(result);
}
```

---

## Performance Optimizations

### Current Optimizations

**Code Splitting:**
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Route-based chunks

**Image Optimization:**
- Next.js `<Image>` component (future: exercise images)
- WebP format, lazy loading

**Firestore Query Optimization:**
- Limit results (e.g., last 30 workout logs)
- Composite indexes for common queries
- Pagination for large datasets

**Bundle Size:**
- Tree-shaking (ES modules)
- No unused Radix UI components imported
- Minimal dependencies (~60 total)

### Future Optimizations

**Caching:**
- Firebase offline persistence (Firestore cache)
- React Query for API response cache (if needed)
- Service Worker for PWA (post-MVP)

**Performance Monitoring:**
- Firebase Performance (immediate priority)
- Web Vitals tracking
- Lighthouse CI

---

## Testing Architecture

### Current: Limited Testing

**TypeScript Strict Mode:**
- Catches type errors at compile time
- No `any` types in critical modules

**ESLint:**
- Code quality enforcement
- Catches common bugs

### Future: Comprehensive Testing

**Unit Tests (Vitest):**
- ZTL parser/validator
- Utility functions
- Zod schemas

**Component Tests (React Testing Library):**
- Radix UI component wrappers
- Form validation
- Interactive components

**Integration Tests (Playwright):**
- API routes
- Firestore operations
- AI flows

**E2E Tests (Playwright - IMMEDIATE PRIORITY):**
- Critical paths:
  1. Login → Create Workout → Execute → View History
  2. Create Program → Export ZTL → Import ZTL
  3. Track Habits → View Analytics

---

## Scalability Considerations

### Current Scale (MVP)

**Target:**
- 100-1,000 users initially
- 10-100 concurrent users
- ~1,000 Firestore reads/writes per day per user

**Firebase Free Tier:**
- 50k reads/day, 20k writes/day (sufficient for MVP)
- 1GB storage (ample)
- 10GB bandwidth (sufficient)

### Future Scale (Post-MVP)

**Growth Path:**
- 10,000+ users
- 1,000+ concurrent users
- Firestore: Upgrade to Blaze plan (pay-as-you-go)
- Firebase: Auto-scales to millions of users

**Bottlenecks:**
- Firestore reads (caching, offline persistence)
- AI API costs (Gemini rate limits, implement usage limits)
- Vercel function execution time (15s max free tier, 60s pro)

**Mitigation:**
- Redis cache for frequently accessed data
- AI usage limits (e.g., 10 AI requests/day free, unlimited paid)
- Edge functions for low-latency responses

---

## Conclusion

**Zenith Trainer's architecture is:**
- ✅ Modern (Next.js 15, React 18, Firebase 11, Genkit AI)
- ✅ Type-safe (TypeScript strict, Zod validation)
- ✅ Scalable (Firebase BaaS auto-scales)
- ✅ Maintainable (Feature-based organization, clear separation)
- ✅ AI-ready (Genkit framework, type-safe flows)

**Architectural strengths:**
- Serverless (no infrastructure management)
- Real-time (Firestore listeners)
- Portable data (ZTL DSL)
- Modern DX (Turbopack, App Router, hot reload)

**Areas for improvement:**
- Testing coverage (E2E tests immediate priority)
- Performance monitoring (Firebase Performance)
- Caching strategy (offline persistence)

---

**Last Updated:** November 14, 2025
**Status:** Production-Ready Architecture (65-70% MVP)
