# BOOTSTRAP INSTRUCTIONS FOR CLAUDE CODE

## Your Mission

Analyze all data in `/raw-data/` and bootstrap a complete project
management system following the documentation-driven approach.

## Phase 1: ANALYSIS (Autonomous - 1-2 hours)

### Task 1.1: Read Everything

Read ALL files in:
- `/raw-data/chats/` - All chat transcripts
- `/raw-data/documents/` - All documents
- `/raw-data/notes/` - All notes
- `/metadata.yaml` - Context about data

### Task 1.2: Extract Information

From all sources, extract:

**HIGH CONFIDENCE (clearly stated, consistent):**
- Project vision and goals
- Target audience / user personas
- Core features (must-have)
- Key user flows
- Success metrics
- Constraints and assumptions

**MEDIUM CONFIDENCE (stated but may have variations):**
- Technology preferences
- Architecture ideas
- Nice-to-have features
- Timeline expectations

**CONTRADICTIONS FOUND:**
List all contradictions with:
- Topic: [what contradicts]
- Source A: [chat-1] says [X]
- Source B: [chat-3] says [Y]
- Dates: [when discussed]

**GAPS / MISSING INFORMATION:**
List what's missing for complete project setup:
- Tech stack decisions
- Architecture patterns
- Database choice
- Deployment strategy
- etc.

### Task 1.3: Create Analysis Report

Generate: `/analysis-report.md`

Structure:
1. Executive Summary
2. High Confidence Findings
3. Medium Confidence Findings
4. Contradictions Found (with context)
5. Information Gaps
6. Recommended Questions for User

## Phase 2: INTERVIEW (Interactive - 30-60 min)

### Task 2.1: Present Findings

Show user:
1. What you found (summary)
2. What contradicts (need resolution)
3. What's missing (need answers)

### Task 2.2: Ask Questions

Generate questions in priority order:

**CRITICAL (must answer before proceeding):**
- Contradictions that affect architecture
- Core technology decisions
- Missing must-have information

**IMPORTANT (should answer for quality):**
- Nice-to-have features prioritization
- Timeline preferences
- Team composition

**OPTIONAL (can infer if not answered):**
- Detailed preferences
- Minor technical choices

### Task 2.3: Interactive Q&A

Ask questions ONE BY ONE or in BATCHES (user preference).

Wait for answers.

Record answers to `/interview-responses.md`.

## Auto-Fill Metadata Feature

**v1.0.1+: Вам НЕ нужно вручную заполнять metadata.yaml!**

### How it works:

1. **Leave metadata.yaml empty** (or partially filled)
2. **Add raw data** to 00_RAW_DATA_TEMPLATE/
3. **Run bootstrap**
4. **Answer questions** as Claude Code reads data
5. **metadata.yaml fills automatically**

### Interactive Q&A Process:

Claude Code will:
- Read all chats and documents
- Extract key information
- Ask you to confirm/clarify ambiguous points
- Fill metadata.yaml automatically

**Example questions:**
```
Claude: "Обнаружил название проекта: 'TaskFlow'. Подтверждаете?"
You: "Да"

Claude: "В ранних чатах: MongoDB, в поздних: PostgreSQL. Какой финальный выбор?"
You: "PostgreSQL"

Claude: "Целевая аудитория: удалённые команды 5-15 человек?"
You: "Да, верно"
```

### Tech Stack Recommendations

**Claude Code analyzes:**
- Technologies mentioned in raw data
- Current best practices (November 2025)
- Your project requirements
- Existing code (if applicable)

**Provides:**
- ✅ Verification of tech choices
- ⚠️ Warnings about outdated decisions
- 💡 Recommended alternatives with reasons
- 📋 Migration paths (if needed)

**Example output in TECH_STACK.md:**

```markdown
## Recommendations vs Raw Data

| Component | Raw Data Suggests | Our Recommendation | Reason |
|-----------|-------------------|--------------------| -------|
| Database  | MongoDB (2024-09) | PostgreSQL 16      | Relational data fits better, JSON support available |
| Frontend  | React 17          | React 19           | New compiler, better performance, same API |
| Hosting   | Heroku            | Railway or Vercel  | Heroku expensive, these alternatives better value |
```

### Existing Code Analysis

**If `existing_project.enabled: true` in metadata:**

Claude Code will:
1. Scan code directory (CLI) or GitHub repo (Web)
2. Detect implemented features
3. Compare with raw data requirements
4. Identify:
   - ✅ What's already done
   - 📋 What's planned but not done
   - ⚠️ Outdated dependencies
   - 💡 Modernization opportunities

**Output in PROGRESS_TRACKING/modules_status.md and state.md.**

