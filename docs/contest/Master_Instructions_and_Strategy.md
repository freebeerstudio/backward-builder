# Springfield Vibeathon — Master Instructions & Strategy Guide

- **Event:** STC Squared, Springfield, MO Vibeathon
- **Dates:** March 23–27, 2026
- **Location:** efactory, Springfield, MO (and Remote)
- **Website:** https://vibeathon.us/springfield
- **Submission Portal:** app.vibeathon.us

---

## CRITICAL DEADLINES

| Milestone | Deadline |
|---|---|
| Kickoff | March 23, 2026 at 12:00 PM CDT |
| Code Submission | March 26, 2026 at 1:00 PM CDT |
| Video Submission | March 26, 2026 at 2:00 PM CDT (opens 15 min after code submit) |
| Winner Announcement | At conclusion of event (March 27) |

You have approximately 3 days of building time from kickoff to code submission. Every hour counts.

---

## THE TWO CHALLENGES

Each challenge has its own $5,000 prize pool. You must pick one.

### Challenge #1 — Startup Bring-Your-Own

Bring your own startup idea and vibe-code it into a working MVP. This is for founders and builders who already have a problem they want to solve. Sponsored by Traction Studio AI.

### Challenge #2 — "Vibe the Gap" (aka "Close the Gap")

Build an AI-powered tool that empowers non-technical people to go from "I have a problem" to "I have a working solution" — no developer required. Think of it as Replit redesigned for someone who's afraid of software but has deep domain expertise. Sponsored by Codefi.

**The "Stacey" story** is the emotional anchor of Challenge #2: A retiring sheet metal worker with 30 years of domain knowledge nearly walked out of a vibeathon because he couldn't build anything on his own. He only succeeded because a developer happened to join his team. The challenge asks: what if that developer wasn't there? Build the tool that makes the developer unnecessary.

---

## JUDGING CRITERIA (Memorize These Weights)

| Criterion | Weight | What It Really Means |
|---|---|---|
| Impact & Relevance | 40% | Does it solve a real, meaningful problem? Is the pain point obvious? This is nearly HALF your score. |
| Demo Quality | 20% | Can you clearly show what it does, why it matters, and that it actually works? Reliability matters here. |
| Feasibility | 15% | Could this be piloted in the real world? Is it practical, not just theoretical? |
| Innovation | 15% | Is the idea creative and original? Is AI used in a genuinely clever way (not just a basic API call)? |
| User Experience | 10% | Is it clear, intuitive, and accessible to the intended user? |

### Strategic Implications

- **Impact & Relevance at 40% is the game.** Choose a problem that is viscerally painful and affects many people. If judges don't immediately feel the problem, nothing else matters.
- **Demo Quality at 20% is your second lever.** A polished, working demo of a focused app beats a broken demo of an ambitious one.
- **Feasibility at 15% rewards practicality.** Show that real people could use this tomorrow — not "someday with more funding."
- **Innovation at 15% rewards clever AI use.** Go beyond a single API call. Show multi-step reasoning, structured output, fallback handling, or creative prompt engineering.
- **UX at 10% is table stakes.** It doesn't need to be beautiful — it needs to be usable by the target audience within seconds.

### Judging Method

An AI judging system will be the primary evaluator, analyzing code repos, video demos, text descriptions, and other materials. Human judges may provide oversight. This means:
- Your code quality and structure matter (the AI will read it)
- Your video needs to be clear and well-organized (the AI will analyze it)
- Your text description needs to be precise and keyword-rich
- Your live URL must actually work without authentication

---

## SUBMISSION REQUIREMENTS CHECKLIST

All of these are mandatory:

- **Source Code ZIP** — Under 100MB, uploaded through app.vibeathon.us
- **Live Application URL** — Publicly accessible, no auth required, must stay live through judging
- **Project Description** — Text explaining features and functionality
- **Demo Video** — Under 5 minutes, MP4 or MOV, under 100MB, uploaded through app.vibeathon.us
- **Original Work** — Must be your own, no pre-existing funded projects
- **English** — All materials in English

### What the Live URL Must Do

- Be publicly accessible (no login walls for judges)
- Work without special configuration
- Stay live through the end of the judging period
- Be free to use

