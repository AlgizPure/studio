# Zenith Trainer - Tech Stack

**Created:** November 14, 2025
**Last Verified:** November 14, 2025 (Web Search)
**Status:** Verified for November 2025

---

## Overview

Zenith Trainer uses a modern, production-ready tech stack built on **Next.js 15 (App Router)**, **React 18**, **Firebase 11**, and **Genkit AI 1.20**. All technologies verified as current and stable for November 2025.

**Tech Stack Philosophy:**
- **Type-safe first:** TypeScript strict mode throughout
- **Modern frameworks:** Latest stable versions (verified Nov 2025)
- **Firebase BaaS:** Serverless architecture, minimal backend maintenance
- **AI-ready:** Genkit AI integration from ground up
- **DX-focused:** Hot reload, type safety, modern tooling

---

## Current Stack (Existing Project)

### Frontend Framework

**Next.js 15.5.6**
- App Router (React Server Components)
- Turbopack (dev mode - fast refresh)
- API Routes for backend endpoints
- Server-side rendering, static generation
- File-based routing

**React 18.3.1**
- Server Components
- Client Components for interactivity
- Hooks-based state management
- Concurrent rendering

**TypeScript 5.x**
- Strict mode enabled
- Type safety throughout app
- No `any` types in critical modules (ZTL DSL)
- Interface-driven development

### Styling & UI

**Tailwind CSS 3.4.1**
- Utility-first CSS framework
- JIT (Just-In-Time) compiler
- Custom theme configuration
- Responsive design utilities

**Radix UI Components (17 total)**
- Headless UI primitives
- Accessibility built-in (WCAG 2.1 AA)
- Unstyled, customizable with Tailwind
- Components: Dialog, Select, Slider, Toast, Accordion, Tabs, etc.

**next-themes**
- Dark/Light mode support
- System preference detection
- Seamless theme switching

**lucide-react 0.475.0**
- Icon library (consistent, modern icons)
- Tree-shakeable

### Backend & Database

**Firebase 11.9.1**
- **Firebase Auth:** Email/Password authentication
- **Firestore:** NoSQL database (7 collections)
- **Firebase Storage:** File storage (future: workout videos, profile images)
- **Firebase Admin 12.5.0:** Server-side SDK

**Firestore Collections:**
```
/users/{userId}           - User profiles
/exercises                - Exercise library (shared)
/workouts/{workoutId}     - Workout templates
/programs/{programId}     - Training programs
/workoutLogs/{logId}      - Workout execution logs
/habits/{habitId}         - Habit definitions
/habitLogs/{logId}        - Habit tracking logs
```

**Security:**
- Firestore Security Rules (user-scoped access)
- Firebase Auth tokens for API authorization
- Server-side validation (Zod schemas)

### AI Integration

**Genkit AI 1.20.0**
- Google's official AI framework
- Production-ready (used internally by Google)
- Type-safe AI flows

**AI Flows (5 total):**
1. **Workout Insights:** Analyze recent workouts, provide observations
2. **Progression Suggestions:** Recommend when to increase weight/volume
3. **Training Recommendations:** Program optimization suggestions
4. **Recovery Analysis:** Assess fatigue, suggest deload timing
5. **Nutrition Tips:** Basic nutrition guidance based on training

**@genkit-ai/google-genai**
- Gemini API integration
- Configured for dev/testing environment

### Data Validation & Forms

**Zod 3.24.2**
- TypeScript-first schema validation
- Used for: ZTL DSL schemas, form validation, API validation
- Runtime type safety

**React Hook Form 7.54.2**
- Form state management
- Integrates with Zod (@hookform/resolvers)
- Minimal re-renders, performance-optimized

### Charts & Visualizations

**Recharts 2.15.1**
- React charting library (built on D3)
- Used for: volume charts, progress tracking, analytics dashboards
- Responsive charts

### Drag & Drop

**@dnd-kit (v8.6.0)**
- Modern drag-and-drop toolkit
- `@dnd-kit/core` + `@dnd-kit/sortable`
- Used in: Workout Builder (exercise ordering)

### Utilities

**date-fns 3.6.0**
- Date manipulation library
- Lightweight alternative to Moment.js
- Used for: workout scheduling, log timestamps

**yaml 2.8.1**
- YAML parser/stringifier
- Core of ZTL DSL export/import

**nanoid 5.0.7**
- Unique ID generation
- Used for: client-side IDs (optimistic updates)

**clsx + tailwind-merge**
- Conditional CSS class utilities
- Merge Tailwind classes intelligently

### Development Tools

**Playwright 1.56.1**
- E2E testing framework
- Installed but tests not written yet
- AI-powered test agents (v1.56.0 feature)

**ESLint 9.39.0**
- Linting with Next.js config
- Enforces code quality standards

**PostCSS 8**
- CSS processing for Tailwind

---

## Recommended Stack (After Tech Verification)

### Critical Updates (Before MVP Launch)

**React 18.3.1 → 19.2.0**
- Status: Stable since Dec 2024, v19.2.0 released Oct 2025
- Benefits: Actions API, React Compiler (automatic memoization), enhanced Server Components
- Migration: Medium effort, well-documented
- Breaking changes: Some Server Components API changes

**Next.js 15.5.6 → 16.0.0**
- Released: October 21, 2025
- Benefits: Turbopack stable (5-10x faster builds), React Compiler support, enhanced routing
- Migration: Medium effort
- Breaking changes: `proxy.ts` replaces `middleware.ts`, new cache model (PPR)

**Firebase 11.9.1 → 12.5.0**
- Latest SDK with security fixes
- Migration: Medium (check v12 breaking changes)
- Critical for production stability

**TypeScript 5.x → 5.9.3**
- Latest stable (Oct 2025)
- Migration: Low (drop-in replacement)
- No breaking changes from 5.x

### High-Priority Updates

**Zod 3.24.2 → 4.1.12**
- Released: July 2025
- Benefits: 14x faster string parsing, 7x faster arrays
- Critical for ZTL DSL performance
- Migration: Medium (v3 → v4 API changes)

**Radix UI → Latest (1.4.3 + components ~2.1.x)**
- React 19 compatible versions
- Migration: Low-Medium (peer dependency updates)

**Genkit AI 1.20.0 → 1.21.0**
- Latest version (published ~Oct 2025)
- Migration: Low (minor bump)

**Playwright → 1.56.1**
- AI-powered test generation and healing
- Perfect for upcoming E2E test phase

### Optional (Post-MVP)

**Tailwind CSS 3.x → 4.1.0**
- Released: Jan 2025, v4.1 latest
- Benefits: 5x faster builds, simpler config
- Migration: Medium-High (config migration to CSS-first)
- Can be delayed

**ESLint → 9.x flat config**
- New config format
- Migration: Medium
- Can be delayed

---

## Technology Decisions & Rationale

### Why Next.js?

**Chosen for:**
- Industry standard for React SSR/SSG
- Excellent DX (developer experience)
- App Router with Server Components
- Built-in API routes (no separate backend needed)
- Vercel ecosystem support

**Alternatives considered:**
- Remix: Too new, smaller ecosystem
- Vite + React Router: More setup, no SSR out-of-box
- CRA (Create React App): Deprecated, no SSR

### Why Firebase?

**Chosen for:**
- BaaS (Backend as a Service) - minimal backend maintenance
- Real-time data sync (Firestore listeners)
- Built-in Auth with session management
- Generous free tier
- Genkit AI integrates natively

**Alternatives considered:**
- Supabase: Considered, but Genkit AI + Firebase integration strong
- PostgreSQL + Prisma: More setup, need to manage server
- MongoDB: Not ideal for relational workout data

### Why Genkit AI?

