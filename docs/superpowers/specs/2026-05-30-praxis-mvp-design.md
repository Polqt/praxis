# Praxis MVP — Design Spec

**Date:** 2026-05-30  
**Status:** Approved  

---

## Overview

Praxis is an Agentic Skill Verification Platform. Users write code in a browser editor, submit it, and an AI agent executes it in a live cloud sandbox against hidden test cases. If all tests pass, the user earns a verified skill badge. The core loop is: write → run → verified (or try again).

---

## Decisions Made

| Concern | Decision | Reason |
|---|---|---|
| Repo structure | pnpm monorepo (`apps/web`, `apps/api`, `packages/shared`) | Clean separation, shared types, matches long-term architecture |
| Auth | Supabase Auth (`@supabase/ssr`) | Already provisioned, no extra accounts needed |
| Database | Supabase Postgres via Drizzle ORM | Already provisioned, consistent with auth |
| Backend | NestJS in `apps/api/` on port 4000 | Explicit requirement, clean DI, modular |
| AI agent | Anthropic SDK, `claude-haiku-4-5` | Already have API access, cost-efficient, capable |
| Sandbox | E2B (`@e2b/code-interpreter`) | Managed, secure, free tier sufficient for MVP |
| Streaming | No SSE — POST completes fully, typewriter simulated client-side | Avoids SSE complexity for MVP, UX result is identical |

---

## Monorepo Structure

```
praxis/
  pnpm-workspace.yaml
  package.json                   ← private: true, no deps
  turbo.json                     ← parallel dev script runner

  apps/
    web/                         ← @praxis/web
      package.json
      next.config.ts
      tsconfig.json
      tailwind.config.ts
      postcss.config.mjs
      components.json
      .env.local
      src/
        app/
          globals.css            ← Praxis design tokens
          layout.tsx             ← fonts, Sonner Toaster
          (marketing)/
            page.tsx             ← landing page
          (auth)/
            sign-in/page.tsx
            sign-up/page.tsx
          (app)/
            layout.tsx           ← auth-protected, Sidebar
            dashboard/page.tsx
            tasks/page.tsx
            task/[taskId]/page.tsx
        components/
          ui/                    ← shadcn primitives
          CodeEditor.tsx
          CoachPanel.tsx
          VerifiedOverlay.tsx
          TaskCard.tsx
          SkillChip.tsx
          StatusPill.tsx
        hooks/
          useVerification.ts
        lib/
          api.ts
          supabase.ts
          utils.ts

    api/                         ← @praxis/api
      package.json
      tsconfig.json
      nest-cli.json
      .env
      src/
        main.ts                  ← port 4000, CORS localhost:3000, /api prefix, ValidationPipe
        app.module.ts
        config/
          configuration.ts       ← typed config: DATABASE_URL, E2B_API_KEY, ANTHROPIC_API_KEY, SUPABASE_JWT_SECRET
        database/
          database.module.ts
          database.service.ts    ← Drizzle + Supabase Postgres
          schema.ts
          seed.ts                ← 3 starter tasks
        auth/
          auth.module.ts
          supabase.guard.ts      ← validates Supabase JWT via SUPABASE_JWT_SECRET
          get-user.decorator.ts
        users/
          users.module.ts
          users.controller.ts    ← GET /users/me, GET /users/me/skills, GET /users/me/dashboard
          users.service.ts       ← getOrCreateUser(supabaseUid, email), getDashboardStats(userId)
        tasks/
          tasks.module.ts
          tasks.controller.ts    ← GET /tasks, GET /tasks/:id (never exposes test_code)
          tasks.service.ts
          tasks.dto.ts
        verification/
          verification.module.ts
          verification.controller.ts  ← POST /verification/run
          verification.service.ts
          sandbox.service.ts
          agent.service.ts
          verification.dto.ts

  packages/
    shared/                      ← @praxis/shared, zero runtime deps
      package.json
      tsconfig.json
      src/
        index.ts
        types/
          task.types.ts
          user.types.ts
          verification.types.ts
```

---

## Data Layer

### Database: Supabase Postgres via Drizzle ORM

Connection string: `DATABASE_URL` (already provisioned in `.env.local`).  
Drizzle runs in `apps/api/` only. The frontend never touches the DB directly — all data access goes through the NestJS API.

### Schema

**`users`**
- `id` — cuid2, PK
- `supabase_uid` — text, unique, not null (links to Supabase Auth user)
- `email` — text, not null
- `username` — text, nullable
- `created_at` — timestamp, defaultNow

**`tasks`**
- `id` — cuid2, PK
- `title` — text, not null
- `description` — text, not null (markdown)
- `language` — enum: `python` (only for MVP)
- `difficulty` — enum: `BEGINNER` | `INTERMEDIATE` | `ADVANCED`
- `starter_code` — text
- `test_code` — text, **never sent to frontend**
- `skill_tags` — text[], default []
- `created_at` — timestamp, defaultNow

