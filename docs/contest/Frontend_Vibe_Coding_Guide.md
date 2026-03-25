# Frontend Vibe Coding Guide

Stop your AI-built apps from looking like AI built them.

## The #1 Rule

**Tell your AI what your app should feel like, not just what it should do.**

"Build a dashboard" gets you a generic Bootstrap table. "Build a dashboard that feels like a calm, premium fintech app — think Linear meets Stripe" gets you something worth demoing.

## Before You Write Any Code

Answer these four questions and paste them into your first prompt:

1. **Who is this for?** — "Small business owners who aren't technical" produces very different UI than "developers who use the terminal all day."
2. **What should it feel like?** — Pick 2–3 adjectives. Calm and professional? Bold and playful? Minimal and focused?
3. **What's the ONE thing users should remember?** — If someone uses your app for 30 seconds during a demo, what impression sticks?
4. **What should it NOT look like?** — "Don't make it look like a generic Bootstrap admin panel" is genuinely useful direction.

## The Design Rules Prompt

```
DESIGN RULES FOR THIS PROJECT:
- Use a consistent color palette (max 3 primary colors + neutrals)
- Typography: use one display font and one body font, not the system default
- Spacing: use consistent padding/margins (multiples of 4px or 8px)
- Every interactive element needs a hover state and a focus state
- No raw unstyled HTML elements — every button, input, and card should look intentional
- Animations: use subtle transitions (150-300ms) on interactive elements
- Mobile-first: design for phone screens, then scale up
- Dark mode: if you support it, test it. Half-done dark mode is worse than none.
- Never use pure black (#000000) on pure white (#FFFFFF) — it's harsh. Use off-black on off-white.
- Limit font sizes to 3-4 variants max (e.g., 14px body, 18px subhead, 24px heading, 36px hero)
```

## 5 Quick Wins

### 1. Font Pairing

Stop using the default system font. Proven combos via Google Fonts:

| Vibe | Display Font | Body Font |
|---|---|---|
| Clean & Modern | Inter | Inter |
| Premium & Editorial | Playfair Display | Source Sans Pro |
| Friendly & Approachable | Nunito | Open Sans |
| Technical & Precise | JetBrains Mono | IBM Plex Sans |
| Bold & Startup-y | Sora | DM Sans |
| Elegant & Minimal | Cormorant Garamond | Lato |

### 2. Color Palette

- Pick one primary color (your brand/accent color)
- Add 2–3 neutral grays for backgrounds and text
- One success green, one error red, one warning yellow
- Use Coolors or Realtime Colors to generate a palette in 30 seconds
- Tell your AI: "Use this exact color palette" and paste the hex codes

### 3. One "Wow" Animation

Pick ONE place for a micro-animation:
- Smooth page transition
- Card that scales up on hover
- Loading skeleton that shimmers
- Success checkmark that draws itself
- Number that counts up when a stat loads

### 4. Real Backgrounds

A flat white background screams "I didn't think about design." Quick fixes:
- Subtle gradient (barely-visible warm-to-cool shift)
- Very light texture or noise overlay
- Soft mesh gradient behind the hero section
- Simple CSS pattern (dots, lines, or grid at 5% opacity)

### 5. Visual References

Show your AI what you want. Find 1–2 screenshots of apps you like:
- "Make it look like this Stripe dashboard layout"
- "Use this color scheme and card style from Linear"
- "Match the typography and spacing of this Notion page"

**Even better:** Use image-generating AI to create mockup designs first, then hand that image to your coding assistant and say "build this."

## When Something Looks Wrong

| What You See | What to Say |
|---|---|
| Everything looks cramped | "Add more whitespace — increase padding to 24px on cards and 16px between elements" |
| Text is hard to read | "Increase body font size to 16px and line-height to 1.6" |
| Colors clash | "Use only these colors: [paste your palette]. Remove any other colors." |
| Looks like a 2010 website | "Modernize — rounded corners (8px), subtle shadows, remove unnecessary borders" |
| Buttons look generic | "Style buttons with 8px border-radius, 12px 24px padding, and a subtle hover transition" |
| Page feels empty | "Add visual hierarchy — use card components with backgrounds to group content" |
| Looks AI-generated | "Make it feel more human — vary spacing, use asymmetric layouts, add one unexpected element" |
| Dark mode is broken | "Fix dark mode — ensure sufficient contrast, no hardcoded white or black colors" |

## Tool-Specific Tips

### Claude (claude.ai or Claude Code)
- Excellent at understanding design intent from natural language
- Paste a screenshot and say "match this style"
- Use artifacts for rapid UI iteration
- Ask Claude to create a design system first, then build pages using it
- Handles Tailwind CSS especially well

### ChatGPT / GPT-5.4
- Strong frontend generation with Canvas mode
- Use "show me a preview" for interactive previews
- Be explicit about framework: "Build this in React with Tailwind"

### Gemini / Google Stitch
- Full-page layouts from a single prompt
- Good at Material Design–style interfaces
- Defaults to mobile-first with "create a responsive layout"

### Cursor / Replit
- Both read your existing codebase for context
- Cursor: Cmd+K and reference your CSS/Tailwind config
- Replit: AI agent previews changes live

## The Non-Technical Person's Cheat Code

1. **Find 3 apps you like.** Screenshot them. Paste into your AI. Say "I want my app to look like a combination of these."
2. **Describe it like a restaurant.** "It should feel like a modern coffee shop — clean, warm, minimal, with just enough personality to feel inviting."
3. **Ask for 3 options.** "Give me 3 different visual directions for this page" and pick the best.
4. **Iterate one thing at a time.** Don't say "make it look better." Say "make the header more prominent" or "make the cards more spacious."

## Quick Reference: Direction Words for Prompts

- **Layout:** spacious, compact, airy, dense, centered, asymmetric, grid-based, full-bleed, sidebar, split-screen
- **Mood:** calm, energetic, playful, serious, premium, friendly, bold, minimal, warm, cool
- **Era:** modern, retro, futuristic, classic, Y2K, brutalist, mid-century, contemporary
- **Texture:** flat, glossy, matte, gradient, glassmorphism, soft-shadow, paper-like, noisy
- **Motion:** smooth, snappy, bouncy, subtle, dramatic, staggered, fluid, spring-loaded

## Final Checklist Before Your Demo

1. **Does it work on a phone screen?** Resize browser to 375px wide.
2. **Is the text readable?** No text smaller than 14px. Body at 16px minimum.
3. **Are there loading states?** Skeleton or spinner, not blank screen.
4. **Do error states look good?** Styled messages, not raw browser alerts.
5. **Is color consistent?** Same blue everywhere.
6. **Does it look good in screenshots?** Show it to someone with zero context.
7. **Product or homework?** If "homework," add whitespace, better fonts, one animation.

*Built for the Springfield Vibeathon by Codefi. Last updated: 2026-03-23 00:00:00 UTC*
