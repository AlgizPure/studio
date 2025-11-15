# AI Integration Module Requirements

**Module ID:** Module 12
**Total Functions:** 6 (+ bidirectional workflow)
**Priority:** HIGH
**Status:** 🟡 Implemented 60% (Stage 4.2.1 complete, Stage 4.2.2 pending)
**Dependencies:** Analytics, ZTL Module, Workout History

---

## Overview

The AI Integration module provides AI-powered insights and recommendations using Google Gemini via Firebase Genkit. Five AI flows analyze workout data, suggest progressions, recommend programs, assess recovery, and provide nutrition guidance. The module enables a bidirectional workflow: export program/performance → AI analyzes → import recommendations.

Current implementation (60%): Genkit AI setup complete, 5 AI flows implemented, API endpoints functional, progression suggestions UI exists, Claude export functionality (ZTL with embedded prompts) complete. Missing (40%): Automatic analysis triggers, AI-generated structured patches, one-click import/apply.

**Key Innovation:**
- Bidirectional AI workflow: Export → Analyze (Claude/Gemini) → Import recommendations → Apply changes
- AI flows tailored to strength training (not generic fitness chatbots)
- Structured outputs (YAML patches for program modifications)

**Key Capabilities:**
- Genkit AI framework (Google) with Gemini API integration
- 5 AI flows: Insights, Progression, Recommendations, Recovery, Nutrition
- API endpoints (`/api/ai/*`) for triggering AI analysis
- Progression Suggestions Panel UI component
- Claude Analysis Export (ZTL YAML with embedded AI prompts)
- Future (Stage 4.2.2): Automatic analysis, patch generation, one-click apply

**Integration Points:**
- **Analytics:** Performance data fed to AI for context
- **ZTL Module:** Export/import mechanism for AI workflow
- **Workout History:** Historical data informs AI recommendations
- **Program Management:** AI suggestions applied to programs

---

## Core Functions

### Function 12.1: Genkit AI Setup - ✅ 100%

**Purpose:** Firebase Genkit framework configuration with Gemini API.

**Setup:**
- Framework: Firebase Genkit 1.20.0
- AI Model: Google Gemini (via @genkit-ai/google-genai)
- API Key: Stored in environment variable (`GEMINI_API_KEY`)

**Configuration:**
```typescript
// src/ai/genkit.config.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash', // Fast, cost-effective
});
```

**Technical:**
- Files: `src/ai/*`, `src/ai/flows/*`
- Environment: `.env.local` with `GEMINI_API_KEY`

---

### Function 12.2: AI Flows (5 Flows) - ✅ 100%

**Purpose:** Specialized AI analysis flows for fitness use cases.

**Implemented Flows:**

1. **Workout Insights Flow** (`src/ai/flows/insights.ts`)
   - Input: Recent workout logs (last 4 weeks)
   - Analysis: Pattern detection (plateaus, weak exercises, volume trends)
   - Output: Insights + action items
   - Example: "Volume increasing 15%/week (aggressive). Consider deload week 5."

2. **Exercise Progression Flow** (`src/ai/flows/progression.ts`)
   - Input: Exercise history (weight, reps, RPE over time)
   - Analysis: Optimal progression calculation (linear, double progression, etc.)
   - Output: Specific weight/rep recommendations for next workout
   - Example: "Bench Press: Increase to 102.5kg x 8-10 reps (RPE 8 target)"

3. **Program Recommendations Flow** (`src/ai/flows/recommendations.ts`)
   - Input: User goals, experience level, current program, performance
   - Analysis: Program design suggestions (periodization, exercise selection)
   - Output: Program structure or template suggestions
   - Example: "Switch to 5/3/1 BBB for strength focus. 4-day split recommended."

4. **Recovery Analysis Flow** (`src/ai/flows/recovery.ts`)
   - Input: RPE trends, workout feedback, habit data (sleep, stress)
   - Analysis: Fatigue detection, deload timing
   - Output: Recovery recommendations
   - Example: "RPE 9+ for 3 consecutive workouts. Deload recommended: -30% volume, maintain intensity."

