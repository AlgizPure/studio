# Zenith Trainer

> **AI-Driven Fitness Platform with ZTL DSL and Bidirectional AI Workflow**

**Status:** 🟡 In Progress (65-70% MVP Ready)
**Current Stage:** 4.2.1 Complete
**Version:** 4.2.1

---

## 📖 Overview

Zenith Trainer is a modern web-based fitness tracking platform that combines comprehensive workout management with AI-powered insights. Built with Next.js 15, React 18, and Firebase, it features an industry-first **ZTL DSL** (Zenith Training Language) for programmatic workout program description and a **bidirectional AI workflow** for professional training analysis.

### 🎯 Key Innovations

1. **ZTL DSL (Zenith Training Language)** - YAML-based domain-specific language for training programs
   - Export programs as structured YAML
   - Import/parse programs from YAML
   - AI-ready format with embedded analysis prompts

2. **Bidirectional AI Workflow**
   - Export program + performance data → Claude/Gemini analyzes → Import AI recommendations
   - One-click apply AI-suggested modifications (Stage 4.2.2 - in progress)

3. **Comprehensive Analytics**
   - Volume tracking, RPE analytics, progress visualizations (Recharts)
   - Advanced visualizations: heatmaps, radar charts (Stage 4.3 - 60% complete)

4. **Habit Tracker 2.0** (in progress)
   - Multi-dimensional life tracking (8 life contexts)
   - Daily reflection system, Wheel of Life visualization
   - AI insights for habit formation (Stages 3-6 - 40% complete)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- Firebase project (Firestore + Authentication)
