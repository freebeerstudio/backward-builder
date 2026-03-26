# Backward Builder

**https://BackwardBuilder.com**

AI-powered UbD (Understanding by Design) curriculum planning tool.
Vibeathon "Vibe the Gap" contest entry (March 23-27, 2026).

## What It Does

Teachers describe what students need to understand → AI designs a complete,
standards-aligned unit plan following the 5-stage UbD flow:

1. **Stage 1 — Desired Results:** Enduring understanding → AI maps to state standards, classifies Bloom's level, generates essential questions
2. **Stage 2 — Evidence:** AI generates GRASPS performance tasks with rubrics + formative Checks for Understanding (auto-graded)
3. **Stage 3 — Learning Plan:** AI generates sequenced activities scaffolding toward the performance task
4. **Stage 4 — Go Live:** Publish checks and tasks to students via share links and QR codes (no student login required)
5. **Stage 5 — Results:** Per-question analytics, auto-graded results, reteach insights

The unit overview page is **mission control** — after completing Stages 1-3 (design),
teachers see Stages 4-5 with lock indicators. Stage 4 unlocks after design is complete.
Stage 5 unlocks after going live. Teachers design on their schedule and deploy when ready.

## Tech Stack
- Next.js 14+ (App Router, src directory)
- Tailwind CSS v4
- Claude API via @anthropic-ai/sdk
- Neon Postgres + Drizzle ORM
- Deployed on Vercel

## Architecture

### Data Model (Unit-Centric)
- `teachers` — session-based with classroom context (grade, subject, state)
- `units` — top-level entity with enduring understanding, standards, cognitive level
  - Status flow: `stage1 → stage2 → stage3 → ready | live | complete`
- `performanceTasks` — GRASPS tasks with multi-criterion rubrics
- `checksForUnderstanding` — formative checks with auto-graded questions
- `checkQuestions` — selected_response (MC) and short_answer questions
- `learningActivities` — sequenced instructional activities
- `studentSubmissions` + `studentAnswers` — polymorphic for checks and tasks
- `unitShares` — teacher-to-teacher sharing via email or link

### AI Pipeline (Multi-Step)
Each stage feeds context to the next — this is a key differentiator:
1. `analyzeUnderstanding()` → standards + Bloom's classification
2. `generatePerformanceTasks()` → GRASPS tasks + rubrics
3. `generateChecksForUnderstanding()` → formative checks aligned to rubric criteria
4. `generateLearningPlan()` → activities scaffolding toward the performance task

### Page Routes
```
/                              Landing page (UbD narrative + demo bypass)
/setup                         Classroom context (grade, subject, state)
/unit/new                      Stage 1: Enduring understanding input
/unit/[id]                     Unit overview (mission control — shows all 5 stages)
/unit/[id]/stage2              Stage 2: Performance tasks + checks
/unit/[id]/stage3              Stage 3: Learning activities → "Complete Plan" returns to overview
/unit/[id]/publish             Stage 4: Go Live (share codes, QR codes)
/unit/[id]/results             Stage 5: Teacher results dashboard
/check/[shareCode]             Student takes a Check for Understanding
/check/[shareCode]/complete    Submission confirmation
/task/[shareCode]              Student submits a Performance Task
/roadmap                       Public product roadmap
/dashboard                     My Units (with Ready/Live status badges)
/standards-sources             Standards data sources attribution
```

## Code Style
- TypeScript strict mode throughout
- Server Components by default; 'use client' only when needed
- Comments explain "why" for AI judge readability
- Cookie-based teacher sessions (no heavy auth)
- Clean, well-structured code (AI judge reads it)

## UbD Terminology (NEVER use the wrong terms)
- "Check for Understanding" — NOT "quiz"
- "Performance Task" — NOT "test"
- "Share with students" / "Go live" — NOT "deploy"
- "Evidence of Understanding" — NOT "assessment" (generic)
- Stage 1 / Stage 2 / Stage 3 / Stage 4 / Stage 5 — NOT Step 1 / Step 2 / Step 3
- "Complete Plan" — NOT "Save" or "Finish" (end of Stage 3)
- "Mission control" — the unit overview page showing all 5 stages

## Design System
- Primary: #2D5A3D (forest green)
- Accent: #D4A843 (warm gold)
- Background: #FAF8F5 (warm off-white)
- Headings: Sora | Body: DM Sans
- Cards: 8px radius, subtle shadow
- Max content width: 720px (1024px for dashboard)
- Mobile-first responsive
- Locked stages: padlock icon + greyed out text + "Complete X first" badge

## Key File Locations
- Database schema: `src/db/schema.ts`
- Claude AI pipeline: `src/lib/claude.ts`
- Shared types: `src/types/index.ts`
- UI components: `src/components/ui/`
- UbD components: `src/components/unit/`
- Progress indicator: `src/components/unit/UbDProgressIndicator.tsx`
- Unit overview (mission control): `src/components/unit/UnitOverview.tsx`
- API routes: `src/app/api/`
- Contest docs: `docs/contest/`
- Submission materials: `docs/submission/`

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run db:push` — push schema to database
- `npm run db:seed` — seed demo data (Ms. Jones)
- `./scripts/prep-submission.sh` — prepare ZIP for contest submission