### Process Details

See **AUTO_FILL_INSTRUCTIONS.md** for full Claude Code guidance on:
- Step-by-step extraction process
- Question formulation rules
- Tech stack verification methodology
- Existing code analysis techniques
- Recommendation generation logic

## Phase 3: SYNTHESIS (Quick - 15 min)

Combine:
- Extracted information (high confidence)
- Resolved contradictions (from interview)
- User answers (from interview)

Create unified view: `/synthesized-project-data.md`

## Phase 4: STRUCTURE DEPLOYMENT (Autonomous - 2-4 hours)

### Task 4.1: Create Documentation Structure

Deploy full system:

```
/PROJECT_CORE/
  00_PROJECT_ESSENCE.md
  01_PRD.md
  02_ROADMAP.md
  03_TECH_STACK.md
  04_ARCHITECTURE.md
  99_SYSTEM_GUIDE.md

/MODULES_REQUIREMENTS/
  _TEMPLATE_requirements.md
  [module1]_requirements.md
  [module2]_requirements.md
  ...

/CONTEXT_MEMORY/
  state.md
  decisions.md
  insights.md
  changes_log.md

/AI_INSTRUCTIONS/
  .cursorrules
  .clauderules
  project_instructions.md
  UPDATE_RULES.md
  CHANGE_SCENARIOS.md
  WORKFLOW_GUIDE.md

/PROGRESS_TRACKING/
  modules_status.md
  sprint_current.md
  backlog.md
```

### Task 4.2: Fill Core Documents

Fill each document with synthesized data:

**PROJECT_ESSENCE:**
- From vision discussions
- Core value proposition
- Target audience
- Must-have features

**PRD:**
- All features mentioned in chats
- Organized by priority
- User stories from discussions
- Acceptance criteria inferred or ask user

**ROADMAP:**
- Phases based on feature complexity
- MVP scope from discussions
- Timeline if mentioned

**TECH_STACK:**
- Technologies from synthesis
- Rationale from chat context
- Alternatives considered (if discussed)

**ARCHITECTURE:**
- Pattern from synthesis
- Component structure
- Data flow
- Integration points

### Task 4.3: Create Module Requirements

For each major feature/module identified:
- Create [module]_requirements.md
- Fill with functional requirements
- Use template structure
- Extract details from chats
- Mark TODOs where info is missing

### Task 4.4: Set Up Context Files

**state.md:**
- Current phase: Planning / Pre-development
- Last activity: Project bootstrapped
- Next steps: Review documentation

**decisions.md:**
- All decisions from chats (with dates)
- Sources (which chat)
- Rationale (context from discussion)

**insights.md:**
- Learnings from chat analysis
- Common themes
- Important considerations mentioned

## Phase 5: VALIDATION & REPORT (15 min)

### Task 5.1: Self-Check

Verify:
- [ ] All contradictions resolved or flagged?
- [ ] All critical info captured?
- [ ] Documents consistent with each other?
- [ ] No broken cross-references?
- [ ] All TODOs marked clearly?

### Task 5.2: Generate Bootstrap Report

Create: `/BOOTSTRAP_REPORT.md`

Include:

**1. WHAT WAS CREATED:**
- File tree (all created files)
- Statistics (pages, features, modules)

**2. DATA SOURCES ANALYZED:**
- List of all files read
- Information extracted from each

**3. DECISIONS MADE:**
- List decisions (with sources)
- Contradictions resolved (how)
- Gaps filled (how - inferred/asked)

**4. WHAT'S READY:**
-  Core documentation complete
-  Module requirements (X modules)
-  System rules configured
-  Ready for development

**5. WHAT NEEDS REVIEW:**
- Items marked TODO (with reasons)
- Inferred decisions (need confirmation)
- Assumptions made (need validation)

**6. NEXT STEPS FOR USER:**
1. Review all core documents
2. Confirm inferred decisions
3. Fill remaining TODOs
4. Start development!

### Task 5.3: Create Review Checklist

Generate: `/REVIEW_CHECKLIST.md`

For user to review each document systematically.

## Configuration

Work autonomously but:
- ASK before making major assumptions
- ASK if contradiction resolution unclear
- ASK if critical information missing
- INFORM user of progress every 30 min

Be thorough but pragmatic:
- Mark TODOs rather than block on minor details
- Infer reasonable defaults (document assumption)
- Focus on getting 80% complete - user can refine

## Success Criteria

System is ready when:
 User can read PROJECT_ESSENCE and understand project
 Developer can read PRD and start implementing
 AI assistant can read requirements and code
 Team can track progress from day 1

GO! =�
