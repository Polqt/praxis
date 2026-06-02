# Deployment Guide

## Services

Praxis runs three processes:

| Process | Entry point | Description |
|---------|-------------|-------------|
| API | `dist/apps/api/src/main` | NestJS HTTP server |
| Worker | `dist/apps/api/src/worker` | BullMQ job processor |
| Web | Next.js / `next start` | Frontend |

The API and worker share the same codebase but run as separate processes (or containers).

---

## Environment Variables

### API (`apps/api/.env.example`)

Copy `apps/api/.env.example` to `apps/api/.env` and fill in all values.
Required at startup — the process will throw if any of these are absent:

- `DATABASE_URL` — pooled Postgres connection
- `DATABASE_DIRECT_URL` — direct Postgres connection (for migrations)
- `SUPABASE_JWKS_URL` — JWT verification endpoint
- `GITHUB_TOKEN_ENCRYPTION_KEY` — base64-encoded 32-byte AES key
- `REDIS_URL` — BullMQ and worker heartbeat
- `CORS_ORIGIN` — web app origin, no trailing slash

### Web (`apps/web/.env.example`)

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in all values:

- `NEXT_PUBLIC_API_URL` — API base URL, e.g. `https://api.praxis.dev/api`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deploying the API

```bash
# 1. Install and build
pnpm install --frozen-lockfile
pnpm --filter @praxis/api build

# 2. Run migrations (before starting the server)
pnpm --filter @praxis/api exec ts-node --project apps/api/tsconfig.json apps/api/scripts/migrate.ts

# 3. Seed reference data (idempotent — safe to run multiple times)
pnpm --filter @praxis/api exec ts-node -r dotenv/config apps/api/src/database/seed.ts

# 4. Start the API
node dist/apps/api/src/main
```

With Docker:

```bash
docker build -f apps/api/Dockerfile -t praxis-api .
docker run -p 4000:4000 --env-file apps/api/.env praxis-api
```

---

## Deploying the Worker

The worker must run as a **separate process** from the API.

```bash
node dist/apps/api/src/worker
```

With Docker:

```bash
docker build -f apps/api/Dockerfile.worker -t praxis-worker .
docker run --env-file apps/api/.env praxis-worker
```

---

## Deploying the Web App

```bash
pnpm --filter @praxis/web build
pnpm --filter @praxis/web start
```

---

## Running Migrations

Migrations are managed with Drizzle Kit. Migration files live in `apps/api/drizzle/`.

```bash
# Run pending migrations against the database
pnpm --filter @praxis/api exec ts-node --project apps/api/tsconfig.json apps/api/scripts/migrate.ts

# Generate a new migration after schema changes
cd apps/api && pnpm db:generate

# Apply migrations directly (dev only)
cd apps/api && pnpm db:migrate
```

**Always run migrations before deploying a new API version.**

---

## Rolling Back a Migration

Drizzle does not have a built-in rollback. To roll back:

1. Identify the migration to undo in `apps/api/drizzle/`.
2. Write a reverse SQL migration manually.
3. Apply it directly against the database or add it as a new migration file.
4. Remove the forward migration file from `drizzle/` and the entry from `drizzle/meta/_journal.json`.

---

## Running the Seed

The seed is idempotent — it upserts the backend track, skills, and the Production REST API challenge.

```bash
pnpm --filter @praxis/api exec ts-node -r dotenv/config apps/api/src/database/seed.ts
```

Run this once after the initial deploy and after any rubric changes.

---

## Verifying a Healthy Deployment

```bash
# Liveness — process is running
curl https://api.praxis.dev/api/health/live
# → {"status":"ok"}

# Readiness — all dependencies available
curl https://api.praxis.dev/api/health/ready
# → {"status":"ok","components":{"database":{"status":"ok"},"redis":{"status":"ok"},"worker":{"status":"ok"}},"queue":{"waiting":0,"active":0,"failed":0}}
```

If `worker.status` is `fail`, check that the worker process is running and connected to Redis.

If `database.status` is `fail`, check `DATABASE_URL` and Postgres connectivity.

---

## If the Worker Stops Processing Jobs

1. Check that the worker process is running: `ps aux | grep worker` or check your container status.
2. Check Redis connectivity from the worker host.
3. Inspect the BullMQ failed jobs queue via `apps/api/scripts/check-queue.mjs`.
4. Restart the worker process. It will resume processing from the BullMQ queue automatically.
5. Failed submissions can be resubmitted by the user — no manual queue intervention is needed for V1.