- Google Gemini API key (for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/AlgizPure/studio.git
cd studio

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config and Gemini API key

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI (for AI features)
GEMINI_API_KEY=your_gemini_api_key
```

### First Run

1. Start development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Sign up with email/password or Google OAuth
4. Explore the app or check documentation

---

## 📁 Project Structure

```
zenith-trainer/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── programs/        # Program management
│   │   ├── execute/         # Workout execution
│   │   ├── history/         # Workout history
│   │   ├── analytics/       # Analytics & charts
│   │   ├── habits/          # Habit Tracker 2.0
│   │   └── api/             # API routes (AI endpoints)
│   │
│   ├── components/          # React components
│   │   ├── ui/              # Radix UI wrapper components
│   │   ├── workout-*/       # Workout-specific
│   │   ├── program-*/       # Program-specific
│   │   └── habit-*/         # Habit-specific
│   │
│   ├── lib/                 # Utilities & helpers
│   │   ├── types/           # TypeScript types & Zod schemas
│   │   ├── ztl/             # ZTL DSL parser/converter
│   │   └── calculations/    # Volume, 1RM, RPE calculations
│   │
│   ├── firebase/            # Firebase config
│   │   ├── auth.ts          # Authentication
│   │   └── firestore.ts     # Firestore setup
│   │
│   └── ai/                  # AI integration (Genkit)
│       ├── genkit.config.ts # Genkit setup
│       └── flows/           # 5 AI flows (Insights, Progression, etc.)
│
├── docs/                    # Project documentation
│   ├── core/                # Core documentation (6 files)
│   ├── requirements/        # Module requirements (15 files)
│   └── progress/            # Progress tracking (3 files)
│
├── UPMT/                    # Universal Project Management Template
└── .cursorrules             # Cursor AI rules
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.6 (App Router, Turbopack)
- **UI Library:** React 18.3.1 (Server Components)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 3.x
- **Components:** Radix UI (17 components)
- **Theme:** next-themes (dark/light mode)
- **Icons:** lucide-react
- **Charts:** Recharts 2.15.1
- **Drag & Drop:** @dnd-kit

### Backend
- **Platform:** Firebase 11.9.1
- **Database:** Firestore (7 collections)
- **Authentication:** Firebase Auth (email/password, Google OAuth)
- **Storage:** Firebase Storage (for future user uploads)
- **API:** Next.js API Routes

### AI Integration
- **Framework:** Genkit AI 1.20.0
- **Provider:** Google Gemini API
- **Flows:** 5 AI flows (Insights, Progression, Recommendations, Recovery, Nutrition)

### Data & Validation
- **Validation:** Zod (schemas for ZTL DSL + Firestore documents)
- **Date Handling:** date-fns
- **DSL:** Custom ZTL (YAML + Zod validation)

### Development Tools
- **Testing:** Playwright 1.56.1 (E2E - setup complete, tests pending)
- **Linting:** ESLint (Next.js config + TypeScript)
- **Type Checking:** TypeScript strict mode

See [Tech Stack Documentation](docs/core/03_TECH_STACK.md) for details.

---

## 📊 Module Status

**Overall Progress:** 65-70% MVP Ready

| Module | Status | Priority | Completion |
|--------|--------|----------|------------|
| Authentication | ✅ Complete | Critical | 100% |
| Exercise Library | ✅ Complete | Critical | 100% |
| Workout Builder | ✅ Complete | Critical | 100% |
| Program Management | ✅ Complete | Critical | 100% |
| Workout Execution | ✅ Complete | Critical | 100% |
| Workout History | ✅ Complete | Critical | 100% |
| Schedule & Planning | ✅ Complete | Critical | 100% |
| ZTL (DSL) | ✅ Complete | High | 100% |
| Data Management | ✅ Complete | Critical | 100% |
| Analytics | 🟡 In Progress | High | 95% |
| AI Integration | 🟡 In Progress | High | 60% |
| User Interface | 🟡 In Progress | Critical | 95% |
| Habit Tracker 2.0 | 🟡 In Progress | High | 40% |
| Performance | 🟡 In Progress | Medium | 60% |
| Testing & Quality | 🟡 In Progress | Medium | 20% |

**MVP Status:** 8/9 critical modules complete (89%) - **MVP Ready**

See [Module Status](docs/progress/modules_status.md) for detailed breakdown.

---

## 📖 Documentation

### Core Documentation
- [Project Essence](docs/core/00_PROJECT_ESSENCE.md) - Vision and key innovations
- [PRD](docs/core/01_PRD.md) - Product requirements (all 15 modules)
- [Roadmap](docs/core/02_ROADMAP.md) - Development timeline and milestones
- [Tech Stack](docs/core/03_TECH_STACK.md) - Complete technology stack
- [Architecture](docs/core/04_ARCHITECTURE.md) - System architecture and patterns
- [System Guide](docs/core/99_SYSTEM_GUIDE.md) - Comprehensive system guide

### Module Requirements
Each of the 15 modules has detailed requirements documentation in `docs/requirements/`:
- `01_authentication_requirements.md` through `15_testing_quality_requirements.md`

See [Requirements Index](docs/requirements/00_REQUIREMENTS_INDEX.md) for overview.

### Progress Tracking
- [Module Status](docs/progress/modules_status.md) - Current implementation status
- [Current Sprint](docs/progress/sprint_current.md) - Sprint planning and goals
- [Product Backlog](docs/progress/backlog.md) - Prioritized backlog (118 story points)

---

## 🎯 Current Priorities

### Immediate (Current Sprint)
1. UI Error Boundaries (5 story points) - Improve error handling
2. README Update (this file) - Complete project documentation

### Next Sprint (Development Sprint 1)
1. AI Integration Stage 4.2.2 (8 SP) - One-click apply recommendations
2. Analytics Stage 4.3 (6 SP) - Advanced visualizations (heatmaps, radar charts)
3. Performance Monitoring (5 SP) - Firebase Performance SDK

### Medium-term (3-6 months)
1. Habit Tracker 2.0 Stages 3-6 (34 SP) - Daily Reflection, Context Systems, AI
2. Comprehensive Testing (36 SP) - E2E, unit, integration tests

See [Current Sprint](docs/progress/sprint_current.md) and [Backlog](docs/progress/backlog.md) for details.

---

## 🧪 Testing

**Current Status:** Tooling setup complete, tests pending (20%)

- **TypeScript:** Strict mode enabled (100% coverage)
- **ESLint:** Configured (Next.js + TypeScript)
- **Playwright:** Installed (E2E tests not written yet)
- **Vitest:** To be added (unit/integration tests)

**Next Steps:**
1. Write E2E tests for critical flows (auth, workout execution, program management)
2. Add unit tests for utilities and business logic
3. Integration tests for API routes and components

See [Testing Requirements](docs/requirements/15_testing_quality_requirements.md) for strategy.

---

## 👥 Team

**Current Team:** Solo developer
**Development Approach:** Stage-based incremental development with AI-first mindset

---

## 📄 License

[License information to be added]

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [Firebase](https://firebase.google.com/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Charts by [Recharts](https://recharts.org/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)

---

## 📞 Contact

For questions or feedback, please open an issue on [GitHub](https://github.com/AlgizPure/studio/issues).

---

---

**Создано с помощью [Universal Project Management Template](https://github.com/AlgizPure/project-management-template)**