5. **Nutrition Suggestions Flow** (`src/ai/flows/nutrition.ts`) - Optional
   - Input: Training volume, goals, body composition (if provided)
   - Analysis: Basic macro guidance (protein, calories)
   - Output: Nutrition suggestions (not a meal plan)
   - Example: "Target: 2800 kcal, 180g protein for muscle gain at current volume."

**Technical:**
- Each flow: Separate file in `src/ai/flows/`
- Prompt engineering: Specific, structured prompts for each use case
- Output format: JSON for structured data, Markdown for insights

---

### Function 12.3: AI API Endpoints - ✅ 100%

**Purpose:** Next.js API Routes for triggering AI flows.

**Endpoints:**
1. `/api/ai/insights` - POST - Trigger workout insights analysis
2. `/api/ai/progressions` - POST - Get progression suggestions for exercise
3. `/api/ai/recommendations` - POST - Get program recommendations
4. `/api/ai/recovery` - POST - Analyze recovery/fatigue
5. `/api/ai/nutrition` - POST - Get nutrition suggestions (optional)

**Example:**
```typescript
// /api/ai/progressions/route.ts
import { ai } from '@/ai/genkit.config';
import { progressionFlow } from '@/ai/flows/progression';

export async function POST(req: Request) {
  const { exerciseId, userId } = await req.json();

  // Fetch exercise history
  const history = await getExerciseHistory(userId, exerciseId);

  // Run AI flow
  const result = await ai.runFlow(progressionFlow, { history });

  return Response.json({ success: true, data: result });
}
```

**Technical:**
- Location: `src/app/api/ai/*`
- Authentication: Verify Firebase auth token
- Rate limiting: 10 requests/minute per user (future)

---

### Function 12.4: Progression Suggestions Panel - ✅ 100%

**Purpose:** UI component displaying AI progression recommendations.

**Location:** Program page, Exercise history modal

**Display:**
- Exercise name
- Current performance (last 3 workouts)
- AI suggestion: "Next workout: 102.5kg x 8-10 reps"
- Rationale: Brief explanation
- "Apply Suggestion" button (future: auto-apply to next workout)

**Technical:**
- Component: `ProgressionSuggestionsPanel` (`src/components/programs/progression-suggestions-panel.tsx`)
- Data: Fetch from `/api/ai/progressions`
- UI: Radix UI Card with Accordion for rationale

---

### Function 12.5: Claude Analysis Export (ZTL) - ✅ 100%

**Purpose:** Export program + performance data with embedded AI prompts for Claude analysis.

**Features:**
- Export program as ZTL YAML (see ZTL Module)
- Include performance data section (completed workouts, volume, RPE, feedback)
- Embed structured AI analysis prompt
- User sends YAML to Claude → Claude analyzes → Returns optimized YAML

**AI Prompt (Embedded in YAML):**
```yaml
ai_analysis_prompt: |
  You are a certified strength & conditioning coach analyzing this training program.

  PROGRAM OVERVIEW:
  - Name: [name]
  - Goal: [goal]
  - Duration: [weeks]
  - Completion: [X weeks complete, Y remaining]

  PERFORMANCE SUMMARY:
  - Average volume: [X kg/week]
  - Volume trend: [increasing/stable/decreasing]
  - Average RPE: [X.X] (target: 7-8)
  - Adherence: [X]%
  - Recent feedback: [tags]

  ANALYSIS CHECKLIST:
  1. **Volume Progression:** Is weekly volume increase appropriate? (+5-10% is ideal)
  2. **Deload Timing:** Based on RPE trends, is a deload needed? When?
  3. **Exercise Balance:** Push/pull ratio? Muscle group coverage?
  4. **RPE Distribution:** Signs of overtraining (RPE >9 consistently)?
  5. **Recommendations:** Specific, actionable changes

  OUTPUT FORMAT:
  Return modified YAML with recommended changes.
  Add comments (starting with #) explaining each modification.
  Preserve original structure, only modify necessary fields.

  Example modification:
  ```yaml
  # RECOMMENDATION: Reduce volume week 3 (RPE consistently >9)
  weeks:
    week_3:
      monday:
        exercises:
          - name: "Bench Press"
            sets: 3  # Reduced from 4 to manage fatigue
  ```
```

