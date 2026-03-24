# Backward Builder

**Tell it what students need to understand. It builds the assessment they'll take.**

[BackwardBuilder.com](https://backwardbuilder.com)

Backward Builder is an AI-powered assessment creation tool designed for middle school history teachers. Using Understanding by Design (UbD) principles, it guides teachers through a conversational flow: describe what students need to understand, answer a few questions about what was actually taught, and receive a complete, deployable assessment — including multiple choice questions with strong distractors, document-based questions with scaffolding, and constructed response prompts with scoring rubrics.

The generated assessment is instantly shareable via a link that students can access on any device with no login required. Multiple choice questions are auto-graded in real time, and teachers get a results dashboard with per-question analytics that show exactly what needs to be retaught.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **AI:** Claude API (Anthropic) — assessment generation, question regeneration, auto-grading, reteach insights
- **Database:** Neon Postgres + Drizzle ORM
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add your DATABASE_URL and ANTHROPIC_API_KEY
npm run db:push              # Create database tables
npm run dev                  # Start dev server at http://localhost:3000
```

## Contest Entry

Built for the [Codefi Vibeathon 2026](https://vibeathon.us) — "Vibe the Gap" Challenge, Springfield, MO.

There are 600,000 middle school teachers in the United States. Every single one gives assessments. The person closest to the problem — the teacher who just taught the unit — should be able to build their own assessment tool without writing a line of code.
