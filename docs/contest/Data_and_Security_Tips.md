# Data & Security Vibe Coding Guide

Your backend is where trust lives. Don't let your AI wing it.

## Start Here (Even If You're Not Technical)

You don't need to be a developer to build a solid backend with AI. You just need to know what to ask for.

### 1. "Help me figure out what data my app needs to store and how it all connects."

Before your AI writes a single line of code, ask it to help you map out your data. Try: "Based on what this app does, what are all the types of data I need to store? What properties does each one have? And how do they relate to each other?" This is called a data model, and it's the blueprint for your entire app.

### 2. "Now that we have the data model, what are the security rules for each type of data?"

Try: "For each type of data in our app, tell me: Who should be able to read it? Who should be able to create, edit, or delete it? Is any of it sensitive and how should we protect it? Write these rules into the code as actual access controls — not just comments."

### 3. "Use a managed backend platform so I don't have to manage servers."

Try: "Use Convex (or Firebase, or Railway) as my backend so I don't have to configure a server or database manually."

### 4. "Walk me through where my data is stored and who can access it."

After your AI builds something, ask it to explain where your data actually lives. If it can't give you a clear, simple answer, the architecture is probably too messy.

### 5. "What happens if [this feature] fails?"

Pick any feature and ask your AI what happens when it breaks. If the answer is "it crashes" or "nothing," tell it: "Add error handling so the user sees a friendly message instead of a broken page."

### 6. "Are there any passwords or API keys written directly in the code?"

Most common vibeathon mistake. Ask your AI explicitly. Then tell it: "Move all secrets into environment variables and create a .env.example file with placeholder values."

### 7. "Can a regular user access the admin pages?"

If your app has admin-only features, ask your AI to verify that a non-admin can't sneak in.

## The #1 Backend Rule

**Tell your AI the constraints, not just the features.**

"Add user authentication" gets you a login form. "Add user authentication with email verification, rate-limited login attempts, secure password hashing, and role-based access control where only admins can manage events" gets you something that won't embarrass you in front of judges.

## Before You Write Any Backend Code

Answer these five questions and paste them into your first prompt:

1. **What data does your app store?** — List every type of data.
2. **Who can see and change what?** — Define roles and permissions upfront.
3. **What happens when something fails?** — Network timeout? Invalid input? Duplicate submission?
4. **What external services do you depend on?** — Each one is a point of failure.
5. **What should NEVER be exposed?** — API keys, user passwords, internal IDs, admin endpoints.

## The Backend Rules Prompt

```
BACKEND RULES FOR THIS PROJECT:
- Never hardcode API keys, tokens, or secrets in source code — use environment variables
- Create a .env.example file with placeholder values for every secret
- Add .env to .gitignore BEFORE the first commit
- All user input must be validated on the server side, not just the frontend
- Use parameterized queries or an ORM — never concatenate user input into SQL
- Authentication endpoints must be rate-limited
- Every API endpoint must check authorization — who is this user and can they do this?
- Passwords must be hashed with bcrypt or argon2, never stored in plain text
- Error responses must not leak internal details (no stack traces, no raw SQL errors)
- Database migrations should be reversible
- Long-running tasks (API calls, email, file processing) go in background jobs, not request handlers
```

## Choosing a Backend Platform

### Managed Backend Platforms (Fastest for Hackathons)

| Platform | Best For | Key Strength | Watch Out For |
|---|---|---|---|
| Convex | Real-time apps, chat, dashboards | End-to-end TypeScript, automatic real-time sync, zero config | Newer ecosystem, fewer tutorials |
| Firebase | Mobile apps, quick prototypes | Mature ecosystem, generous free tier, great docs | NoSQL can get messy, vendor lock-in |
| Railway | Custom backends, full control | Deploy anything (Node, Python, Go), pay-per-use, simple UX | You build the backend yourself |
| PocketBase | Solo developers, simple apps | Single binary, SQLite-based, self-hosted, open source | Limited scaling, small community |

### Traditional Stacks (More Control)

| Stack | Best For | Key Strength | Watch Out For |
|---|---|---|---|
| Node.js + PostgreSQL | Full-stack JS teams | Huge ecosystem, works with every AI tool | Setup and config takes time |
| Laravel + MySQL | Rapid web apps | Batteries-included (auth, queues, ORM, migrations) | PHP knowledge required |
| Django + PostgreSQL | Data-heavy apps | Admin panel for free, strong ORM, security defaults | Can feel heavy for small apps |
| FastAPI + PostgreSQL | APIs, AI/ML backends | Async, auto-generated API docs, type safety | Less opinionated, more decisions |

**For a vibeathon, optimize for speed to first working feature.**

## 5 Things AI Gets Wrong About Backends

### 1. Auth That Looks Right But Isn't
Real auth requires server-side session/token validation on every protected route, authorization checks, rate limiting on login, and expiring password reset flows.

**Tell your AI:** "Add middleware that checks authentication on every API route. Return 401 for unauthenticated requests and 403 for unauthorized ones. Rate-limit the login endpoint to 5 attempts per minute per IP."

### 2. Secrets in Source Code
AI assistants will sometimes put API keys directly in your code. Bots scan every public GitHub commit within seconds.

**Tell your AI:** "Store all API keys and secrets in environment variables. Create a .env.example file with placeholder values. Add .env to .gitignore."

### 3. No Input Validation
AI often trusts whatever the frontend sends. Without server-side validation: empty strings get saved, negative numbers break math, SQL injection becomes possible.

**Tell your AI:** "Validate all input on the server side. Check types, required fields, length limits, and allowed values. Never trust data from the client."

### 4. No Error Handling
AI writes happy-path code. External APIs time out, database connections drop, file uploads fail, users submit forms twice.

