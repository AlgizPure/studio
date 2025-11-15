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

## ✨ Features

### Core Training Features

**🏋️ Workout Builder**
- Drag & drop exercise ordering with @dnd-kit
- Set/rep/weight configuration with validation
- Superset, circuit, and triset support
- Workout templates for quick creation
- RPE (Rate of Perceived Exertion) tracking (1-10 scale)

**📅 Program Management**
- Multi-week program creation (4-52 weeks)
- Periodization cycles (accumulation, intensification, deload)
- Program templates and cloning
- Auto-scheduling to weekly calendar

**▶️ Workout Execution**
- Real-time set-by-set tracking
- Automatic rest timer with notifications
- RPE slider for intensity tracking
- Exercise notes and post-workout feedback tags
- Workout completion flow with summary

**📊 Analytics & Progress**
- Volume tracking (weekly, monthly aggregates)
- Exercise-specific performance history
- Progress charts (Recharts line/bar/area charts)
- Calendar view of workout history
- RPE trend analysis

### Advanced Features

**🤖 ZTL DSL (Zenith Training Language)**

Industry-first YAML-based DSL for training programs. Example:

```yaml
program:
  name: "Beginner Strength 12-Week"
  weeks: 12
  cycles:
    - name: "Accumulation"
      weeks: 4
      focus: "Volume building"

  workouts:
    - day: "Monday"
      name: "Upper Body Push"
      exercises:
        - name: "Bench Press"
          sets: 4
          reps: 8-10
          rpe_target: 7-8
```

**Export → Analyze → Import workflow:**
1. Export program as ZTL YAML (includes performance data + embedded prompts)
2. Send to Claude/Gemini for professional analysis
3. AI returns structured recommendations
4. Import back with one click (Stage 4.2.2)

**🧠 AI Integration (Genkit + Gemini)**
- 5 AI flows: Insights, Progression, Recommendations, Recovery, Nutrition
- Automatic analysis triggers (planned)
- Context-aware suggestions based on performance data

**🎯 Habit Tracker 2.0** (40% complete)
- Core habit tracking (daily, weekly, count, duration types)
- Streak tracking with swipeable mobile interface
- Daily Reflection (Stage 3 - planned)
- Wheel of Life visualization (Stage 4 - planned)
- AI habit insights (Stage 5-6 - planned)

**📱 Exercise Library**
- 500+ pre-defined exercises
- Custom exercise creation
- Category filtering (strength, cardio, flexibility, sports)
- Muscle group filtering
- Equipment filtering
- Search functionality

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** (recommended: 20+)
  ```bash
  # Check version
  node --version  # Should be v18.x or higher
  ```
