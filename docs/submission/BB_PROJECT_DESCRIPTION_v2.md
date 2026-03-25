# Backward Builder — Project Description v2

> Paste this into the project description field on app.vibeathon.us at submission time.

---

## Backward Builder

**Backward Builder is an AI-powered curriculum design tool that lets teachers go from an enduring understanding to a complete, standards-aligned unit plan — with performance tasks, auto-graded checks for understanding, and sequenced learning activities — in minutes instead of hours, no developer required.**

### The Problem

Every trained teacher knows Understanding by Design (UbD): start with what students should understand, design assessments that prove understanding, then plan instruction backward from there. It's the gold standard of curriculum planning, taught in every education program in the country.

But the tools teachers actually have are Word documents, blank templates, and 45 minutes of planning time already consumed by grading, emails, and parent calls. The person closest to the curriculum problem — the classroom teacher — has always been the most qualified to know what great instruction looks like. They've just been locked out of building the digital tools that bring it to life.

Meanwhile, existing edtech solutions either do nothing (generic templates), cost too much ($50K+ enterprise platforms requiring district adoption), or miss the point entirely (AI tools that generate "lesson plans" without understanding backward design, standards alignment, or pedagogy).

### The Solution

Backward Builder guides teachers through the complete UbD framework using a conversational AI pipeline:

1. **Stage 1 — Desired Results:** The teacher enters an enduring understanding. The AI maps it to state standards from all 50 U.S. states, classifies the cognitive level using Bloom's Taxonomy, and generates essential questions.

2. **Stage 2 — Evidence:** The AI generates GRASPS performance tasks with multi-criterion rubrics, plus formative Checks for Understanding with auto-graded questions. Students access checks via share link on any device — no login, no app download. Results appear on a real-time teacher dashboard with per-question analytics.

3. **Stage 3 — Learning Plan:** The AI generates sequenced instructional activities that scaffold toward the performance task. Every activity is aligned backward from the assessment, exactly as UbD demands.

Each stage feeds context to the next. The enduring understanding anchors every downstream decision — standards, performance tasks, checks, and learning activities stay aligned throughout. If any step breaks alignment, it's not UbD anymore. Maintaining that chain is the hardest engineering problem we solved.

### Key Features

- **Conversational unit creation** with quick-start prompts for common lessons
- **State standards alignment** across all 50 U.S. states
- **Bloom's Taxonomy classification** of learning objectives
- **GRASPS performance tasks** with detailed rubrics
- **Auto-graded Checks for Understanding** — students access via link, graded in real time
- **Teacher results dashboard** showing exactly what needs to be retaught
- **Unit sharing** — share directly with colleagues by email or via link
- **Community library** — publish units for other teachers to discover
- **Demo account** — explore sample units without signing up
- **Public roadmap** — continued development planned (BackwardBuilder.com/roadmap)

### Who It's For

Any K-12 teacher who understands backward design but doesn't have the time or tools to build standards-aligned digital assessments and unit plans from scratch. Backward Builder treats teachers as the curriculum experts they are — and handles the construction for them.

### Technology

- **AI Pipeline:** Multi-step chain using Claude (Anthropic) — standards analysis, Bloom's classification, GRASPS task generation, check creation, and learning plan sequencing. Each step feeds context to the next.
- **Live Assessment Engine:** Auto-graded checks deployed via share links with real-time results dashboard.
- **Stack:** Next.js 14+, TypeScript, Tailwind CSS v4, Neon Postgres, Drizzle ORM, deployed on Vercel.
- **Security:** No hardcoded API keys, server-side input validation, parameterized queries via ORM, generic error responses.

### Why It Matters

There are 3.7 million teachers in the United States. Every one of them plans curriculum. Most do it alone, with generic templates, under severe time pressure. Backward Builder doesn't replace teacher expertise — it amplifies it. The teacher provides the domain knowledge (what students need to understand), and the AI handles the construction (standards alignment, assessments, activities).

This is the "Vibe the Gap" challenge in action: the person closest to the problem finally has the power to build the solution — no developer required.

### About the Builder

Backward Builder was created by Dr. Wayne Bridges — a former middle school teacher who went on to work in edtech, school administration, and enterprise technology before becoming an AI developer. He holds a doctorate in education (Ed.D.) and spent years watching teachers struggle with tools that never matched how they actually think about curriculum. Backward Builder is the tool he wished he'd had in the classroom.

Built by Free Beer Studio (freebeer.ai).