**Tell your AI:** "Wrap all external API calls in try/catch blocks with meaningful error handling. Log errors server-side but return generic error messages to the client. Add retry logic for transient failures."

### 5. Database Schemas That Don't Scale
AI creates the simplest schema that makes the current feature work but doesn't think about indexes, relationships, migrations, or timestamps.

**Tell your AI:** "Add indexes on any column used in WHERE clauses or JOIN conditions. Use proper foreign keys. Include created_at and updated_at timestamps on every table. Write database migrations, not raw schema changes."

## Tool-Specific Backend Tips

### Claude (Claude Code)
- Give it your entire project structure
- Use CLAUDE.md files to set project-wide rules
- Ask Claude to "review this code for security issues" after generating backend code
- Tell Claude to write tests first

### ChatGPT / GPT-5.4
- Strong at generating API endpoints and database schemas
- Use Canvas mode to iterate on backend code
- Be explicit about your framework version
- Ask it to generate curl commands to test endpoints

### Cursor
- Reads your entire codebase, so existing patterns propagate automatically
- Use Cmd+K to generate new endpoints matching your existing code style
- Multi-file editing is ideal for backend changes

### Replit
- Agent can scaffold a full backend from a description
- Use Replit's environment secrets tab instead of .env files
- Live preview for immediate endpoint testing

## The Security Review Prompt

```
Review the backend code you just wrote and check for these issues.
For each item, tell me if it passes or fails, and fix anything that fails:

1. Are there any API keys, tokens, or passwords written directly in the code
   instead of loaded from environment variables?
2. Is user input checked and validated on the server before it gets saved
   or used — not just checked on the frontend?
3. Are database queries safe from injection attacks (using parameterized
   queries or an ORM, not string concatenation)?
4. Do all protected pages and API endpoints verify that the user is logged
   in AND has permission to access that specific resource?
5. Are passwords stored securely using a hashing algorithm (like bcrypt),
   not saved as plain text?
6. When something goes wrong, does the error response hide internal details
   (no file paths, database errors, or stack traces shown to the user)?
7. Is the login endpoint rate-limited so someone can't try thousands of
   passwords per minute?
8. Is the .env file listed in .gitignore so secrets don't get committed
   to the repository?
9. Are there any places where user input gets passed directly into a
   database query or system command without being checked first?
10. Can a regular (non-admin) user access admin-only pages or endpoints?
```

## Quick Reference: Backend Prompt Vocabulary

### Architecture Words

| Term | What It Means | When to Use It |
|---|---|---|
| RESTful | Standard way to organize API endpoints | "Build a RESTful API for managing tasks" |
| Serverless | Code runs on-demand without a dedicated server | "Deploy this as a serverless function" |
| Monolith | One codebase handles everything | "Build this as a monolith — keep it simple" |
| Event-driven | Things happen in response to events | "Use an event-driven approach for notifications" |
| Real-time | Data updates instantly for all users | "Make the dashboard update in real-time" |
| WebSocket | Persistent connection for instant two-way communication | "Use WebSockets for the live chat feature" |

### Data Words

| Term | What It Means | When to Use It |
|---|---|---|
| Schema | Blueprint for your database | "Design the database schema for user profiles" |
| Migration | Script that changes database structure | "Create a migration to add an email column" |
| Index | Lookup shortcut for faster searches | "Add an index on the email column" |
| Foreign key | Link between two tables | "Use a foreign key to connect posts to users" |
| ORM | Work with database records as code objects | "Use the ORM instead of raw SQL queries" |
| Seed data | Sample data for testing and demos | "Create seed data with 10 sample users" |

### Security Words

| Term | What It Means | When to Use It |
|---|---|---|
| Authentication | Verifying who someone is | "Add authentication to the app" |
| Authorization | Checking what someone is allowed to do | "Add authorization so only admins can delete posts" |
| Middleware | Code that runs before main logic | "Add auth middleware to all protected routes" |
| Rate-limiting | Restricting requests per time period | "Rate-limit the login endpoint" |
| Input validation | Checking data type, length, and format | "Add server-side input validation to all forms" |
| Hashing | Converting passwords into irreversible strings | "Hash all passwords with bcrypt before storing" |
| Environment variables | Secrets stored outside your code | "Store all secrets in environment variables" |

### Reliability Words

| Term | What It Means | When to Use It |
|---|---|---|
| Error handling | Catching problems and responding gracefully | "Add error handling to all API calls" |
| Retry logic | Automatically trying again on failures | "Add retry logic for external API calls" |
| Graceful degradation | Rest keeps working when part breaks | "If the AI API is down, show a fallback message" |
| Background job | Work happening behind the scenes | "Process video uploads as a background job" |
| Health check | Endpoint reporting app status | "Add a health check endpoint at /api/health" |

## Pre-Demo Review Prompt

```
I'm about to demo this app to judges. Please do a final review and tell me
if anything needs to be fixed:

1. Check that .env is in .gitignore and no secrets are committed to the repo.
2. Try accessing any admin-only endpoint as a non-admin user — does it
   properly block them with a 401 or 403 error?
3. Look at the form submissions — does the server validate the input,
   or would an empty/garbage submission get saved to the database?
4. Search the entire codebase for any string that looks like an API key
   or secret. Are any of them hardcoded instead of in environment variables?
5. Check the error handling — if an external API call fails, does the user
   see a helpful message or a raw error/stack trace?
6. Is there real seed data in the database so the demo doesn't look empty?
7. Can I explain the data model in 30 seconds? If confusing, suggest how to simplify.
```

*Built for the Springfield Vibeathon by Codefi.*

*Last updated: 2026-03-23 00:00:00 UTC*