**`user_tasks`**
- `id` — cuid2, PK
- `user_id` → `users.id`
- `task_id` → `tasks.id`
- `status` — enum: `PENDING` | `IN_PROGRESS` | `VERIFIED` | `FAILED`, default `PENDING`
- `latest_code` — text (resume on return)
- `attempts` — integer, default 0
- `feedback` — text (last agent message)
- `verified_at` — timestamp, nullable
- `updated_at` — timestamp, defaultNow

**`skills`**
- `id` — cuid2, PK
- `name` — text, unique (e.g. "Recursion")
- `category` — text (e.g. "Python")

**`user_skills`**
- `id` — cuid2, PK
- `user_id` → `users.id`
- `skill_id` → `skills.id`
- `verified_at` — timestamp, defaultNow

### Seed Data (3 tasks)

**Recursive Factorial** — Python, BEGINNER, tags: `["Python", "Recursion", "Algorithms"]`  
**Palindrome Checker** — Python, BEGINNER, tags: `["Python", "String Manipulation", "Logic"]`  
**List Flattener** — Python, INTERMEDIATE, tags: `["Python", "Recursion", "Data Structures"]`

Test code for each task lives only in the DB and is only accessed server-side by `verification.service.ts`.

---

## Auth Flow

1. User signs in/up via Supabase Auth on the frontend
2. `@supabase/ssr` manages the session cookie
3. Frontend reads session token via `supabase.auth.getSession()`
4. Every NestJS API call includes `Authorization: Bearer <supabase_jwt>`
5. `SupabaseGuard` verifies the JWT using `SUPABASE_JWT_SECRET` (no network call — pure local verification)
6. Guard calls `usersService.getOrCreateUser(supabaseUid, email)` and attaches the internal user to `req.user`
7. Unauthenticated requests → 401

---

## Verification Loop

```
POST /api/verification/run  { taskId: string, code: string }
  ↓ SupabaseGuard validates JWT
  ↓ verification.service.verify(userId, taskId, code)

1. Fetch task from DB (only access point for test_code)
2. Upsert user_task:
     status = IN_PROGRESS
     attempts++
     latest_code = code
3. sandbox.service.runVerification(code, task.testCode)
     → Sandbox.create({ timeout: 30000 })
     → write /home/user/solution.py
     → write /home/user/test_solution.py
     → run: python3 test_solution.py
     → kill() in finally block
     → return { stdout, stderr, exitCode, allTestsPassed }
4. agent.service.analyze(sandboxResult, task)
     → Anthropic claude-haiku-4-5
     → System: "You are the Praxis Verification Agent. Respond with raw JSON only:
                { verified: true, message: '...' } OR { verified: false, feedback: '...' }"
     → Input: task.title + stdout + stderr + exitCode
     → Fallback on failure: derive from allTestsPassed with generic message
5. Update user_task:
     status = VERIFIED | FAILED
     feedback = agent message
     verified_at = now() if verified
6. If verified: upsert user_skills for each tag in task.skillTags
7. Return VerifyResponse:
     { verified, message?, feedback?, executionOutput: stdout }
```

**Error cases:**
- E2B timeout → `{ verified: false, feedback: "Execution timed out. Check for infinite loops." }`
- Anthropic failure → fall back to `allTestsPassed`, generic message
- Invalid `taskId` → 404
- Unauthenticated → 401

---

## Frontend

### Design Tokens

Replace the existing `globals.css` oklch variables with the Praxis brand system. The shadcn `radix-luma` style in `components.json` stays — the CSS variables are remapped underneath.

Key tokens:
```css
--bg-base: #07070F        /* page background */
--bg-surface: #0F0F1A     /* cards */
--bg-elevated: #161626    /* hover states */
--brand: #7B5EA7          /* primary purple */
--brand-bright: #9D77D4   /* hover */
--success: #10B981        /* verified/pass */
--error: #EF4444          /* failed */
--text-primary: #EEEEF5
--text-secondary: #9090A8
--font-display: 'Syne'
--font-body: 'DM Sans'
--font-mono: 'JetBrains Mono'
```

### Fonts

Loaded via `next/font/google` in `layout.tsx`:
- **Syne** (700, 800) — headlines, wordmark
- **DM Sans** (400, 500) — UI text, buttons, body
- **JetBrains Mono** (400, 500) — code editor, terminal output

### Routes

```
/                     → Landing page (no auth required)
/sign-in              → Supabase Auth sign-in
/sign-up              → Supabase Auth sign-up
/dashboard            → auth-protected, stats + task list
/tasks                → browse all tasks
/task/[taskId]        → core page: editor + agent + verification
```

`(app)/layout.tsx` checks Supabase session server-side and redirects unauthenticated users to `/sign-in`.

### API Client (`src/lib/api.ts`)