### What the Video Must Include

- Clear demonstration of all features and functionality
- Under 5 minutes
- No copyrighted music or third-party trademarks without permission
- Uploaded as a file (not a YouTube link)

---

## RECOMMENDED BUILD STRATEGY

### Phase 0: Decision (Hours 0–2)

- Choose your challenge
- If Challenge #2 ("Vibe the Gap"): Pick a specific niche (childcare directors, restaurant owners, church admins, etc.) — the narrower, the better
- If Challenge #1 (Startup BYO): Validate that the problem is real and painful
- Write a one-sentence problem statement and a one-sentence solution statement
- Identify your target user persona by name (e.g., "Maria, a childcare director managing a 200-kid waitlist in a spreadsheet")

### Phase 1: Architecture & Data Model (Hours 2–6)

- Define your data model before writing features
- Choose your stack (see recommendations below)
- Set up your backend with proper auth, env variables, and security from the start
- Deploy a skeleton app immediately — you need that live URL working early
- Set up CI/CD or a simple deploy pipeline so you can ship continuously

### Phase 2: Core Feature Build (Hours 6–48)

- Build the ONE core loop that demonstrates your solution
- Get it working end-to-end before adding anything else
- Prioritize depth on 2–3 features over breadth on 10
- Test with real-ish data, not lorem ipsum
- Check your live URL works after every major push

### Phase 3: Polish & Edge Cases (Hours 48–66)

- Add error handling and loading states
- Fix the UX — make sure a first-time user can figure it out
- Add seed data so the demo doesn't look empty
- Run the security review prompt from the Data & Security guide
- Test on mobile (judges may check)

### Phase 4: Demo Video & Submission (Hours 66–72)

- Write a script (~450 words for 3 minutes)
- Record your demo — show real usage, not pre-loaded data
- Lead with the problem, not the product
- Submit code first, then video (video upload opens 15 min after code submit)
- Double-check your live URL one final time

---

## DEMO VIDEO STRATEGY (This Is 20% of Your Score)

### Structure (3–5 minutes)

1. **Hook (0:00–0:30):** Start with the problem. "Every [persona] wastes [X hours] on [painful thing]. We built something that eliminates that." One sentence on pain, one on solution, then start the demo.
2. **Live Demo (0:30–3:30):** Show the app working end-to-end. Start from a blank state. Narrate decisions, not clicks. Show the core loop completely. Trigger at least one edge case that handles gracefully.
3. **Technical Walk (3:30–4:30, optional):** 60-second tour of one technically interesting part. Show how you handle AI responses, error fallbacks, prompt engineering, etc.
4. **Close (4:30–5:00):** What would you build next? Who would use this first? Keep it brief.

### Critical Do's

- Show REAL data — type something new live, submit a real form
- Explain AI integration with depth (prompt structure, error handling, fallbacks)
- Prepare your environment (close Slack, hide notifications, clean browser)
- Add captions (judges may skim on mute first)
- Do a 30-second test recording first to check audio/video quality

### Critical Don'ts

- Don't show features that don't exist in the code (biggest trust-breaker)
- Don't narrate over pre-loaded sample data
- Don't say "AI-powered" without showing what that means
- Don't rush through broken features — it's better to say "we ran out of time on X"
- Don't exceed 5 minutes

### Recording Tools (Free)

- **OBS Studio** — Best free option, any platform, no limits
- **QuickTime** — Mac only, simplest for screen recording
- **ScreenPal web recorder** — No install needed, no watermark

---

## TECH STACK RECOMMENDATIONS

### For Speed (Hackathon-Optimized)

- **Frontend:** React + Tailwind CSS (or Next.js for full-stack)
- **Backend:** Convex (real-time, zero-config, TypeScript) or Firebase
- **AI:** Claude API (Sonnet for speed, Opus for complex reasoning) or OpenAI
- **Deployment:** Vercel (frontend), Railway or Render (backend), or Convex's built-in hosting

### Backend Rules (Paste Into Your First Prompt)

