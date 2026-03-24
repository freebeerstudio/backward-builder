# Backward Builder

AI-powered assessment creation tool for middle school history teachers.
Vibeathon "Vibe the Gap" contest entry (March 23-27, 2026).

## Tech Stack
- Next.js 14+ (App Router, src directory)
- Tailwind CSS v4
- Claude API (claude-sonnet-4-20250514) via @anthropic-ai/sdk
- Neon Postgres + Drizzle ORM
- Deployed on Vercel

## Code Style
- All files use TypeScript strict mode
- Server Components by default; 'use client' only when needed
- Server Actions for mutations where possible
- Comments explaining "why" for AI judge readability
- No auth — teacher identity via cookie-based session ID
- Clean, well-structured code (AI judge reads it)

## Design System
- Primary: #2D5A3D (forest green) — trustworthy, educational
- Primary Light: #4A8C6A (hover states)
- Primary Dark: #1E3D2A (text on light backgrounds)
- Accent: #D4A843 (warm gold) — CTAs, highlights, scores
- Accent Light: #F0D78C (backgrounds)
- Background: #FAF8F5 (warm off-white)
- Card BG: #FFFFFF
- Text: #2C2C2C (near-black, never pure #000)
- Text Light: #6B6B6B (secondary text)
- Border: #E5E0D8 (warm gray)
- Success: #3D8B5E
- Error: #C44B4B
- Warning: #D49B3A

## Typography
- Headings: Sora (Google Fonts)
- Body: DM Sans (Google Fonts)
- Monospace: JetBrains Mono (if needed)

## Layout
- Max content width: 720px (reading-optimized)
- Cards: 8px border-radius, shadow 0 1px 3px rgba(0,0,0,0.08)
- Body text: 16px minimum
- Section headings: 24px
- Padding: 24px on cards, 16px between elements
- Mobile-first responsive design

## Key Conventions
- Database schema in src/db/schema.ts
- Database client in src/db/index.ts
- API routes in src/app/api/
- Shared types in src/types/
- Reusable components in src/components/
- Claude API wrapper in src/lib/claude.ts
- Share codes: 6-char alphanumeric via nanoid customAlphabet

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run db:push` — push schema to database
- `npm run db:seed` — seed demo data
