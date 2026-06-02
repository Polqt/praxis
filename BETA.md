# Praxis Beta

Praxis is a deterministic proof-of-work platform for developers. Submit a real GitHub repository against a verification challenge. Receive a scored report that audits your repository for tests, documentation, CI configuration, authentication patterns, and code organization — no AI, no subjective review, only explainable signal detection. This is the beta. Scoring covers one challenge (Production REST API), the ingestion pipeline has size limits, and some rough edges exist. See [Known Limitations](docs/LIMITATIONS.md) before submitting feedback.

---

## Prerequisites

| Dependency | Minimum version | Notes |
|---|---|---|
| Node.js | 20 | Required by both API and web app |
| pnpm | 9 | Workspace package manager |
| Redis | 7 | Queue backend for the verification worker |
| PostgreSQL | 15 | Managed via Supabase |
| Supabase project | — | Auth, database, and storage. Tables and RLS are managed by Drizzle migrations. |
| GitHub OAuth app | — | Two separate apps recommended — one for sign-in, one for verification access. See below. |

---

## Environment Variables

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | Supabase pooled connection string (port 6543) |
| `DATABASE_DIRECT_URL` | ✓ | Supabase direct connection string (port 5432) for migrations |
| `SUPABASE_JWT_SECRET` | ✓ | Public key from Supabase project → API → JWT settings |
| `SUPABASE_JWKS_URL` | ✓ | `https://<project>.supabase.co/auth/v1/.well-known/jwks.json` |
| `GITHUB_TOKEN_ENCRYPTION_KEY` | ✓ | Base64-encoded 32-byte AES key for encrypting stored GitHub tokens |
| `REDIS_URL` | ✓ | Redis connection URL, default `redis://localhost:6379` |
| `PORT` | optional | API listen port, default `4000` |
| `INGESTION_MAX_TREE_FILES` | optional | Max files in the GitHub tree before ingestion stops, default `500` |
| `INGESTION_MAX_SELECTED_FILES` | optional | Max files read and scored, default `80` |
| `INGESTION_MAX_FILE_BYTES` | optional | Max size per file in bytes, default `102400` (100 KB) |
| `INGESTION_MAX_TOTAL_BYTES` | optional | Max total bytes across all files, default `1048576` (1 MB) |
| `WORKER_HEARTBEAT_KEY` | optional | Redis key for worker health signal, default `praxis:worker:heartbeat` |
| `WORKER_HEARTBEAT_TTL_SECONDS` | optional | Heartbeat expiry in seconds, default `30` |
| `SUBMISSION_EXPIRY_HOURS` | optional | Hours before an in-progress submission is expired, default `6` |
| `SUBMISSION_RATE_LIMIT_PER_HOUR` | optional | Max submissions per user per hour, default `5` |
| `ANTHROPIC_API_KEY` | optional | Reserved for future AI explanation features, not used in beta |
| `E2B_API_KEY` | optional | Reserved for future sandbox execution, not used in beta |

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase publishable anon key |
| `NEXT_PUBLIC_API_URL` | ✓ | API base URL including `/api` prefix, e.g. `http://localhost:4000/api` |

---

## GitHub OAuth Setup

Praxis uses two distinct GitHub OAuth flows. They have different purposes and request different scopes.

### Flow 1 — Sign-in OAuth (identity only)

This flow authenticates users into Praxis. It is handled entirely by Supabase Auth.

1. In your Supabase project → Authentication → Providers → GitHub, enable GitHub sign-in.
2. Create a GitHub OAuth App at https://github.com/settings/developers.
3. Set the callback URL to `https://<your-supabase-project>.supabase.co/auth/v1/callback`.
4. Copy the Client ID and Client Secret into Supabase.
5. Scopes: Supabase requests `read:user` and `user:email` automatically. No additional scopes needed.

### Flow 2 — Verification OAuth (repository access)

This flow connects a GitHub account for repository ingestion. It runs inside the Praxis application, separate from sign-in.

1. Create a second GitHub OAuth App (or reuse the first if acceptable).
2. Set the callback URL to `http://localhost:3000/auth/callback` (development) or your production URL.
3. Configure in `apps/web/.env.local` — this flow is initiated client-side via Supabase's `signInWithOAuth` with explicit scopes.
4. Scopes requested: `read:user`. The beta does not require `repo` scope — public repositories are accessible without it. Private repository verification requires `repo` scope and is a known limitation.

The two flows are separate because sign-in identity and repository access are different trust boundaries. A user may sign in with GitHub but connect a different GitHub account for verification.

---

## Running the API

```bash
cd apps/api
cp .env.example .env   # fill in all required values
pnpm install           # from repo root: pnpm install
pnpm start:dev
```

The API starts on port 4000 by default. All routes are prefixed with `/api`.

---

## Running the Worker

The verification worker is a separate process that consumes jobs from the Redis queue.

```bash
# From the repo root
cd apps/api
pnpm start:worker
```

The worker must be running for submissions to progress past the `queued` state. If you submit a repository and the timeline does not advance, the worker is not running.

---

## Running the Web App

```bash
cd apps/web
cp .env.local.example .env.local   # fill in required values
pnpm dev
```

The web app starts on port 3000.

---

## Running Everything Together

Start processes in this order — order matters because the worker connects to Redis on startup:

1. **Redis** — must be running before the API and worker start.
2. **API** — `cd apps/api && pnpm start:dev`
3. **Worker** — `cd apps/api && pnpm start:worker`
4. **Web app** — `cd apps/web && pnpm dev`

From the repo root you can also run:

```bash
pnpm dev   # starts API and web concurrently if a root dev script exists
```

Check `package.json` at the root for available scripts.

---

## Known Issues in Beta

- **Large repositories may fail ingestion.** The pipeline reads a maximum of 80 files up to 1 MB total. Repositories with many small files may be cut off mid-tree. Monorepos that place backend code in a subdirectory may ingest the wrong files.
- **No tests = floor failure.** A repository with zero test files will fail the Testing floor condition and receive an INSUFFICIENT verdict regardless of other scores. This is intentional but catches developers who keep tests locally and never commit them.
- **Worker cold-start delay.** The first job after starting the worker may take longer than usual as the GitHub API client initialises. If a submission stalls for more than 2 minutes after `queued`, restart the worker.
- **Private organization repositories.** Verification OAuth currently requests `read:user` only. Repositories owned by a GitHub organization may not be accessible unless the user's token has `repo` scope. This is a known gap.
- **Username required before Studio.** New users are redirected to username onboarding before accessing Studio. This is by design.
- **Public proof page.** Report visibility toggle exists on the private report page. The public proof page (`/proof/:token`) is minimal — it shows scores and narratives but not the full report UI. Full public report rendering is planned for post-beta.
