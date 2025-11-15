# ZTL (Zenith Training Language) Module Requirements

**Module ID:** Module 8
**Total Functions:** 7 (+ bidirectional workflow)
**Priority:** HIGH
**Status:** ✅ Implemented 100% (Stage 4.2.1 Complete)
**Dependencies:** Program Management, Workout Builder

---

## Overview

ZTL (Zenith Training Language) is an industry-first YAML-based Domain-Specific Language (DSL) for workout programs. It enables programmatic manipulation, version control (Git), sharing, and AI analysis of training programs. Programs become code - versionable, shareable, and AI-readable.

The bidirectional workflow (Export → Claude/AI Analysis → Import recommendations) represents a paradigm shift in fitness programming, allowing users to leverage powerful AI models for sophisticated program analysis previously available only through expensive personal trainers.

**Key Innovation:**
- First fitness app with programmatic DSL for workout programs
- Embedded AI analysis prompts in exported YAML for guided AI review
- Structured YAML format enables GitHub templates, version control, community sharing
- Bidirectional workflow: Export program + performance data → AI analyzes → Returns optimized YAML → One-click import

**Key Capabilities:**
- YAML-based program specification (metadata, cycles, weeks, exercises)
- Zod schema validation for structure integrity
- Import: YAML file → Firestore program (with validation and preview)
- Export: Firestore program → YAML file (with embedded AI prompts)
- Error handling with human-readable messages (line numbers, field details)
- Bidirectional workflow integration with Claude and Gemini AI

**Integration Points:**
- **Program Management:** ZTL exports/imports programs from this module
- **AI Integration:** Exported ZTL used for AI analysis (Stage 4.2.1 complete)
- **Workout Builder:** Imported programs create workouts
- **Analytics:** Performance data embedded in ZTL exports for AI context

---

## Core Functions

### Function 8.1: ZTL DSL Specification

**Purpose:** Define structured YAML format for workout programs.

**ZTL Structure:**
```yaml
version: "1.0"
metadata:
  name: "Strength Q1 2025"
  goal: strength  # strength | hypertrophy | endurance | general
  duration_weeks: 12
  training_days_per_week: 4
  start_date: "2025-01-06"
  author: "user@example.com"

cycles:
  - name: "Accumulation"
    type: accumulation  # accumulation | intensification | peak | deload
    weeks: [1, 2, 3, 4]
    focus: "Volume building phase"

  - name: "Intensification"
    type: intensification
    weeks: [5, 6, 7, 8]
    focus: "Increase intensity, reduce volume"

weeks:
  week_1:
    monday:
      workout_name: "Push Day A"
      exercises:
        - name: "Barbell Bench Press"
          sets: 4
          target_reps: "8-12"
          target_weight: 100  # kg
          rest_seconds: 90
          rpe_target: 8
          notes: "Focus on bar path"
    wednesday:
      workout_name: "Pull Day A"
      exercises: [...]
    friday:
      workout_name: "Legs Day A"
      exercises: [...]

performance_data:  # Optional, for AI analysis exports
  week_1:
    monday:
      completed: true
      actual_exercises:
        - name: "Barbell Bench Press"
          sets:
            - { weight: 100, reps: 12, rpe: 8 }
            - { weight: 100, reps: 10, rpe: 8.5 }
            - { weight: 100, reps: 9, rpe: 9 }
            - { weight: 100, reps: 8, rpe: 9.5 }
      total_volume: 3900
      duration_minutes: 48
      feedback: ["felt-strong"]

ai_analysis_prompt: |
  Analyze this training program using periodization principles.
  Focus on:
  1. Volume progression appropriateness
  2. Deload timing and necessity
  3. Exercise selection balance (push/pull ratio, muscle groups)
  4. RPE distribution (avoiding overtraining)
  5. Recommendations for next cycle

  Provide structured recommendations in YAML patch format.
```

**Technical:**
- Files: `src/lib/ztl/types.ts`, `schema.ts`
- Validation: Zod schemas for each section
- Version: Semantic versioning (1.0, 1.1, 2.0)

---

### Function 8.2: YAML Parser with Validation

**Purpose:** Parse YAML files into TypeScript objects with comprehensive validation.

**Key Requirements:**
- Library: `yaml` (npm package) for parsing
- Validation: Zod schemas for structure validation
- Error handling: Line numbers, field names, detailed messages
- Support: Multi-document YAML (future: templates + program in one file)

**Validation Layers:**
1. **Syntax:** Valid YAML format
2. **Structure:** Matches Zod schema (required fields, types)
3. **Business Logic:** Cycles don't overlap, weeks within duration, dates valid
4. **References:** Exercises exist in library (or create placeholders)