Typed wrapper that:
- Reads the current Supabase session token
- Attaches `Authorization: Bearer <token>` to every request
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (http://localhost:4000/api in dev)
- Throws typed errors on non-2xx responses

### Key Components

**`CodeEditor`** — Monaco Editor, dynamically imported with `ssr: false`. Custom dark theme using `--editor-bg` and `--editor-gutter`. Language set to `python` for MVP.

**`CoachPanel`** — 4 states:
- `idle` — "Write your solution and click Run & Verify when ready." Pulsing green dot.
- `running` — Spinner, animated skeleton lines ("Spinning up sandbox...", "Executing your code...", "Running test cases...")
- `failed` — Red indicator, agent feedback types in character-by-character. Shows attempt count.
- `verified` — Green indicator + glow border. Agent message types in. Skill badge chips appear with scale-in animation. "Next Task" button.

**`VerifiedOverlay`** — Full-viewport celebration triggered on `status === 'verified'`:
1. `backdrop-blur-sm` + semi-transparent dark overlay
2. SVG checkmark draws via `stroke-dashoffset` animation (600ms)
3. "VERIFIED" in Syne 800, 64px
4. Skill chip badges fade in sequentially
5. "Continue to Next Task" button
6. `canvas-confetti` fires from top-center on mount
7. Auto-dismisses after 5s or on click

**`TaskCard`** — title, language badge, difficulty badge, `StatusPill`. Used in dashboard and task list.

**`SkillChip`** — small verified skill badge with checkmark icon. Used in dashboard + `VerifiedOverlay`.

**`StatusPill`** — PENDING (muted) / IN_PROGRESS (brand) / VERIFIED (success) / FAILED (error). Pill shape, semantic colors.

### `useVerification` Hook

```typescript
type VerificationStatus = 'idle' | 'running' | 'verified' | 'failed'

interface UseVerificationReturn {
  status: VerificationStatus
  feedback: string        // typewriter-revealed agent message
  rawOutput: string       // raw sandbox stdout
  attempts: number
  verify: (code: string) => Promise<void>
  reset: () => void
}
```

`verify(code)`:
1. Set `status = 'running'`, clear feedback
2. `POST /verification/run` with `{ taskId, code }`
3. On response: start typewriter effect (25ms/char via `setInterval`)
4. If `verified`: fire confetti, set `status = 'verified'`
5. If `!verified`: set `status = 'failed'`
6. On network error: `status = 'failed'`, feedback = "Something went wrong. Try again."

### Core Task Page (`/task/[taskId]`)

Two-panel layout, full viewport height minus nav:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back    Recursive Factorial    [BEGINNER] [Python]            │
├───────────────────────────┬──────────────────────────────────────┤
│  LEFT (55vw)              │  RIGHT (45vw)                        │
│  [Description] [Editor]   │  ● Praxis Agent                      │
│                           │  ─────────────────                   │
│  [tab content]            │  [CoachPanel state]                  │
│                           │                                      │
├───────────────────────────│                                      │
│  [▶ Run & Verify] [↺ Reset]                                      │
│  TERMINAL ▾ (collapsible) │                                      │
└───────────────────────────┴──────────────────────────────────────┘
```

Mobile: stacks vertically — description → editor → coach panel.

---

## Environment Variables

### `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### `apps/api/.env`
```
DATABASE_URL=
SUPABASE_JWT_SECRET=
E2B_API_KEY=
ANTHROPIC_API_KEY=
PORT=4000
NODE_ENV=development
```

---

## Critical Rules

1. **Never send `test_code` to the frontend.** DB only, server-side only.
2. **Always kill E2B sandboxes in a `finally` block.** Leaked sandboxes cost money.
3. **Monaco must be dynamically imported with `ssr: false`.**
4. **Every async UI state has a loading state.** No blank screens.
5. **Supabase JWT on every API call.** NestJS `SupabaseGuard` validates on every protected route.
6. **NestJS CORS** must allow `http://localhost:3000` in development.
7. **`@praxis/shared` types everywhere.** No duplicated interfaces between apps.
8. **The "VERIFIED" moment must feel special.** Confetti, animation, badge reveal.

---

## MVP Definition of Done

- [ ] Sign up / sign in via Supabase Auth
- [ ] See 3 tasks on the dashboard
- [ ] Click a task, see description and starter code in Monaco editor
- [ ] Write a solution and click "Run & Verify"
- [ ] CoachPanel transitions: idle → running → verified OR failed
- [ ] On failure: read specific agent feedback and try again
- [ ] On success: VerifiedOverlay, confetti, skill badges
- [ ] Return to dashboard and see verified skill badges
- [ ] Task card shows "VERIFIED ✓" status permanently

---

## Out of Scope (MVP)

- Payment / Stripe
- Employer-side features
- Custom assessments
- Email notifications
- JavaScript / TypeScript tasks (Python only)
- Public portfolios
- Leaderboards / streaks
- SSE streaming (simulated typewriter instead)