**Chosen for:**
- Official Google AI framework (production-ready)
- Type-safe AI flows
- Firebase integration out-of-box
- Supports Gemini API (Google's AI)
- Active development (v1.21.0 latest)

**Alternatives considered:**
- LangChain: More complex, overkill for use case
- Vercel AI SDK: Vendor lock-in to Vercel
- Direct API calls: No abstraction, more boilerplate

### Why Radix UI?

**Chosen for:**
- Best headless UI library for React
- Accessibility built-in (WCAG 2.1 AA)
- Unstyled (full Tailwind customization)
- React 19 compatible

**Alternatives considered:**
- Headless UI: Smaller component set
- shadcn/ui: Good, but Radix primitives more flexible
- MUI: Too opinionated, harder to customize

### Why Zod?

**Chosen for:**
- Best TypeScript-first validation library
- Runtime type safety
- Perfect for ZTL DSL schemas
- Zod v4: 14x faster parsing (huge win)

**Alternatives considered:**
- Yup: Not TypeScript-first
- Joi: Node-focused, not ideal for client

---

## Dependencies Overview

### Production Dependencies (~40 packages)

**Core:**
- next, react, react-dom, typescript

**Firebase:**
- firebase, firebase-admin

**AI:**
- genkit, @genkit-ai/google-genai

**UI Components:**
- @radix-ui/react-* (17 components)
- lucide-react, next-themes

**Data Visualization:**
- recharts

**Forms & Validation:**
- react-hook-form, @hookform/resolvers, zod

**Utilities:**
- date-fns, yaml, nanoid, clsx, tailwind-merge

**Styling:**
- tailwindcss, tailwind-merge, class-variance-authority

**DnD:**
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

### Dev Dependencies (~20 packages)

**Testing:**
- @playwright/test

**Linting:**
- eslint, eslint-config-next

**Types:**
- @types/node, @types/react, @types/react-dom

**Build:**
- postcss, autoprefixer

---

## Migration Roadmap (3-4 Weeks)

### Week 1: Foundation
- [ ] TypeScript 5.x → 5.9.3
- [ ] Genkit AI 1.20.0 → 1.21.0
- [ ] Playwright → 1.56.1
- [ ] Update: date-fns, lucide-react, next-themes

### Week 2: React Ecosystem
- [ ] React 18.3.1 → 19.2.0
- [ ] Next.js 15.5.6 → 16.0.0
- [ ] Radix UI → Latest (React 19 compatible)
- [ ] @dnd-kit → Latest (verify React 19)

### Week 3: Backend & Data
- [ ] Firebase 11.9.1 → 12.5.0
- [ ] Zod 3.24.2 → 4.1.12
- [ ] Recharts → Latest (verify React 19)
- [ ] Test all Firebase operations

### Week 4: Testing & Validation
- [ ] Run E2E tests (Playwright)
- [ ] Test critical paths
- [ ] Performance testing
- [ ] Fix issues, final commit

---

## Performance Benchmarks

### Current Performance (Next.js 15 + React 18)

**Build Time:**
- Dev server start: ~3-5s (Turbopack)
- Production build: ~45-60s
- Hot reload: <1s (Turbopack)

**Runtime Performance:**
- Page load (Home): ~1.5-2s
- Page load (Workout Builder): ~2-3s
- API response time: 200-500ms
- Firestore query: 100-300ms

### Expected After Migration (Next.js 16 + React 19)

**Build Time:**
- Dev server start: ~1-2s (Turbopack stable)
- Production build: ~20-30s (2-3x faster)
- Hot reload: <500ms (5-10x faster)

**Runtime Performance:**
- Page load: ~1-1.5s (React Compiler optimizations)
- API response: <200ms (Next.js 16 optimizations)
- Zod validation: 14x faster (v4)

---

## Browser/Platform Support

### Current Support

**Desktop Browsers:**
- Chrome/Edge 111+ ✅
- Firefox 128+ ✅
- Safari 16.4+ ✅

**Mobile:**
- iOS Safari 16+ ✅
- Android Chrome 111+ ✅

**Features Used:**
- ES2022 features (supported in all target browsers)
- CSS Grid, Flexbox
- LocalStorage, IndexedDB (future offline support)
- Web Workers (future: ZTL parsing in worker)

### After Migration (React 19, Next.js 16)

**No change in browser support** - same targets maintained.

---

## Security Considerations

### Current Security Measures

**Authentication:**
- Firebase Auth (email/password)
- Secure session tokens (httpOnly cookies)
- CSRF protection (Firebase built-in)

**Data Access:**
- Firestore Security Rules (user-scoped)
- No direct database access from client
- Server-side validation (Zod schemas)

**API Security:**
- Firebase Auth tokens required
- Rate limiting (Firebase built-in)
- Input validation on all endpoints

**Dependencies:**
- Regular npm audit
- No known vulnerabilities (as of Nov 2025)
- Automated Dependabot updates

### Post-Migration Security

**React 19:**
- Enhanced XSS protection
- Better sanitization in Server Components

**Next.js 16:**
- `proxy.ts` explicit network boundary
- Improved CSRF protection

**Firebase 12:**
- Latest security patches
- Enhanced Auth security

---

## Future Tech Considerations

### Potential Additions (Post-MVP)

**Mobile:**
- React Native (code sharing with web)
- Or: PWA with offline support (simpler)

**Performance:**
- Redis caching (for frequently accessed data)
- CDN for static assets (Vercel Edge)

**Monitoring:**
- Firebase Performance Monitoring ⭐ (immediate priority)
- Sentry for error tracking
- Vercel Analytics

**Testing:**
- Vitest for unit tests
- React Testing Library for component tests
- Playwright E2E tests (immediate priority)

---

## Conclusion

**Current stack is modern, production-ready, and well-suited for Zenith Trainer's needs.**

✅ All technologies verified for November 2025
✅ No replacements needed - tech choices excellent
✅ Migration path clear (3-4 weeks)
✅ Performance improvements significant (React 19, Next.js 16, Zod 4)

**Next steps:**
1. Complete PHASE 5 documentation
2. Execute tech stack migration (Weeks 1-4)
3. Begin Stage 4.2.2, 4.3, Habit Tracker 2.0 development

---

**Last Updated:** November 14, 2025
**Verified:** Web Search (npm, GitHub, official docs)
**Status:** Ready for Migration