**Error Example:**
```
Import Error at line 23:
  Field: cycles[0].weeks
  Issue: Overlapping weeks detected
  Cycle "Accumulation": weeks 1-4
  Cycle "Intensification": weeks 3-6
  Resolution: Adjust cycle weeks to avoid overlap
```

**Technical:**
- Files: `src/lib/ztl/parser.ts`
- Method: `parseZTL(yamlString: string): Promise<ParsedProgram | ParseError>`

---

### Function 8.3: ZTL to Firestore Converter

**Purpose:** Convert parsed ZTL object to Firestore program structure.

**Key Requirements:**
- Map ZTL structure to Firestore `/programs/{programId}` document
- Create nested cycles → weeks → workouts
- Denormalize workout names for quick display
- Generate IDs: `nanoid()` for program, cycles, workouts
- Handle missing exercises: Create placeholders or skip

**Conversion Logic:**
```typescript
const ztlToFirestore = (ztl: ParsedZTL, userId: string): ProgramDocument => {
  return {
    id: nanoid(),
    userId,
    name: ztl.metadata.name,
    goal: ztl.metadata.goal,
    durationWeeks: ztl.metadata.duration_weeks,
    startDate: Timestamp.fromDate(new Date(ztl.metadata.start_date)),
    cycles: ztl.cycles.map(cycle => ({
      id: nanoid(),
      name: cycle.name,
      type: cycle.type,
      startWeek: Math.min(...cycle.weeks),
      endWeek: Math.max(...cycle.weeks),
      goal: cycle.focus,
      weeks: buildWeeksFromZTL(ztl.weeks, cycle.weeks)
    })),
    createdAt: serverTimestamp()
  };
};
```

**Technical:**
- Files: `src/lib/ztl/converter.ts`

---

### Function 8.4: Firestore to ZTL Exporter

**Purpose:** Export Firestore programs as ZTL YAML files.

**Key Requirements:**
- Fetch program from Firestore
- Fetch all associated workouts
- Optionally include performance data (for AI analysis exports)
- Embed AI analysis prompt
- Format as valid YAML
- Download as `.yaml` file

**Export Types:**
1. **Program Only:** Structure without performance data
2. **Program + Performance:** Full export with workout logs (for AI analysis)

**Performance Data Inclusion:**
- Query `/workoutLogs` where `programId == program.id`
- Aggregate by week and day
- Include: completed flag, actual sets/reps/weight, volume, duration, feedback

**Technical:**
- Files: `src/lib/ztl/export-full-analysis.ts`
- Method: `exportProgramToZTL(programId: string, includePerformance: boolean): Promise<string>`
- Download: Browser File API (`downloadFile(filename, yamlString)`)

---

### Function 8.5: Import Dialog with Preview

**Purpose:** User interface for importing ZTL files with validation and preview.

**Key Requirements:**
- File picker: Select `.yaml` file from local disk
- Parse & validate: Show progress indicator
- Preview: Display parsed program structure (name, cycles, weeks, workout count)
- Validation results: Show errors/warnings if any
- Options: "Import", "Cancel", "Edit YAML" (opens text editor)

**Preview Display:**
- Program name, duration, goal
- Cycles list (name, type, weeks)
- First 3 workouts preview
- Stats: Total exercises, estimated hours

**Validation States:**
- ✅ Valid: "Ready to import" → "Import" button enabled
- ⚠️ Warnings: "Import with cautions" → Warnings listed, import allowed
- ❌ Errors: "Cannot import" → Errors listed, import blocked

**Technical:**
- Component: `ImportProgramDialog` (`src/components/import-program-dialog.tsx`)
- File read: FileReader API
- Parsing: Async with progress indicator

---

### Function 8.6: Human-Readable Error Messages

**Purpose:** Provide clear, actionable error messages for invalid YAML.

**Key Requirements:**
- Line numbers: "Error at line 45"
- Field path: "cycles[1].weeks"
- Issue description: "Overlapping weeks detected"
- Resolution suggestion: "Adjust cycle weeks to avoid overlap"

**Error Categories:**
1. **Syntax Errors:** Invalid YAML (missing colon, indentation)
2. **Schema Errors:** Missing fields, wrong types
3. **Business Logic Errors:** Overlapping cycles, invalid dates
4. **Reference Errors:** Workout/exercise not found

**Technical:**
- Custom error class: `ZTLParseError`
- Error formatting: Template with line, field, issue, resolution

---

### Function 8.7: Bidirectional AI Workflow

**Purpose:** Enable Export → AI Analysis → Import cycle for program optimization.

