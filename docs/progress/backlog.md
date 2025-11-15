# Product Backlog

**Project:** Zenith Trainer
**Last Updated:** November 15, 2025
**Backlog Status:** Prioritized

---

## Backlog Summary

| Priority | Story Points | Items | Status |
|----------|--------------|-------|--------|
| 🔴 Critical | 10 | 2 | Planned |
| 🟠 High | 42 | 5 | Planned |
| 🟡 Medium | 46 | 3 | Planned |
| 🟢 Low | 20 | 4 | Deferred |
| **TOTAL** | **118** | **14** | - |

---

## 🔴 CRITICAL PRIORITY

### 1. UI Error Boundaries Enhancement
**Module:** User Interface (Module 10)
**Story Points:** 5
**Estimated Hours:** 4-6
**Status:** 🟡 Partial (basic implementation exists)

**Description:**
Implement comprehensive error boundaries throughout the app with user-friendly fallback UI, error logging, and recovery mechanisms.

**Acceptance Criteria:**
- [ ] Error boundary per route (isolate failures)
- [ ] Fallback UI with "Try again" button
- [ ] Error details sent to logging service (future: Sentry)
- [ ] User-friendly error messages (no stack traces)
- [ ] "Report issue" link included
- [ ] Granular boundaries for critical components

**Technical Tasks:**
- Create ErrorBoundary component with fallback UI
- Wrap each route with ErrorBoundary
- Add error logging (console.error → future Sentry)
- Test error scenarios (throw errors, network failures)

**Dependencies:**
- None

**Value:** Prevents full app crashes, improves user experience during errors

---

### 2. README Update
**Module:** Project Setup
**Story Points:** 2
**Estimated Hours:** 1-2
**Status:** ❌ Not Started

**Description:**
Update project README.md with comprehensive project overview, setup instructions, and links to documentation.

**Acceptance Criteria:**
- [ ] Project description and key features
- [ ] Tech stack summary
- [ ] Setup instructions (install, Firebase config, env variables)
- [ ] Project structure overview
- [ ] Links to documentation (requirements, core docs)
- [ ] Contributing guidelines (future)
- [ ] License information

**Technical Tasks:**
- Replace placeholder README
- Add badges (build status, coverage - future)
- Document environment variables
- Add quick start guide

**Dependencies:**
- None

**Value:** Onboarding for new developers, project visibility

---

**Total Critical:** 7 story points, 5-8 hours

---

## 🟠 HIGH PRIORITY

### 3. AI Integration Stage 4.2.2 - One-Click Apply
**Module:** AI Integration (Module 12)
**Story Points:** 8
**Estimated Hours:** 8-10
**Status:** ❌ Not Started (Stage 4.2.1 complete)

**Description:**
Implement one-click application of AI-recommended program modifications with diff preview and backup system.

**Acceptance Criteria:**
- [ ] Import modified YAML (Claude/Gemini output)
- [ ] Diff algorithm compares original vs. AI-modified YAML
- [ ] Diff preview UI shows changes (color-coded)
- [ ] "Apply Recommendations" button
- [ ] Original program saved as backup (version control)
- [ ] Validation: Ensure AI output is valid YAML
- [ ] Error handling: Malformed AI output gracefully handled

**Technical Tasks:**
- YAML diff algorithm (compare objects, detect changes)
- Diff preview component (highlight additions/removals)
- Apply function (update program in Firestore)
- Backup mechanism (save original before applying)
- Validation layer (Zod schema for AI output)

**Dependencies:**
- ZTL Module (Function 8.5 - Claude export complete)

**Value:** Close AI feedback loop, makes AI recommendations actionable

---

### 4. Analytics Stage 4.3 - Advanced Visualizations
**Module:** Analytics (Module 9)
**Story Points:** 6
**Estimated Hours:** 6-8
**Status:** 🟡 Partial (basic charts exist)

**Description:**
Add advanced visualizations: heatmaps for volume distribution, radar charts for exercise balance.

**Acceptance Criteria:**
- [ ] Volume heatmap (week x day grid, color intensity)
- [ ] Exercise balance radar chart (push/pull/legs ratio)
- [ ] RPE trend heatmap (weekly RPE distribution)
- [ ] Interactive tooltips (hover for details)
- [ ] Export visualizations as PNG (future)

**Technical Tasks:**
- Implement Recharts heatmap (custom component)
- Implement Recharts radar chart
- Data aggregation functions (volume by day, muscle group balance)
- UI integration (Analytics page)

**Dependencies:**
- Recharts library (already installed)

**Value:** Deeper insights into training patterns, identify imbalances

---

### 5. Habit Tracker Stage 3 - Daily Reflection
**Module:** Habit Tracker 2.0 (Module 13)
**Story Points:** 5
**Estimated Hours:** 6-8
**Status:** ❌ Not Started (Core system complete)

