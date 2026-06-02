# Praxis

**Deterministic proof-of-work verification for developers.**

Submit a real GitHub repository. Get a scored verification report with real file citations. Share a public proof page anywhere — no login required to view it.

→ **[praxisdev.vercel.app](https://praxisdev.vercel.app)**

---

## What it does

Praxis analyzes a GitHub repository across six engineering dimensions and produces a verification report with scores, narratives, and file citations extracted directly from your code.

| Category | What gets evaluated |
|----------|-------------------|
| API Design | Route organization, validation, error handling, HTTP conventions |
| Authentication | Auth files, JWT/session libraries, guard patterns |
| Database Design | ORM, migrations, schema definitions, relations |
| Testing | Test file count, integration/e2e suites, coverage config |
| Documentation | README quality, API docs, architecture docs |
| Deployment | Dockerfile, CI workflows, infrastructure config |

No AI making scoring decisions. No rubric you can game. Signals are extracted deterministically from what's actually in your repository.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL (Supabase) |
| Queue | BullMQ + Redis (Upstash) |
| Auth | Supabase Auth (GitHub OAuth + Magic Link) |
| Monorepo | pnpm workspaces + Turborepo |

---

## Project structure

```
praxis/
├── apps/
│   ├── api/          # NestJS backend API + worker
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared TypeScript types
└── docs/             # Architecture and deployment docs
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for Redis locally) or an Upstash account
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/Polqt/praxis.git
cd praxis
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in the values. See [apps/api/.env.example](apps/api/.env.example) and [apps/web/.env.example](apps/web/.env.example) for descriptions of each variable.

### 3. Set up the database

Run migrations and seed the challenge data:

```bash
cd apps/api
pnpm db:migrate
pnpm seed
```

### 4. Start Redis

```bash
docker run -p 6379:6379 redis:alpine
```

Or use an Upstash free tier Redis instance.

### 5. Run the development servers

```bash
# Terminal 1 — API
cd apps/api && pnpm dev

# Terminal 2 — Worker
cd apps/api && pnpm worker:dev

# Terminal 3 — Web
cd apps/web && pnpm dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Have a feature idea? [Open an issue](https://github.com/Polqt/praxis/issues) — feedback from the community directly shapes what gets built next.

---

## Roadmap

- [ ] Frontend Engineering challenge track
- [ ] Full-stack challenge track
- [ ] AI-powered report narrative explanations
- [ ] Build and test execution via E2B
- [ ] Skills profile and proof portfolio
- [ ] Employer-facing verified candidate search

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

---

## License

MIT — see [LICENSE](LICENSE).