- **npm or yarn**
- **Firebase project** with Firestore + Authentication enabled
- **Google Gemini API key** (for AI features) - [Get one here](https://ai.google.dev/)

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
# Get these from Firebase Console > Project Settings > General
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI (for AI features)
# Get API key from https://ai.google.dev/
GEMINI_API_KEY=your_gemini_api_key
```

### Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or use existing
   - Enable Google Analytics (optional)

2. **Enable Firestore Database:**
   - Firebase Console > Build > Firestore Database
   - Create database (start in test mode for development)
   - Location: choose closest region

3. **Enable Authentication:**
   - Firebase Console > Build > Authentication
   - Enable Email/Password provider
   - (Optional) Enable Google provider for OAuth

4. **Get Configuration:**
   - Project Settings > General > Your apps > Web app
   - Copy config values to `.env.local`

5. **Security Rules:**
   - Firestore rules are in `firestore.rules` (user-scoped access)
   - Deploy: `firebase deploy --only firestore:rules` (requires Firebase CLI)

### First Run

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. **Sign up** with email/password or Google OAuth

4. **Explore:**
   - Browse Exercise Library
   - Create your first workout
   - Build a training program
   - Execute a workout and track progress
   - Check Analytics for insights

---

## 📁 Project Structure

```
zenith-trainer/
├── src/
│   ├── app/                 # Next.js App Router (routes)
│   │   ├── (auth)/          # Authentication routes (sign-in, sign-up)
│   │   ├── dashboard/       # Main dashboard
│   │   ├── library/         # Exercise library
│   │   ├── workouts/        # Workout management
│   │   ├── programs/        # Program management
│   │   ├── execute/         # Workout execution mode
│   │   ├── history/         # Workout history & logs
│   │   ├── analytics/       # Analytics & charts
│   │   ├── schedule/        # Weekly schedule planning
│   │   ├── habits/          # Habit Tracker 2.0
│   │   └── api/             # API routes (AI endpoints)
│   │
│   ├── components/          # React components
│   │   ├── ui/              # Radix UI wrapper components (17 components)
│   │   ├── workout-*/       # Workout-specific components
│   │   ├── program-*/       # Program-specific components
│   │   ├── habit-*/         # Habit-specific components
│   │   ├── analytics-*.tsx  # Chart components
│   │   └── main-nav.tsx     # Navigation
│   │
│   ├── lib/                 # Utilities & helpers
│   │   ├── types/           # TypeScript types & Zod schemas
│   │   ├── ztl/             # ZTL DSL parser/converter
│   │   ├── calculations/    # Volume, 1RM, RPE calculations
│   │   └── utils.ts         # General utilities
│   │
│   ├── firebase/            # Firebase configuration
│   │   ├── auth.ts          # Authentication setup
│   │   ├── firestore.ts     # Firestore setup
│   │   └── storage.ts       # Storage setup (future)
│   │
│   └── ai/                  # AI integration (Genkit)
│       ├── genkit.config.ts # Genkit setup
│       └── flows/           # 5 AI flows
│           ├── insights.ts
│           ├── progression.ts
│           ├── recommendations.ts
│           ├── recovery.ts
│           └── nutrition.ts
│
├── docs/                    # Project documentation
│   ├── core/                # Core documentation (6 files)
│   │   ├── 00_PROJECT_ESSENCE.md
│   │   ├── 01_PRD.md
│   │   ├── 02_ROADMAP.md
│   │   ├── 03_TECH_STACK.md
│   │   ├── 04_ARCHITECTURE.md
│   │   └── 99_SYSTEM_GUIDE.md
│   │
│   ├── requirements/        # Module requirements (15 files)
│   │   ├── 01_authentication_requirements.md
│   │   ├── 02_exercise_library_requirements.md
│   │   └── ... (13 more modules)
│   │
│   └── progress/            # Progress tracking (3 files)
│       ├── modules_status.md
│       ├── sprint_current.md
│       └── backlog.md
│
├── UPMT/                    # Universal Project Management Template
│   ├── ClaudeCode_web_dev/  # Development system for Claude Code
│   ├── structure-templates/ # Templates for docs
│   └── bootstrap/           # Bootstrap configuration
│
├── firestore.rules          # Firestore security rules
├── .cursorrules             # Cursor AI rules
├── .env.local               # Environment variables (create from .env.example)
└── package.json             # Dependencies
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.6 (App Router, Turbopack)
- **UI Library:** React 18.3.1 (Server Components)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 3.x
- **Components:** Radix UI (17 components: Dialog, Select, Toast, Dropdown, etc.)
- **Theme:** next-themes (dark/light/system mode)
- **Icons:** lucide-react
- **Charts:** Recharts 2.15.1
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable

### Backend
- **Platform:** Firebase 11.9.1
- **Database:** Firestore (7 collections: users, exercises, workouts, programs, workoutLogs, habits, habitLogs)
- **Authentication:** Firebase Auth (email/password, Google OAuth)
- **Storage:** Firebase Storage (for future user uploads)
- **API:** Next.js API Routes

### AI Integration
- **Framework:** Genkit AI 1.20.0 (Google's official AI framework)
- **Provider:** Google Gemini API
- **Flows:** 5 AI flows (Insights, Progression, Recommendations, Recovery, Nutrition)

### Data & Validation
- **Validation:** Zod (schemas for ZTL DSL + Firestore documents)
- **Date Handling:** date-fns
- **DSL:** Custom ZTL (YAML + Zod validation)

### Development Tools
- **Testing:** Playwright 1.56.1 (E2E - setup complete, tests pending)
- **Linting:** ESLint (Next.js config + TypeScript)
- **Type Checking:** TypeScript strict mode (100% typed, no `any`)
- **Formatting:** Prettier (auto-format on save)

See [Tech Stack Documentation](docs/core/03_TECH_STACK.md) for details and version verification.

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
1. ✅ README Update (this file) - Complete project documentation
2. UI Error Boundaries (5 story points) - Improve error handling

### Next Sprint (Development Sprint 1)
1. AI Integration Stage 4.2.2 (8 SP) - One-click apply recommendations
2. Analytics Stage 4.3 (6 SP) - Advanced visualizations (heatmaps, radar charts)
3. Performance Monitoring (5 SP) - Firebase Performance SDK

### Medium-term (3-6 months)
1. Habit Tracker 2.0 Stages 3-6 (34 SP) - Daily Reflection, Context Systems, AI
2. Comprehensive Testing (36 SP) - E2E, unit, integration tests
3. Tech Stack Migration (React 19, Next.js 16, Firebase 12, Zod 4)

See [Current Sprint](docs/progress/sprint_current.md) and [Backlog](docs/progress/backlog.md) for details.

---

## 🧪 Testing

**Current Status:** Tooling setup complete, tests pending (20%)

- **TypeScript:** Strict mode enabled (100% coverage, no `any` types)
- **ESLint:** Configured (Next.js + TypeScript rules)
- **Playwright:** Installed (E2E tests not written yet)
- **Vitest:** To be added (unit/integration tests)

**Next Steps:**
1. Write E2E tests for critical flows (auth, workout execution, program management)
2. Add unit tests for utilities and business logic (ZTL parser, calculations)
3. Integration tests for API routes and components

**Test Coverage Targets:**
- E2E: 5 critical flows (auth, workout, program, library, habit)
- Unit: 80%+ for utilities and business logic
- Integration: API routes + critical components

See [Testing Requirements](docs/requirements/15_testing_quality_requirements.md) for strategy.

---

## 🛠️ Contributing

We welcome contributions! Here's how to get started:

### Reporting Issues

- **Bug Reports:** Use [GitHub Issues](https://github.com/AlgizPure/studio/issues) with the "bug" label
  - Include: steps to reproduce, expected vs. actual behavior, screenshots
  - Environment: browser, OS, Node.js version

- **Feature Requests:** Use [GitHub Issues](https://github.com/AlgizPure/studio/issues) with the "enhancement" label
  - Describe the problem it solves
  - Propose a solution (optional)

### Pull Requests

1. **Fork & Clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/studio.git
   cd studio
   ```

2. **Create Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Changes:**
   - Follow code style (see below)
   - Write tests for new features
   - Update documentation if needed
   - Ensure all tests pass

4. **Commit:**
   ```bash
   git commit -m "type(scope): description

   - Detail 1
   - Detail 2

   Closes #123"
   ```

   **Commit types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

5. **Push & Create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open PR on GitHub
   - Fill out PR template
   - Link related issues

### Code Style Requirements

**TypeScript:**
- ✅ Strict mode (no `any` types - use `unknown` if needed)
- ✅ Explicit return types for functions
- ✅ Interface over type for objects

**ESLint:**
- ✅ Fix all linter errors before commit (`npm run lint`)
- ✅ No warnings in production code

**Formatting:**
- ✅ Prettier auto-format (`npm run format`)
- ✅ Consistent import ordering

**Testing:**
- ✅ Tests pass (`npm test`)
- ✅ Add tests for new features
- ✅ Coverage doesn't decrease

**Documentation:**
- ✅ Update docs if API/behavior changes
- ✅ Add comments for complex logic
- ✅ Follow [Project Rules](UPMT/structure-templates/AI_INSTRUCTIONS/All_Project_rules.md)

### Development Workflow

See [Dev Rules](UPMT/ClaudeCode_web_dev/rules/dev-rules.md) and [Code Quality Checklist](UPMT/ClaudeCode_web_dev/rules/code-quality-checklist.md) for detailed guidelines.

---

## 🐛 Troubleshooting

### Common Issues

**1. Firebase Connection Errors**

```bash
Error: Firebase: Error (auth/invalid-api-key)
```

**Solution:**
- Check `.env.local` has correct Firebase config
- Ensure API key is valid (Firebase Console > Project Settings)
- Verify Firebase project exists and isn't deleted

---

**2. Gemini API Errors**

```bash
Error: API key not valid. Please pass a valid API key.
```

**Solution:**
- Get API key from https://ai.google.dev/
- Add to `.env.local`: `GEMINI_API_KEY=your_key`
- Restart dev server after adding env var

---

**3. Port Already in Use**

```bash
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

**4. TypeScript Errors After Install**

```bash
Error: Cannot find module '@/components/ui/button'
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

---

**5. Firestore Permission Denied**

```bash
Error: Missing or insufficient permissions
```

**Solution:**
- Ensure user is authenticated (sign in first)
- Check Firestore rules allow user access
- Verify Firebase Auth is enabled
- For development: set Firestore to test mode (allows all authenticated users)

---

**6. Build Errors**

```bash
# If build fails, try:
npm run build

# Check for:
# - TypeScript errors (fix with `npm run type-check`)
# - ESLint errors (fix with `npm run lint`)
# - Missing environment variables
```

---

### Getting Help

If you encounter issues not listed here:

1. Check [GitHub Issues](https://github.com/AlgizPure/studio/issues) for similar problems
2. Search [Next.js Docs](https://nextjs.org/docs) and [Firebase Docs](https://firebase.google.com/docs)
3. Open a new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (Node version, OS, browser)
   - What you've already tried

---

## ❓ FAQ

### General Questions

**Q: What is ZTL DSL?**

A: ZTL (Zenith Training Language) is a YAML-based domain-specific language we created for describing workout programs in a structured, AI-readable format. It allows you to export your training program as code, analyze it with AI (Claude/Gemini), and import recommendations back into the app.

**Q: How does the AI integration work?**

A: We use Google's Genkit framework with Gemini API. The app has 5 AI flows:
1. **Insights** - Analyze workout performance patterns
2. **Progression** - Suggest weight/volume increases
3. **Recommendations** - Program optimization suggestions
4. **Recovery** - Deload and rest recommendations
5. **Nutrition** - Macro and calorie guidance

You can also export programs as ZTL YAML and analyze them with Claude for professional coaching insights.

**Q: Is this free to use?**

A: Yes, the app is open source (MIT License). You'll need your own Firebase project (free tier available) and Gemini API key (free tier: 60 requests/minute).

**Q: Can I use this offline?**

A: Not yet. The app requires internet connection for Firebase (database, auth) and AI features. Offline mode is planned for future releases.

### Technical Questions

**Q: What browsers are supported?**

A: Modern browsers with ES6+ support:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

**Q: Can I self-host this?**

A: Yes! You can deploy to:
- Vercel (recommended - Next.js creator)
- Netlify
- Railway
- Any platform supporting Next.js

Firebase backend is cloud-hosted (Firebase free tier).

**Q: How do I migrate my data?**

A: Currently, data export is available via ZTL (programs only). Full data export (workouts, history, habits) is planned. For now, data is stored in your Firebase project - you own it.

**Q: What about privacy/security?**

A: - All data stored in **your** Firebase project (you own it)
- Firestore security rules enforce user-scoped access
- Passwords hashed via Firebase Auth (bcrypt)
- HTTPS enforced
- No third-party analytics (yet)

**Q: Can I contribute to ZTL DSL?**

A: Absolutely! ZTL is defined in `src/lib/ztl/` with Zod schemas. We welcome:
- New fields/metadata
- Performance optimizations
- Validation improvements
- Documentation

See [Contributing](#-contributing) section.

---

## 📸 Screenshots & Demo

> **Note:** Screenshots and demo video coming soon after UI finalization.

**Planned sections:**
- Dashboard overview
- Workout Builder (drag & drop)
- Workout Execution mode (RPE tracking)
- Analytics charts (progress visualization)
- ZTL DSL export/import flow
- Habit Tracker interface

**Live Demo:** Coming soon (after MVP completion)

---

## 🗺️ Roadmap

### Phase 1: MVP Completion (Current - 3 months)
- ✅ Core training features (100% complete)
- ✅ ZTL DSL (100% complete)
- 🟡 AI Integration Stage 4.2.2 (60% complete)
- 🟡 Advanced Analytics (95% complete)
- 🟡 Habit Tracker 2.0 (40% complete)
- 🔲 Comprehensive testing (20% complete)

### Phase 2: Refinement & Polish (Months 4-6)
- Additional AI features (auto-analysis triggers)
- Mobile responsiveness improvements
- Performance optimizations
- E2E testing suite
- User feedback integration

### Phase 3: Advanced Features (Months 7-12)
- Mobile app (React Native or PWA)
- Social features (share workouts, community programs)
- Template marketplace
- Advanced AI (program generation, injury prediction)
- Nutrition tracking module
- Integration APIs (Strava, Fitbit, etc.)

See [Roadmap Documentation](docs/core/02_ROADMAP.md) for detailed timeline.

---

## 👥 Team

**Current Team:** Solo developer
**Development Approach:** Stage-based incremental development with AI-first mindset
**Tech Stack:** Modern (Next.js 15, React 18, Firebase 11, Genkit 1.20)

**Built with:**
- Universal Project Management Template (UPMT)
- Claude Code for development assistance
- GitHub for version control

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**In short:**
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use
- ⚠️ License and copyright notice required

---

## 🙏 Acknowledgments

**Technologies:**
- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [Firebase](https://firebase.google.com/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Charts by [Recharts](https://recharts.org/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- Drag & drop by [@dnd-kit](https://dndkit.com/)
- Icons by [Lucide](https://lucide.dev/)

**Inspiration:**
- Strong App (workout tracking)
- Renaissance Periodization (training science)
- Linear (product design and UX)

**Special Thanks:**
- Claude (Anthropic) for development assistance
- Cursor for AI-powered IDE
- Open source community

---

## 📞 Contact & Support

**Questions or Feedback:**
- Open an issue: [GitHub Issues](https://github.com/AlgizPure/studio/issues)
- Discussions: [GitHub Discussions](https://github.com/AlgizPure/studio/discussions) (coming soon)

**Found a bug?** Please report it with:
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details

**Want a feature?** Open a feature request issue with:
- Problem description
- Proposed solution
- Use cases

---

## 🌟 Support the Project

If you find Zenith Trainer useful:
- ⭐ Star the repo on GitHub
- 🐛 Report bugs and suggest features
- 🔧 Contribute code (see [Contributing](#-contributing))
- 📢 Share with others who might find it useful
- 📝 Write about your experience using it

---

**Built with ❤️ using [Universal Project Management Template (UPMT)](https://github.com/AlgizPure/project-management-template)**