**Description:**
Add end-of-day reflection prompts for holistic tracking (mood, energy, stress, sleep, gratitude).

**Acceptance Criteria:**
- [ ] Daily reflection modal/sheet (evening reminder)
- [ ] 5 scales (mood, energy, stress, sleep 1-10 with emoji selector)
- [ ] Gratitude field (optional, 3 things)
- [ ] Free-form notes field
- [ ] Save to Firestore (`/dailyReflections`)
- [ ] View past reflections (history page)
- [ ] Trend charts (mood/energy over time)

**Technical Tasks:**
- Create DailyReflection component (modal with inputs)
- Firestore collection: `/dailyReflections/{id}`
- Evening reminder (optional notification)
- Reflection history page with charts
- Data model + Zod schema

**Dependencies:**
- None

**Value:** Holistic life tracking, correlate habits with well-being

---

### 6. Habit Tracker Stage 4 - Context Systems
**Module:** Habit Tracker 2.0 (Module 13)
**Story Points:** 13
**Estimated Hours:** 12-16
**Status:** ❌ Not Started

**Description:**
Implement Wheel of Life multi-dimensional tracking (8 life contexts) with weekly assessments and radar chart visualization.

**Acceptance Criteria:**
- [ ] 8 life dimensions (fitness, career, relationships, growth, environment, fun, contribution, spirituality)
- [ ] Weekly self-assessment (1-10 sliders per dimension)
- [ ] Save to Firestore (`/weeklyContexts`)
- [ ] Radar chart visualization (Wheel of Life)
- [ ] Comparison view (current vs. previous week)
- [ ] Trend tracking (see improvement over time)
- [ ] Notes per dimension (optional)

**Technical Tasks:**
- Weekly context assessment UI (8 sliders)
- Firestore collection: `/weeklyContexts/{id}`
- Radar chart component (Recharts)
- Context history page
- Data model + Zod schema

**Dependencies:**
- Stage 3 (Daily Reflection) recommended first

**Value:** Life balance tracking, identify areas needing attention

---

### 7. Performance Monitoring
**Module:** Performance & Optimization (Module 14)
**Story Points:** 5
**Estimated Hours:** 4-6
**Status:** ❌ Not Started

**Description:**
Integrate Firebase Performance Monitoring SDK to track real-world app performance (page loads, API calls, custom traces).

**Acceptance Criteria:**
- [ ] Firebase Performance SDK installed
- [ ] Performance monitoring initialized (`src/firebase/performance.ts`)
- [ ] Custom traces for critical paths (workout execution, AI calls)
- [ ] Automatic traces (page loads, network requests)
- [ ] Performance dashboard configured (Firebase Console)
- [ ] Alerts for slow performance (TTI > 3s)

**Technical Tasks:**
- Install `firebase/performance`
- Initialize performance monitoring
- Add custom traces (workout flow, program loading, AI API)
- Configure alerts in Firebase Console
- Document performance targets

**Dependencies:**
- Firebase project (already configured)

**Value:** Monitor real user performance, identify bottlenecks

---

**Total High Priority:** 37 story points, 36-48 hours

---

## 🟡 MEDIUM PRIORITY

### 8. Habit Tracker Stage 5 - AI Insights
**Module:** Habit Tracker 2.0 (Module 13)
**Story Points:** 8
**Estimated Hours:** 6-8
**Status:** ❌ Not Started

**Description:**
AI-powered pattern detection and habit suggestions using Gemini API.

**Acceptance Criteria:**
- [ ] AI flow analyzes habit logs + reflections + contexts
- [ ] Detect correlations ("Mood 30% higher on workout days")
- [ ] Identify weak spots ("Career satisfaction low 3 weeks")
- [ ] Suggest new habits ("Add 'Morning walk' for energy boost")
- [ ] Timing optimization ("Best compliance before 10 AM")
- [ ] Display insights on Habits page

**Technical Tasks:**
- Create `habitInsightsFlow` AI flow (`src/ai/flows/habit-insights.ts`)
- API endpoint: `/api/ai/habit-insights`
- Insights panel component
- Prompt engineering for habit analysis

**Dependencies:**
- Stages 3-4 (need reflection + context data)
- AI Integration Module (Genkit setup complete)

**Value:** Actionable insights, personalized habit recommendations

---

### 9. Habit Tracker Stage 6 - Claude Integration
**Module:** Habit Tracker 2.0 (Module 13)
**Story Points:** 8
**Estimated Hours:** 7-10
**Status:** ❌ Not Started

**Description:**
Export habits + context to Claude for life coaching analysis with bidirectional workflow.

**Acceptance Criteria:**
- [ ] Export function generates YAML (habits, reflections, contexts)
- [ ] Embedded prompt (life coach persona)
- [ ] "Export for Claude" button on Habits page
- [ ] Download YAML file
- [ ] Import Claude's recommendations (optional)
- [ ] Preview imported suggestions