**Workflow:**
1. **Export:** User exports program with performance data → ZTL YAML generated with embedded AI prompt
2. **AI Analysis:** User sends YAML to Claude/Gemini → AI analyzes using embedded prompt → Returns optimized YAML
3. **Import:** User imports AI-optimized YAML → Preview shows changes → One-click import updates program

**AI Prompt Embedding:**
```yaml
ai_analysis_prompt: |
  You are a strength & conditioning expert analyzing this training program.

  PROGRAM CONTEXT:
  - Goal: [goal from metadata]
  - Duration: [weeks]
  - Current completion: [X weeks completed]

  PERFORMANCE DATA:
  - Volume trend: [increasing/stable/decreasing]
  - Average RPE: [X.X]
  - Adherence: [X]%

  ANALYSIS TASKS:
  1. Evaluate volume progression (is it appropriate for goal?)
  2. Check deload timing (is deload needed? when?)
  3. Assess exercise balance (push/pull ratio, muscle group coverage)
  4. Review RPE distribution (signs of overtraining?)
  5. Provide specific recommendations

  OUTPUT FORMAT:
  Return updated YAML with recommended changes.
  Include comments explaining each modification.
```

**AI Output Expected:**
```yaml
# Modified version with recommendations
version: "1.0"
metadata:
  name: "Strength Q1 2025 (AI Optimized)"
  # ... rest of metadata

# RECOMMENDATION 1: Volume progression too aggressive
# Current: +12% weekly volume increase
# Suggested: +8% for sustainability
cycles:
  - name: "Accumulation (Modified)"
    # Reduced sets from 4→3 for week 3 to manage fatigue
    weeks: [1, 2, 3, 4]

# RECOMMENDATION 2: Add deload week 5
  - name: "Deload"
    type: deload
    weeks: [5]
    focus: "Recovery before intensification"
```

**Technical:**
- Stage 4.2.1: ✅ Complete (export with prompts)
- Stage 4.2.2: Planned (one-click import AI recommendations)

---

## Module-Level Requirements

### Performance Requirements
- Parse YAML: <2s for typical program (12 weeks, 50 workouts)
- Export YAML: <3s (including performance data fetch)
- Import preview render: <1s
- File download: Instant (browser native)

### Security Requirements
- Sanitize YAML input: Prevent injection attacks
- File size limit: 5MB max (prevents DoS)
- User can only import to their own account

### Accessibility Requirements
- Import dialog: Keyboard accessible, screen reader compatible
- Error messages: Clear, announced to screen readers
- Preview: Semantic HTML for structure

### Browser/Platform Support
- All modern browsers (File API support)
- Mobile: File picker works on iOS/Android

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 8.1: DSL Specification (foundation)
2. Function 8.2: Parser + Validation (core import)
3. Function 8.3: ZTL to Firestore (complete import flow)
4. Function 8.4: Firestore to ZTL (export)
5. Function 8.5: Import Dialog (UI)
6. Function 8.6: Error Messages (polish)
7. Function 8.7: AI Workflow (advanced feature)

**Estimated Effort:**
- Function 8.1: 3-4 hours / 3 story points (spec design)
- Function 8.2: 6-8 hours / 5 story points (parsing + validation complexity)
- Function 8.3: 4-6 hours / 5 story points (conversion logic)
- Function 8.4: 5-7 hours / 5 story points (export + performance data)
- Function 8.5: 4-6 hours / 5 story points (UI dialog)
- Function 8.6: 2-3 hours / 2 story points (error formatting)
- Function 8.7: 3-4 hours / 3 story points (AI prompt design)
- **Total Module Estimate:** 27-38 hours / 28 story points

**Technical Risks & Mitigation:**
- **Risk:** YAML parsing edge cases (encoding, special characters)
  **Mitigation:** Extensive test coverage, fuzzing with malformed inputs
- **Risk:** AI output unpredictable (invalid YAML returned)
  **Mitigation:** Validate AI output same as user input, provide fallback
- **Risk:** Large YAML files (100+ weeks) slow parsing
  **Mitigation:** File size limits, async parsing with progress

**Dependencies on External Factors:**
- `yaml` library stability (mature, stable)
- Zod schema validation performance
- AI model consistency (Claude, Gemini)

---

## Related Documentation

- [Program Management Requirements](./04_program_management_requirements.md)
- [AI Integration Requirements](./11_ai_integration_requirements.md)
- [Architecture - ZTL Module](../core/04_ARCHITECTURE.md#ztl-module)
- [ZTL Specification](../design/ztl-spec.md) (future)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** ✅ Ready for Development (Stage 4.2.1 Complete)