**Technical:**
- Implemented in ZTL Module (Function 8.4)
- See ZTL requirements for full specification

---

### Function 12.6: One-Click Apply Recommendations - ❌ Not Started (Stage 4.2.2, 0%)

**Purpose:** Automatically apply AI-recommended changes to programs.

**Planned Workflow:**
1. User exports program + performance (ZTL YAML)
2. User sends to Claude/Gemini for analysis
3. AI returns modified YAML with recommendations (comments explain changes)
4. User imports modified YAML
5. **New:** Import preview shows diff (original vs. AI-optimized)
6. User clicks "Apply Recommendations" → Changes applied to program
7. Original program saved as backup (version control)

**Diff Preview Example:**
```
Week 3, Monday, Bench Press:
- Sets: 4 → 3 (AI: Reduce to manage fatigue)
- RPE Target: 8 → 7 (AI: Lower intensity for recovery)

Week 5: New deload week added
- All exercises: -30% volume, maintain intensity
```

**Technical:**
- Diff algorithm: Compare original vs. AI-modified YAML
- UI: Diff view with accept/reject per change (future: granular control)
- Current: Accept all or reject all
- Storage: Save original as `programId_backup_{timestamp}`

**Estimated Effort:**
- 8-10 hours / 8 story points

---

## Module-Level Requirements

### Performance Requirements
- AI flow response: <5s (Gemini inference time)
- API endpoint: <6s total (fetch data + AI + return)
- Export ZTL: <3s (see ZTL Module)
- Import preview: <1s (diff calculation)

### Security Requirements
- API authentication: Verify Firebase auth token
- Rate limiting: Prevent abuse (10 req/min per user)
- API key security: `GEMINI_API_KEY` in environment variable (never client-side)

### Cost Requirements
- Gemini API: ~$0.001 per analysis (Gemini 1.5 Flash)
- Budget: ~$10/month for 10,000 analyses
- Rate limiting prevents runaway costs

### Accessibility Requirements
- Progression panel: Keyboard accessible, screen reader announces suggestions
- Diff view: Clear visual diff (color-coded: green = addition, red = removal)

### Browser/Platform Support
- AI flows: Server-side (Node.js runtime), browser-agnostic
- UI components: All modern browsers

---

## Implementation Notes

**Status:**
- Stage 4.2.1: ✅ Complete (60% of module)
- Stage 4.2.2: ❌ Not Started (40% of module)

**Recommended Implementation Order (for remaining 40%):**
1. Function 12.6: One-click Apply Recommendations (8-10 hours / 8 story points)
2. Automatic analysis triggers (4-6 hours / 5 story points) - Optional enhancement
3. Patch generation format (2-3 hours / 3 story points) - Optional enhancement

**Estimated Effort (Remaining):**
- Function 12.6: 8-10 hours / 8 story points
- **Total Remaining:** 8-10 hours / 8 story points

**Technical Risks & Mitigation:**
- **Risk:** AI output inconsistent (invalid YAML, no comments, poor recommendations)
  **Mitigation:** Structured prompts, validation layer, fallback to manual editing
- **Risk:** Gemini API cost escalation
  **Mitigation:** Rate limiting, caching common queries, use Gemini Flash (cheaper)
- **Risk:** User confusion with AI suggestions (trust)
  **Mitigation:** Clear explanations, show rationale, allow rejection

**Dependencies on External Factors:**
- Google Gemini API availability (99.9% SLA)
- Gemini model quality (improving over time)
- Firebase Genkit framework stability (active development)

---

## Related Documentation

- [ZTL Module Requirements](./08_ztl_requirements.md)
- [Analytics Requirements](./09_analytics_requirements.md)
- [Program Management Requirements](./04_program_management_requirements.md)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 60% Complete (Stage 4.2.1 done, Stage 4.2.2 pending)