**Technical Tasks:**
- Export function: `exportHabitsForClaude()` (`src/lib/habits/export-claude.ts`)
- YAML structure with embedded prompt
- Export button on Habits page
- (Optional) Import parser for Claude's advice

**Dependencies:**
- Stages 3-4 (need reflection + context data)

**Value:** Human-in-the-loop AI coaching, personalized advice

---

### 10. Comprehensive Testing Suite
**Module:** Testing & Quality (Module 15)
**Story Points:** 36
**Estimated Hours:** 38-50
**Status:** 🟡 Partial (tooling setup complete)

**Description:**
Implement comprehensive E2E, unit, and integration tests to ensure code quality and prevent regressions.

**Acceptance Criteria:**

**E2E Tests (13 story points):**
- [ ] Authentication flow (sign up, login, logout, password reset)
- [ ] Workout execution flow (start workout → log sets → complete)
- [ ] Program management flow (create program → assign workouts → schedule)
- [ ] Exercise library flow (browse, filter, create custom)
- [ ] Habit tracking flow (create, log, view streak)

**Unit Tests (13 story points):**
- [ ] Calculation utilities (volume, 1RM, RPE)
- [ ] Date utilities (week calculations, formatting)
- [ ] ZTL parser/converter
- [ ] Zod schemas (validation tests)

**Integration Tests (10 story points):**
- [ ] API routes + Firestore (CRUD operations)
- [ ] React components + state (workout logger, program builder)
- [ ] Multi-step workflows (program creation → export ZTL)

**Technical Tasks:**
- Write Playwright E2E tests (`tests/e2e/`)
- Write Vitest unit tests (`tests/unit/`)
- Write integration tests (`tests/integration/`)
- Configure CI/CD (GitHub Actions - future)
- Setup coverage reporting (Codecov - future)

**Dependencies:**
- Playwright and Vitest installed (complete)

**Value:** Prevent regressions, ensure code quality, confidence in deployments

---

**Total Medium Priority:** 52 story points, 51-68 hours

---

## 🟢 LOW PRIORITY (NICE-TO-HAVE)

### 11. Social Features
**Module:** Future Module
**Story Points:** 20
**Status:** 🔵 Planned (not started)

**Description:**
Add social features: share workouts, follow friends, leaderboards.

**Deferred Reason:** Not core to MVP, requires significant backend work

---

### 12. Mobile App (React Native)
**Module:** Future Module
**Story Points:** 50
**Status:** 🔵 Planned (not started)

**Description:**
Build native mobile app using React Native to complement web app.

**Deferred Reason:** Web app is mobile-responsive (PWA viable), native app is Phase 2

---

### 13. Workout Video Demos
**Module:** Exercise Library Enhancement
**Story Points:** 8
**Status:** 🔵 Planned (not started)

**Description:**
Add video demos for exercises (embedded YouTube or uploaded videos).

**Deferred Reason:** Not critical, can use external links temporarily

---

### 14. Nutrition Tracking
**Module:** Future Module
**Story Points:** 30
**Status:** 🔵 Planned (not started)

**Description:**
Full nutrition tracking module (macros, calories, meal planning).

**Deferred Reason:** Out of scope for v1.0, many existing apps do this well

---

**Total Low Priority:** 108 story points (deferred)

---

## Backlog Grooming Notes

### Recently Added
- README update (moved to Critical after bootstrap)
- Habit Tracker Stages 3-6 (broken down from single epic)

### Recently Removed
- None

### Estimation Adjustments
- Testing suite increased from 30 to 36 story points (more comprehensive scope)

---

## Sprint Planning Recommendations

### Next Sprint (2 weeks, 20-25 story points)
**Recommended Items:**
1. UI Error Boundaries (5 SP) - Critical, quick win
2. README Update (2 SP) - Critical, quick win
3. AI Integration Stage 4.2.2 (8 SP) - High value, completes AI workflow
4. Analytics Stage 4.3 (6 SP) - High value, near completion
5. Performance Monitoring (5 SP) - Medium, infrastructure improvement

**Total:** 26 story points (slightly above capacity, but manageable)

### Sprint After Next
**Recommended Items:**
1. Habit Tracker Stage 3 (5 SP)
2. Habit Tracker Stage 4 (13 SP)
3. Testing - E2E (13 SP) - Start testing suite

**Total:** 31 story points (split across 2 sprints if needed)

---

## Backlog Health

**Health Score:** 🟢 Healthy

**Strengths:**
- Clear prioritization (Critical → High → Medium → Low)
- Realistic estimates (story points + hours)
- Well-defined acceptance criteria
- Dependencies identified
- Value statements for each item

**Areas for Improvement:**
- Consider breaking down larger items (36 SP testing suite)
- Add more granular tasks for complex items
- Include user stories ("As a [user], I want [feature], so that [value]")

---

**Backlog Maintenance:** Review and groom monthly or before each sprint planning