```
BACKEND RULES FOR THIS PROJECT:
- Never hardcode API keys, tokens, or secrets in source code — use environment variables
- Create a .env.example file with placeholder values for every secret
- Add .env to .gitignore BEFORE the first commit
- All user input must be validated on the server side, not just the frontend
- Use parameterized queries or an ORM — never concatenate user input into SQL
- Authentication endpoints must be rate-limited
- Every API endpoint must check authorization
- Passwords must be hashed with bcrypt or argon2, never stored in plain text
- Error responses must not leak internal details
- Database migrations should be reversible
```

### Frontend Rules (Paste Into Your First Prompt)

```
DESIGN RULES FOR THIS PROJECT:
- Use a consistent color palette (max 3 primary colors + neutrals)
- Typography: use one display font and one body font, not the system default
- Spacing: use consistent padding/margins (multiples of 4px or 8px)
- Every interactive element needs a hover state and a focus state
- No raw unstyled HTML elements
- Animations: use subtle transitions (150-300ms) on interactive elements
- Mobile-first: design for phone screens, then scale up
- Never use pure black (#000000) on pure white (#FFFFFF)
- Limit font sizes to 3-4 variants max
```

---

## WINNING EDGE: WHAT SEPARATES 1ST FROM 5TH

Based on the judging criteria weights and the guides provided:

1. **Nail the problem statement (Impact: 40%).** If a judge (or AI judge) can't articulate your problem in one sentence after watching your video, you lose almost half your score. Make the pain undeniable.
2. **Show, don't tell (Demo: 20%).** A working app with real data beats a polished pitch deck every time. "A rough video showing a genuinely working product is a win. A polished deck with no working demo is a red flag."
3. **Depth over breadth.** "3 features done well beats 10 features half-done." Build one complete, impressive loop rather than a scattered collection of half-working screens.
4. **AI sophistication (Innovation: 15%).** Go beyond a single API call. Show multi-step prompting, structured output parsing, fallback handling, retry logic, or context-aware AI behavior. "'We called the OpenAI API' is table stakes. 'We built a retry loop that degrades gracefully when the model times out' is impressive."
5. **Real-world credibility (Feasibility: 15%).** Reference real numbers. "There are X million [personas] in the US dealing with this exact problem." Show that one customer would pay for this tomorrow.
6. **Code quality matters.** The AI judge will read your code. Clean structure, proper security, good error handling, and clear organization will score higher than spaghetti code that happens to work.

---

## SECURITY REVIEW (Run Before Submission)

Paste this into Claude before submitting:

```
Review the backend code and check for these issues.
For each item, tell me if it passes or fails, and fix anything that fails:

1. Are there any API keys, tokens, or passwords hardcoded in the source?
2. Is user input validated on the server side?
3. Are database queries safe from injection?
4. Do all protected endpoints verify auth AND authorization?
5. Are passwords hashed (bcrypt/argon2), not plain text?
6. Do error responses hide internal details?
7. Is the login endpoint rate-limited?
8. Is .env in .gitignore?
9. Can a non-admin user access admin-only routes?
10. Is there seed data so the demo doesn't look empty?
```

---

## PRE-SUBMISSION FINAL CHECKLIST

- [ ] Live URL works without authentication
- [ ] Live URL works on mobile (375px wide)
- [ ] App has real/seed data — not empty screens
- [ ] All text is readable (16px minimum body text)
- [ ] Loading states exist (no blank screens while data loads)
- [ ] Error states are styled (not raw browser alerts)
- [ ] No API keys in source code
- [ ] .env.example exists with placeholder values
- [ ] .env is in .gitignore
- [ ] Source code ZIP is under 100MB
- [ ] Demo video is under 5 minutes
- [ ] Demo video is MP4 or MOV, under 100MB
- [ ] Demo video has captions or is understandable on mute
- [ ] Project description clearly explains features and functionality
- [ ] Code submitted before video (video upload opens 15 min after)

---

## INTELLECTUAL PROPERTY NOTE

You retain full ownership of everything you build. Codefi gets a limited license only to review, display your project name/description/video for promotional purposes, and archive internally. They cannot commercialize, sublicense, or create derivative works from your code. You can sell, license, or commercialize your app at any time, including during the vibeathon.

---

*This document synthesizes all vibeathon rules, challenge descriptions, judging criteria, demo tips, frontend guide, backend/security guide, and code of conduct into a single strategic reference. Use it as your north star throughout the event.*
