# Backward Builder

**https://BackwardBuilder.com**

AI-powered UbD (Understanding by Design) curriculum planning tool.
Vibeathon "Vibe the Gap" contest entry (March 23-27, 2026).

## What It Does

Teachers describe what students need to understand → AI designs a complete,
standards-aligned unit plan following the 3-stage UbD framework by Wiggins & McTighe:

1. **Stage 1 — Desired Results:** Enduring understanding → AI maps to state standards, classifies Bloom's level, generates essential questions
2. **Stage 2 — Evidence:** AI generates GRASPS performance tasks with rubrics + formative Checks for Understanding (auto-graded)
3. **Stage 3 — Learning Plan:** AI generates sequenced activities scaffolding toward the performance task

Students access Checks for Understanding via share links on any device. Auto-graded results feed a teacher dashboard with reteach insights.

## Tech Stack
- Next.js 14+ (App Router, src directory)
- Tailwind CSS v4
- Claude API (claude-sonnet-4-20250514) via @anthropic-ai/sdk
- Neon Postgres + Drizzle ORM
- Deployed on Vercel

## Architecture

### Data Model (Unit-Centric)
- `teachers` — session-based with classroom context (grade, subject, state)
- `units` — top-level entity with enduring understanding, standards, cognitive level
- `performanceTasks` — GRASPS tasks with multi-criterion rubrics
- `checksForUnderstanding` — formative checks with auto-graded questions
- `checkQuestions` — selected_response (MC) and short_answer questions
- `learningActivities` — sequenced instructional activities
- `studentSubmissions` + `studentAnswers` — polymorphic for checks and tasks

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
/unit/[id]                     Unit overview (3-stage dashboard)
/unit/[id]/stage2              Stage 2: Performance tasks + checks
/unit/[id]/stage3              Stage 3: Learning activities
/unit/[id]/publish             Go live (share codes)
/unit/[id]/results             Teacher results dashboard
/check/[shareCode]             Student takes a Check for Understanding
/check/[shareCode]/complete    Submission confirmation
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
- Stage 1 / Stage 2 / Stage 3 — NOT Step 1 / Step 2 / Step 3

## Design System
- Primary: #2D5A3D (forest green)
- Accent: #D4A843 (warm gold)
- Background: #FAF8F5 (warm off-white)
- Headings: Sora | Body: DM Sans
- Cards: 8px radius, subtle shadow
- Max content width: 720px (1024px for dashboard)
- Mobile-first responsive

## Key File Locations
- Database schema: `src/db/schema.ts`
- Claude AI pipeline: `src/lib/claude.ts`
- Shared types: `src/types/index.ts`
- UI components: `src/components/ui/`
- UbD components: `src/components/unit/`
- API routes: `src/app/api/`

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run db:push` — push schema to database
- `npm run db:seed` — seed demo data (Mrs. Crabapple)
