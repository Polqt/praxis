# Praxis

Deterministic proof-of-work verification for developers. Submit a GitHub repository, get a scored report with real file citations, share a public proof page.

→ **[praxisdev.vercel.app](https://praxisdev.vercel.app)**

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL (Supabase) |
| Queue | BullMQ + Redis (Upstash) |
| Auth | Supabase Auth (GitHub OAuth + Magic Link) |
| Monorepo | pnpm workspaces + Turborepo |

## Getting started

**Prerequisites:** Node.js 20+, pnpm 9+, Docker or Upstash (Redis), Supabase project.

```bash
git clone https://github.com/Polqt/praxis.git
cd praxis
pnpm install
```

Copy and fill in env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Run migrations:

```bash
cd apps/api && pnpm db:migrate && pnpm seed
```

Start Redis:

```bash
docker run -p 6379:6379 redis:alpine
```

Start dev servers:

```bash
# Terminal 1 — API
cd apps/api && pnpm dev

# Terminal 2 — Worker
cd apps/api && pnpm worker:dev

# Terminal 3 — Web
cd apps/web && pnpm dev
```

Web runs at `http://localhost:3000`, API at `http://localhost:4000`.

## License

MIT — see [LICENSE](LICENSE).
