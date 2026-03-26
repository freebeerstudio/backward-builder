# Backward Builder

**Tell it what students need to understand. It designs the entire unit.**

[BackwardBuilder.com](https://backwardbuilder.com)

Backward Builder is an AI-powered curriculum planning tool built on the Understanding by Design (UbD) framework by Wiggins & McTighe. Teachers describe an enduring understanding in plain language, and the AI designs a complete, standards-aligned unit plan — from desired results through evidence of understanding to a sequenced learning plan.

It works for any grade level, any subject area, and any U.S. state standards.

## How It Works

Teachers interact through a conversational chat interface with grade-level, subject, and state standard pickers. The AI pipeline follows the UbD framework across 5 stages:

**Design (Stages 1–3):**
1. **Stage 1 — Desired Results:** The AI maps the teacher's enduring understanding to state standards, classifies the cognitive level using Bloom's Taxonomy, and generates essential questions.
2. **Stage 2 — Evidence:** The AI generates GRASPS performance tasks with multi-criterion rubrics, plus formative Checks for Understanding with auto-graded questions.
3. **Stage 3 — Learning Plan:** The AI generates sequenced instructional activities that scaffold toward the performance task.

**Deploy & Analyze (Stages 4–5):**
4. **Stage 4 — Go Live:** Publish checks and performance tasks to students via share links and QR codes. Students access on any device — no login required.
5. **Stage 5 — Results:** Per-question analytics, auto-graded check results, and reteach insights showing exactly what needs to be retaught.

Each stage feeds context to the next — the performance tasks align to the standards, the checks align to the rubric criteria, and the learning plan builds toward the performance task. This chained pipeline is a key differentiator.

The unit overview serves as mission control — after completing design (Stages 1–3), teachers see Stages 4 and 5 with clear status indicators. Stage 4 unlocks after design is complete. Stage 5 unlocks after the unit goes live. Teachers design on their own schedule and deploy when they're ready.

## Features

- **5-stage UbD pipeline** with mission control unit overview
- **Conversational unit creation** with quick-start prompts for common lessons
- **State standards alignment** across all 50 states
- **Bloom's Taxonomy classification** of learning objectives
- **GRASPS performance tasks** with detailed rubrics
- **Auto-graded Checks for Understanding** — students access via share link on any device, no login required
- **Teacher results dashboard** with per-question analytics and reteach insights
- **Unit sharing** — share units directly with colleagues by email or via link
- **Community library** — publish units for other teachers to discover
- **Save for later** — complete unit design and deploy when ready
- **Public roadmap** — see what's planned at [BackwardBuilder.com/roadmap](https://backwardbuilder.com/roadmap)
- **Demo account** — explore pre-built sample units without signing up

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **AI:** Claude API (Anthropic) via @anthropic-ai/sdk
- **Database:** Neon Postgres + Drizzle ORM
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add your DATABASE_URL and ANTHROPIC_API_KEY
npm run db:push              # Create database tables
npm run db:seed              # Seed demo data (optional)
npm run dev                  # Start dev server at http://localhost:3000
```

## Project Structure

```
src/
  app/                       # Next.js App Router pages and API routes
    api/                     # REST API endpoints
    unit/[id]/               # Unit overview (mission control)
    unit/[id]/stage2/        # Stage 2: Evidence
    unit/[id]/stage3/        # Stage 3: Learning Plan
    unit/[id]/publish/       # Stage 4: Go Live
    unit/[id]/results/       # Stage 5: Results
    check/[shareCode]/       # Student-facing check pages
    roadmap/                 # Public product roadmap
  components/
    ui/                      # Shared UI components
    unit/                    # UbD-specific components
    landing/                 # Landing page components
  db/
    schema.ts                # Drizzle ORM database schema
  lib/
    claude.ts                # AI pipeline (multi-step unit generation)
  types/
    index.ts                 # Shared TypeScript types
```

## Contest Entry

Built for the [Codefi Vibeathon 2026](https://vibeathon.us) — "Vibe the Gap" Challenge.

There are 3.7 million teachers in the United States. Curriculum planning is one of the most time-consuming parts of their job. The person closest to the students — the teacher who knows what they need to understand — should be able to design a rigorous, standards-aligned unit plan in minutes, not days.

## License

Private — Free Beer Studio
