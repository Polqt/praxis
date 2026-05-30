# Praxis MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Praxis MVP — a pnpm monorepo with a Next.js frontend and NestJS backend where users sign in, pick a coding task, write a solution in Monaco editor, and get it verified by an AI agent running in an E2B sandbox.

**Architecture:** pnpm workspace monorepo with `apps/web` (Next.js 16, App Router), `apps/api` (NestJS, port 4000), and `packages/shared` (TypeScript types only). Supabase handles auth and Postgres; Drizzle ORM runs in the API only. The verification loop is a single POST endpoint — E2B runs user code, Anthropic claude-haiku-4-5 analyzes the result, and the frontend simulates streaming with a typewriter effect.

**Tech Stack:** Next.js 16, NestJS, pnpm workspaces, Supabase Auth + Postgres, Drizzle ORM, @e2b/code-interpreter, Anthropic SDK (claude-haiku-4-5), Monaco Editor, Tailwind CSS v4, shadcn/ui, canvas-confetti, sonner, lucide-react

---

## Phase 1: Monorepo Scaffolding

### Task 1: Restructure root into pnpm workspace

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Create: `turbo.json`

- [ ] **Step 1: Update `pnpm-workspace.yaml`**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

- [ ] **Step 2: Update root `package.json`**

```json
{
  "name": "praxis",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.5.4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {}
  }
}
```

- [ ] **Step 4: Install turbo**

```bash
pnpm add -D turbo -w
```

Expected: turbo added to root `node_modules`.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml
git commit -m "chore: configure pnpm workspace and turbo"
```

---

### Task 2: Create `packages/shared`

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/task.types.ts`
- Create: `packages/shared/src/types/user.types.ts`
- Create: `packages/shared/src/types/verification.types.ts`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@praxis/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/shared/src/types/task.types.ts`**

```typescript
export type Language = 'python'

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'FAILED'

export interface Task {
  id: string
  title: string
  description: string
  language: Language
  difficulty: Difficulty
  starterCode: string
  skillTags: string[]
  createdAt: string
}

export interface TaskWithStatus extends Task {
  status: TaskStatus
  latestCode: string | null
  attempts: number
  feedback: string | null
  verifiedAt: string | null
}
```

- [ ] **Step 4: Create `packages/shared/src/types/user.types.ts`**

```typescript
export interface User {
  id: string
  supabaseUid: string
  email: string
  username: string | null
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
}

export interface UserSkill {
  id: string
  userId: string
  skill: Skill
  verifiedAt: string
}

export interface DashboardStats {
  totalVerified: number
  totalAttempts: number
  verifiedSkills: UserSkill[]
  recentTasks: TaskWithStatus[]
}

import type { TaskWithStatus } from './task.types'
```

- [ ] **Step 5: Create `packages/shared/src/types/verification.types.ts`**

```typescript
export interface VerifyRequest {
  taskId: string
  code: string
}

export interface VerifyResponse {
  verified: boolean
  message?: string
  feedback?: string
  executionOutput: string
}
```

- [ ] **Step 6: Create `packages/shared/src/index.ts`**

```typescript
export * from './types/task.types'
export * from './types/user.types'
export * from './types/verification.types'
```

- [ ] **Step 7: Commit**

```bash
git add packages/
git commit -m "feat: add @praxis/shared types package"
```

---

### Task 3: Scaffold `apps/web`

**Files:**
- Create: `apps/web/` (move all current root Next.js files here)

- [ ] **Step 1: Create the `apps/web` directory structure**

```bash
mkdir -p apps/web/src/app
mkdir -p apps/web/src/components/ui
mkdir -p apps/web/src/hooks
mkdir -p apps/web/src/lib
mkdir -p apps/web/public
```

- [ ] **Step 2: Move existing files into `apps/web`**

Move these from the repo root into `apps/web/`:
- `app/` → `apps/web/src/app/`
- `components/` → `apps/web/src/components/`
- `lib/` → `apps/web/src/lib/`
- `public/` → `apps/web/public/`
- `next.config.ts` → `apps/web/next.config.ts`
- `tsconfig.json` → `apps/web/tsconfig.json`
- `postcss.config.mjs` → `apps/web/postcss.config.mjs`
- `components.json` → `apps/web/components.json`
- `.env.local` → `apps/web/.env.local`
- `eslint.config.mjs` → `apps/web/eslint.config.mjs`
- `next-env.d.ts` → `apps/web/next-env.d.ts`

```bash
mv app apps/web/src/app
mv components apps/web/src/components
mv lib apps/web/src/lib
mv public apps/web/public
mv next.config.ts apps/web/
mv tsconfig.json apps/web/
mv postcss.config.mjs apps/web/
mv components.json apps/web/
mv .env.local apps/web/
mv eslint.config.mjs apps/web/
mv next-env.d.ts apps/web/
```

- [ ] **Step 3: Create `apps/web/package.json`**

```json
{
  "name": "@praxis/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@praxis/shared": "workspace:*",
    "@supabase/ssr": "^0.10.3",
    "@supabase/supabase-js": "^2.106.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.17.0",
    "next": "16.2.6",
    "radix-ui": "^1.4.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "shadcn": "^4.8.3",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 4: Update `apps/web/tsconfig.json` paths**

The moved tsconfig should already work. Verify `@/*` resolves to `./src/*` — update if needed:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Install dependencies from `apps/web`**

```bash
pnpm install
```

Expected: all workspace packages linked, `apps/web/node_modules` populated.

- [ ] **Step 6: Verify `apps/web` starts**

```bash
cd apps/web && pnpm dev
```

Expected: Next.js starts on http://localhost:3000, default page renders.

- [ ] **Step 7: Commit**

```bash
git add apps/ packages/ pnpm-lock.yaml
git commit -m "chore: move Next.js app into apps/web monorepo structure"
```

---

### Task 4: Scaffold `apps/api` (NestJS)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/.env`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@praxis/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main"
  },
  "dependencies": {
    "@praxis/shared": "workspace:*",
    "@anthropic-ai/sdk": "^0.39.0",
    "@e2b/code-interpreter": "^1.5.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "drizzle-orm": "^0.45.2",
    "postgres": "^3.4.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@types/node": "^20",
    "drizzle-kit": "^0.31.10",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@praxis/shared": ["../../packages/shared/src/index.ts"]
    }
  }
}
```

- [ ] **Step 3: Create `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create `apps/api/.env`**

```
DATABASE_URL=postgresql://postgres.pwzrwysdgwskpkkuqzcr:Arcwarden001@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
SUPABASE_JWT_SECRET=
E2B_API_KEY=
ANTHROPIC_API_KEY=
PORT=4000
NODE_ENV=development
```

Copy `DATABASE_URL` from `apps/web/.env.local`. Fill in the others when ready.

- [ ] **Step 5: Create `apps/api/src/main.ts`**

```typescript
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({ origin: 'http://localhost:3000' })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(process.env.PORT ?? 4000)
}

bootstrap()
```

- [ ] **Step 6: Create `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Install API dependencies**

```bash
cd apps/api && pnpm install
```

Expected: NestJS and all deps installed.

- [ ] **Step 8: Commit**

```bash
git add apps/api/
git commit -m "chore: scaffold NestJS api app"
```

---

## Phase 2: Database & Auth (NestJS)

### Task 5: Config, Database module, and Schema

**Files:**
- Create: `apps/api/src/config/configuration.ts`
- Create: `apps/api/src/database/schema.ts`
- Create: `apps/api/src/database/database.service.ts`
- Create: `apps/api/src/database/database.module.ts`

- [ ] **Step 1: Create `apps/api/src/config/configuration.ts`**

```typescript
export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  supabase: {
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  e2b: {
    apiKey: process.env.E2B_API_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  port: parseInt(process.env.PORT ?? '4000', 10),
})
```

- [ ] **Step 2: Install `@paralleldrive/cuid2`**

```bash
cd apps/api && pnpm add @paralleldrive/cuid2
```

- [ ] **Step 3: Create `apps/api/src/database/schema.ts`**

```typescript
import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const languageEnum = pgEnum('language', ['python'])
export const difficultyEnum = pgEnum('difficulty', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED'])

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  supabaseUid: text('supabase_uid').unique().notNull(),
  email: text('email').notNull(),
  username: text('username'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  language: languageEnum('language').notNull().default('python'),
  difficulty: difficultyEnum('difficulty').notNull(),
  starterCode: text('starter_code').notNull(),
  testCode: text('test_code').notNull(),
  skillTags: text('skill_tags').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userTasks = pgTable('user_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  taskId: text('task_id').notNull().references(() => tasks.id),
  status: taskStatusEnum('status').notNull().default('PENDING'),
  latestCode: text('latest_code'),
  attempts: integer('attempts').notNull().default(0),
  feedback: text('feedback'),
  verifiedAt: timestamp('verified_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const skills = pgTable('skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').unique().notNull(),
  category: text('category').notNull(),
})

export const userSkills = pgTable('user_skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  skillId: text('skill_id').notNull().references(() => skills.id),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
})
```

- [ ] **Step 4: Create `apps/api/src/database/database.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: ReturnType<typeof postgres>
  db: ReturnType<typeof drizzle<typeof schema>>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = postgres(this.config.get('database.url')!, { max: 10 })
    this.db = drizzle(this.client, { schema })
  }
}
```

- [ ] **Step 5: Create `apps/api/src/database/database.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

- [ ] **Step 6: Add DatabaseModule to `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Add `drizzle.config.ts` for migrations**

Create `apps/api/drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 8: Run migrations to create tables**

```bash
cd apps/api && pnpm drizzle-kit push
```

Expected: All 5 tables created in Supabase Postgres. No errors.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/config/ apps/api/src/database/ apps/api/drizzle.config.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): add database module with drizzle schema"
```

---

### Task 6: Seed the database

**Files:**
- Create: `apps/api/src/database/seed.ts`

- [ ] **Step 1: Create `apps/api/src/database/seed.ts`**

```typescript
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { tasks, skills } from './schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  await db.insert(tasks).values([
    {
      title: 'Recursive Factorial',
      description: `## Recursive Factorial\n\nWrite a function \`factorial(n)\` that returns the factorial of a non-negative integer \`n\` using recursion.\n\n**Examples:**\n- \`factorial(0)\` → \`1\`\n- \`factorial(5)\` → \`120\`\n- \`factorial(10)\` → \`3628800\``,
      language: 'python',
      difficulty: 'BEGINNER',
      starterCode: `def factorial(n):\n    # Your solution here\n    pass`,
      testCode: `from solution import factorial\nassert factorial(0) == 1, "factorial(0) should return 1"\nassert factorial(1) == 1, "factorial(1) should return 1"\nassert factorial(5) == 120, "factorial(5) should return 120"\nassert factorial(10) == 3628800, "factorial(10) should return 3628800"\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'Recursion', 'Algorithms'],
    },
    {
      title: 'Palindrome Checker',
      description: `## Palindrome Checker\n\nWrite a function \`is_palindrome(s)\` that returns \`True\` if the string is a palindrome, \`False\` otherwise.\n\nIgnore case and spaces.\n\n**Examples:**\n- \`is_palindrome("racecar")\` → \`True\`\n- \`is_palindrome("hello")\` → \`False\`\n- \`is_palindrome("a man a plan a canal panama")\` → \`True\``,
      language: 'python',
      difficulty: 'BEGINNER',
      starterCode: `def is_palindrome(s):\n    # Your solution here\n    pass`,
      testCode: `from solution import is_palindrome\nassert is_palindrome("racecar") == True\nassert is_palindrome("hello") == False\nassert is_palindrome("Racecar") == True\nassert is_palindrome("a man a plan a canal panama") == True\nassert is_palindrome("") == True\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'String Manipulation', 'Logic'],
    },
    {
      title: 'List Flattener',
      description: `## List Flattener\n\nWrite a function \`flatten(lst)\` that takes a nested list and returns a flat list with all values.\n\n**Examples:**\n- \`flatten([1, 2, 3])\` → \`[1, 2, 3]\`\n- \`flatten([1, [2, [3, 4]], 5])\` → \`[1, 2, 3, 4, 5]\`\n- \`flatten([])\` → \`[]\``,
      language: 'python',
      difficulty: 'INTERMEDIATE',
      starterCode: `def flatten(lst):\n    # Your solution here\n    pass`,
      testCode: `from solution import flatten\nassert flatten([1, 2, 3]) == [1, 2, 3]\nassert flatten([1, [2, 3]]) == [1, 2, 3]\nassert flatten([1, [2, [3, 4]], 5]) == [1, 2, 3, 4, 5]\nassert flatten([[1, [2]], [3, [4, [5]]]]) == [1, 2, 3, 4, 5]\nassert flatten([]) == []\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'Recursion', 'Data Structures'],
    },
  ]).onConflictDoNothing()

  await db.insert(skills).values([
    { name: 'Python', category: 'Python' },
    { name: 'Recursion', category: 'Algorithms' },
    { name: 'Algorithms', category: 'Algorithms' },
    { name: 'String Manipulation', category: 'Python' },
    { name: 'Logic', category: 'Algorithms' },
    { name: 'Data Structures', category: 'Algorithms' },
  ]).onConflictDoNothing()

  console.log('Seed complete')
  await client.end()
}

seed().catch(console.error)
```

- [ ] **Step 2: Add seed script to `apps/api/package.json`**

Add to `"scripts"`:
```json
"seed": "ts-node -r dotenv/config src/database/seed.ts"
```

Also install dotenv:
```bash
cd apps/api && pnpm add dotenv && pnpm add -D @types/dotenv
```

- [ ] **Step 3: Run the seed**

```bash
cd apps/api && pnpm seed
```

Expected: `Seed complete` printed. 3 tasks and 6 skills inserted in Supabase.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/database/seed.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): add database seed with 3 tasks"
```

---

### Task 7: Supabase Auth Guard

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/supabase.guard.ts`
- Create: `apps/api/src/auth/get-user.decorator.ts`

- [ ] **Step 1: Install JWT verification library**

```bash
cd apps/api && pnpm add jsonwebtoken && pnpm add -D @types/jsonwebtoken
```

- [ ] **Step 2: Create `apps/api/src/auth/supabase.guard.ts`**

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { UsersService } from '../users/users.service'

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    const token = authHeader.split(' ')[1]
    const secret = this.config.get<string>('supabase.jwtSecret')!

    let payload: { sub: string; email: string }
    try {
      payload = jwt.verify(token, secret) as { sub: string; email: string }
    } catch {
      throw new UnauthorizedException()
    }

    const user = await this.usersService.getOrCreateUser(payload.sub, payload.email)
    request.user = user
    return true
  }
}
```

- [ ] **Step 3: Create `apps/api/src/auth/get-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@praxis/shared'

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
```

- [ ] **Step 4: Create `apps/api/src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { SupabaseGuard } from './supabase.guard'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  providers: [SupabaseGuard],
  exports: [SupabaseGuard],
})
export class AuthModule {}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/auth/ apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): add Supabase JWT auth guard"
```

---

## Phase 3: NestJS Feature Modules

### Task 8: Users module

**Files:**
- Create: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/users/users.service.ts`
- Create: `apps/api/src/users/users.controller.ts`

- [ ] **Step 1: Create `apps/api/src/users/users.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { users, userSkills, skills, userTasks, tasks } from '../database/schema'

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async getOrCreateUser(supabaseUid: string, email: string) {
    const existing = await this.db.db
      .select()
      .from(users)
      .where(eq(users.supabaseUid, supabaseUid))
      .limit(1)

    if (existing.length > 0) return existing[0]

    const created = await this.db.db
      .insert(users)
      .values({ supabaseUid, email })
      .returning()

    return created[0]
  }

  async getMe(userId: string) {
    const result = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!result[0]) throw new NotFoundException()
    return result[0]
  }

  async getUserSkills(userId: string) {
    return this.db.db
      .select({
        id: userSkills.id,
        userId: userSkills.userId,
        skill: { id: skills.id, name: skills.name, category: skills.category },
        verifiedAt: userSkills.verifiedAt,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId))
  }

  async getDashboardStats(userId: string) {
    const verifiedSkills = await this.getUserSkills(userId)

    const recentUserTasks = await this.db.db
      .select({
        id: userTasks.id,
        userId: userTasks.userId,
        taskId: userTasks.taskId,
        status: userTasks.status,
        latestCode: userTasks.latestCode,
        attempts: userTasks.attempts,
        feedback: userTasks.feedback,
        verifiedAt: userTasks.verifiedAt,
        updatedAt: userTasks.updatedAt,
        title: tasks.title,
        description: tasks.description,
        language: tasks.language,
        difficulty: tasks.difficulty,
        starterCode: tasks.starterCode,
        skillTags: tasks.skillTags,
        createdAt: tasks.createdAt,
      })
      .from(userTasks)
      .innerJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .orderBy(userTasks.updatedAt)
      .limit(10)

    const totalVerified = recentUserTasks.filter(t => t.status === 'VERIFIED').length
    const totalAttempts = recentUserTasks.reduce((sum, t) => sum + t.attempts, 0)

    return { totalVerified, totalAttempts, verifiedSkills, recentTasks: recentUserTasks }
  }
}
```

- [ ] **Step 2: Create `apps/api/src/users/users.controller.ts`**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { UsersService } from './users.service'
import { User } from '@praxis/shared'

@Controller('users')
@UseGuards(SupabaseGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user.id)
  }

  @Get('me/skills')
  getMySkills(@GetUser() user: User) {
    return this.usersService.getUserSkills(user.id)
  }

  @Get('me/dashboard')
  getDashboard(@GetUser() user: User) {
    return this.usersService.getDashboardStats(user.id)
  }
}
```

- [ ] **Step 3: Create `apps/api/src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 4: Register UsersModule in `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Start API and verify it boots**

```bash
cd apps/api && pnpm dev
```

Expected: `Nest application successfully started` on port 4000. No errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/users/ apps/api/src/auth/ apps/api/src/app.module.ts
git commit -m "feat(api): add users module with dashboard stats"
```

---

### Task 9: Tasks module

**Files:**
- Create: `apps/api/src/tasks/tasks.module.ts`
- Create: `apps/api/src/tasks/tasks.service.ts`
- Create: `apps/api/src/tasks/tasks.controller.ts`

- [ ] **Step 1: Create `apps/api/src/tasks/tasks.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { tasks, userTasks } from '../database/schema'

const TASK_PUBLIC_FIELDS = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  language: tasks.language,
  difficulty: tasks.difficulty,
  starterCode: tasks.starterCode,
  skillTags: tasks.skillTags,
  createdAt: tasks.createdAt,
}

@Injectable()
export class TasksService {
  constructor(private db: DatabaseService) {}

  async findAll(userId: string) {
    const allTasks = await this.db.db.select(TASK_PUBLIC_FIELDS).from(tasks)

    const userTaskRows = await this.db.db
      .select()
      .from(userTasks)
      .where(eq(userTasks.userId, userId))

    const statusMap = new Map(userTaskRows.map(ut => [ut.taskId, ut]))

    return allTasks.map(task => {
      const ut = statusMap.get(task.id)
      return {
        ...task,
        status: ut?.status ?? 'PENDING',
        latestCode: ut?.latestCode ?? null,
        attempts: ut?.attempts ?? 0,
        feedback: ut?.feedback ?? null,
        verifiedAt: ut?.verifiedAt ?? null,
      }
    })
  }

  async findOne(taskId: string, userId: string) {
    const taskRows = await this.db.db
      .select(TASK_PUBLIC_FIELDS)
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (!taskRows[0]) throw new NotFoundException('Task not found')

    const utRows = await this.db.db
      .select()
      .from(userTasks)
      .where(eq(userTasks.taskId, taskId))
      .limit(1)

    const ut = utRows[0]
    return {
      ...taskRows[0],
      status: ut?.status ?? 'PENDING',
      latestCode: ut?.latestCode ?? null,
      attempts: ut?.attempts ?? 0,
      feedback: ut?.feedback ?? null,
      verifiedAt: ut?.verifiedAt ?? null,
    }
  }
}
```

- [ ] **Step 2: Create `apps/api/src/tasks/tasks.controller.ts`**

```typescript
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { TasksService } from './tasks.service'
import { User } from '@praxis/shared'

@Controller('tasks')
@UseGuards(SupabaseGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.findOne(id, user.id)
  }
}
```

- [ ] **Step 3: Create `apps/api/src/tasks/tasks.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
```

- [ ] **Step 4: Register TasksModule in `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TasksModule } from './tasks/tasks.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/tasks/ apps/api/src/app.module.ts
git commit -m "feat(api): add tasks module (test_code never exposed)"
```

---

### Task 10: Verification module (sandbox + agent + orchestration)

**Files:**
- Create: `apps/api/src/verification/verification.dto.ts`
- Create: `apps/api/src/verification/sandbox.service.ts`
- Create: `apps/api/src/verification/agent.service.ts`
- Create: `apps/api/src/verification/verification.service.ts`
- Create: `apps/api/src/verification/verification.controller.ts`
- Create: `apps/api/src/verification/verification.module.ts`

- [ ] **Step 1: Create `apps/api/src/verification/verification.dto.ts`**

```typescript
import { IsString, IsNotEmpty } from 'class-validator'

export class VerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId: string

  @IsString()
  @IsNotEmpty()
  code: string
}
```

- [ ] **Step 2: Create `apps/api/src/verification/sandbox.service.ts`**

```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Sandbox } from '@e2b/code-interpreter'

export interface SandboxResult {
  stdout: string
  stderr: string
  exitCode: number
  allTestsPassed: boolean
}

@Injectable()
export class SandboxService {
  constructor(private config: ConfigService) {}

  async runVerification(userCode: string, testCode: string): Promise<SandboxResult> {
    let sandbox: Sandbox | null = null
    try {
      sandbox = await Sandbox.create({
        apiKey: this.config.get<string>('e2b.apiKey'),
        timeoutMs: 30000,
      })

      await sandbox.files.write('/home/user/solution.py', userCode)
      await sandbox.files.write('/home/user/test_solution.py', testCode)

      const result = await sandbox.runCode(
        'cd /home/user && python3 test_solution.py',
        { timeoutMs: 25000 },
      )

      const stdout = result.logs.stdout.join('\n')
      const stderr = result.logs.stderr.join('\n')

      return {
        stdout,
        stderr,
        exitCode: result.exitCode ?? 0,
        allTestsPassed: stdout.includes('ALL_TESTS_PASSED'),
      }
    } finally {
      if (sandbox) await sandbox.kill().catch(() => {})
    }
  }
}
```

- [ ] **Step 3: Create `apps/api/src/verification/agent.service.ts`**

```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { SandboxResult } from './sandbox.service'

interface AgentAnalysis {
  verified: boolean
  message?: string
  feedback?: string
}

@Injectable()
export class AgentService {
  private client: Anthropic

  constructor(private config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('anthropic.apiKey'),
    })
  }

  async analyze(
    sandboxResult: SandboxResult,
    task: { title: string; language: string },
  ): Promise<AgentAnalysis> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: `You are the Praxis Verification Agent — a precise, encouraging code reviewer.
You have just run a user's code against automated tests in a secure sandbox.
Your ONLY job is to analyze the execution output and respond with a JSON object.
Rules:
- If all tests passed (stdout contains "ALL_TESTS_PASSED"):
  { "verified": true, "message": "<brief, enthusiastic, 1-sentence confirmation>" }
- If tests failed:
  { "verified": false, "feedback": "<what failed + a conceptual hint — never give the answer — max 3 sentences>" }
CRITICAL: Respond with raw JSON only. No markdown. No explanation outside the JSON.`,
        messages: [
          {
            role: 'user',
            content: `Task: ${task.title}
Language: ${task.language}

Execution stdout:
${sandboxResult.stdout || '(empty)'}

Execution stderr:
${sandboxResult.stderr || '(empty)'}

Exit code: ${sandboxResult.exitCode}`,
          },
        ],
      })

      const raw = (response.content[0] as { text: string }).text.trim()
      return JSON.parse(raw) as AgentAnalysis
    } catch {
      return sandboxResult.allTestsPassed
        ? { verified: true, message: 'All tests passed! Great work.' }
        : { verified: false, feedback: 'Some tests failed. Review your logic and try again.' }
    }
  }
}
```

- [ ] **Step 4: Create `apps/api/src/verification/verification.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { eq, sql } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { tasks, userTasks, skills, userSkills } from '../database/schema'
import { SandboxService } from './sandbox.service'
import { AgentService } from './agent.service'
import { VerifyResponse } from '@praxis/shared'

@Injectable()
export class VerificationService {
  constructor(
    private db: DatabaseService,
    private sandbox: SandboxService,
    private agent: AgentService,
  ) {}

  async verify(userId: string, taskId: string, code: string): Promise<VerifyResponse> {
    const taskRows = await this.db.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (!taskRows[0]) throw new NotFoundException('Task not found')
    const task = taskRows[0]

    await this.db.db
      .insert(userTasks)
      .values({ userId, taskId, status: 'IN_PROGRESS', latestCode: code, attempts: 1 })
      .onConflictDoUpdate({
        target: [userTasks.userId, userTasks.taskId],
        set: {
          status: 'IN_PROGRESS',
          latestCode: code,
          attempts: sql`${userTasks.attempts} + 1`,
          updatedAt: new Date(),
        },
      })

    let sandboxResult
    try {
      sandboxResult = await this.sandbox.runVerification(code, task.testCode)
    } catch {
      return {
        verified: false,
        feedback: 'Execution timed out. Check for infinite loops.',
        executionOutput: '',
      }
    }

    const analysis = await this.agent.analyze(sandboxResult, task)

    await this.db.db
      .update(userTasks)
      .set({
        status: analysis.verified ? 'VERIFIED' : 'FAILED',
        feedback: analysis.message ?? analysis.feedback ?? null,
        verifiedAt: analysis.verified ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(userTasks.userId, userId))

    if (analysis.verified) {
      for (const tag of task.skillTags) {
        const skillRows = await this.db.db
          .select()
          .from(skills)
          .where(eq(skills.name, tag))
          .limit(1)

        if (skillRows[0]) {
          await this.db.db
            .insert(userSkills)
            .values({ userId, skillId: skillRows[0].id })
            .onConflictDoNothing()
        }
      }
    }

    return {
      verified: analysis.verified,
      message: analysis.message,
      feedback: analysis.feedback,
      executionOutput: sandboxResult.stdout,
    }
  }
}
```

- [ ] **Step 5: Create `apps/api/src/verification/verification.controller.ts`**

```typescript
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { SupabaseGuard } from '../auth/supabase.guard'
import { GetUser } from '../auth/get-user.decorator'
import { VerificationService } from './verification.service'
import { VerifyRequestDto } from './verification.dto'
import { User } from '@praxis/shared'

@Controller('verification')
@UseGuards(SupabaseGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('run')
  run(@Body() dto: VerifyRequestDto, @GetUser() user: User) {
    return this.verificationService.verify(user.id, dto.taskId, dto.code)
  }
}
```

- [ ] **Step 6: Create `apps/api/src/verification/verification.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'
import { SandboxService } from './sandbox.service'
import { AgentService } from './agent.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [VerificationController],
  providers: [VerificationService, SandboxService, AgentService],
})
export class VerificationModule {}
```

- [ ] **Step 7: Register VerificationModule in `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TasksModule } from './tasks/tasks.module'
import { VerificationModule } from './verification/verification.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
    VerificationModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Restart API and confirm it boots without errors**

```bash
cd apps/api && pnpm dev
```

Expected: All modules registered, no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/verification/ apps/api/src/app.module.ts pnpm-lock.yaml
git commit -m "feat(api): add verification module with E2B sandbox and Claude agent"
```

---

## Phase 4: Frontend Foundation

### Task 11: Design tokens, fonts, and global styles

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Replace `apps/web/src/app/globals.css` with Praxis design tokens**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--bg-base);
  --color-foreground: var(--text-primary);
  --color-card: var(--bg-surface);
  --color-card-foreground: var(--text-primary);
  --color-primary: var(--brand);
  --color-primary-foreground: var(--text-primary);
  --color-secondary: var(--bg-elevated);
  --color-secondary-foreground: var(--text-secondary);
  --color-muted: var(--bg-elevated);
  --color-muted-foreground: var(--text-muted);
  --color-accent: var(--brand-dim);
  --color-accent-foreground: var(--text-primary);
  --color-destructive: var(--error);
  --color-border: var(--border);
  --color-input: var(--bg-elevated);
  --color-ring: var(--brand);
  --font-sans: var(--font-body);
  --font-mono: var(--font-mono);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

:root {
  --bg-base:      #07070F;
  --bg-surface:   #0F0F1A;
  --bg-elevated:  #161626;
  --bg-overlay:   rgba(15, 15, 26, 0.96);

  --brand:        #7B5EA7;
  --brand-bright: #9D77D4;
  --brand-dim:    #3D2E5C;
  --brand-glow:   rgba(123, 94, 167, 0.35);

  --success:      #10B981;
  --success-dim:  #064E3B;
  --success-glow: rgba(16, 185, 129, 0.3);
  --error:        #EF4444;
  --error-dim:    #450A0A;
  --warning:      #F59E0B;

  --text-primary:   #EEEEF5;
  --text-secondary: #9090A8;
  --text-muted:     #5A5A72;
  --text-inverse:   #07070F;

  --border:         rgba(255, 255, 255, 0.07);
  --border-hover:   rgba(255, 255, 255, 0.14);
  --border-brand:   rgba(123, 94, 167, 0.45);
  --border-success: rgba(16, 185, 129, 0.4);
  --border-error:   rgba(239, 68, 68, 0.4);

  --editor-bg:    #0B0B14;
  --editor-gutter:#12121F;

  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-[var(--bg-base)] text-[var(--text-primary)];
    font-family: var(--font-body);
  }
}
```

- [ ] **Step 2: Update `apps/web/src/app/layout.tsx` with Praxis fonts**

```tsx
import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Praxis — Skill Verification Platform',
  description: 'Prove your skills through execution, not claims.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Install sonner**

```bash
cd apps/web && pnpm add sonner
```

- [ ] **Step 4: Start web and verify fonts + dark background load**

```bash
cd apps/web && pnpm dev
```

Expected: Page has `#07070F` background, text is light. No console errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/layout.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): apply Praxis design tokens and fonts"
```

---

### Task 12: Supabase client and API client

**Files:**
- Create: `apps/web/src/lib/supabase.ts`
- Create: `apps/web/src/lib/api.ts`

- [ ] **Step 1: Update `apps/web/.env.local` with correct variable names**

```
NEXT_PUBLIC_SUPABASE_URL=https://pwzrwysdgwskpkkuqzcr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Ka8s5aNxxHlPQ6Wpv4Ixqg_NjCqbUj3
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Note: rename `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (standard name).

- [ ] **Step 2: Create `apps/web/src/lib/supabase.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 3: Create `apps/web/src/lib/api.ts`**

```typescript
import { createClient } from './supabase'
import type { VerifyRequest, VerifyResponse, TaskWithStatus, DashboardStats } from '@praxis/shared'

async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message ?? 'Request failed')
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  getTasks: () => request<TaskWithStatus[]>('/tasks'),
  getTask: (id: string) => request<TaskWithStatus>(`/tasks/${id}`),
  getDashboard: () => request<DashboardStats>('/users/me/dashboard'),
  verify: (body: VerifyRequest) => request<VerifyResponse>('/verification/run', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/supabase.ts apps/web/src/lib/api.ts apps/web/.env.local
git commit -m "feat(web): add Supabase client and typed API client"
```

---

## Phase 5: Frontend Auth & Routing

### Task 13: Auth pages and route protection

**Files:**
- Create: `apps/web/src/app/(marketing)/page.tsx`
- Create: `apps/web/src/app/(auth)/sign-in/page.tsx`
- Create: `apps/web/src/app/(auth)/sign-up/page.tsx`
- Create: `apps/web/src/app/(app)/layout.tsx`

- [ ] **Step 1: Install `@supabase/auth-ui-react`**

```bash
cd apps/web && pnpm add @supabase/auth-ui-react @supabase/auth-ui-shared
```

- [ ] **Step 2: Create `apps/web/src/app/(marketing)/page.tsx`** (landing page)

```tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Praxis
        </h1>
        <p className="text-xl mb-2" style={{ color: 'var(--text-secondary)' }}>
          Skills proved through execution, not claims.
        </p>
        <p className="text-base mb-10" style={{ color: 'var(--text-muted)' }}>
          Write code. Run it in a live sandbox. Get verified.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up"
            className="px-8 py-3 rounded-full font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-bright))' }}>
            Get Started
          </Link>
          <Link href="/sign-in"
            className="px-8 py-3 rounded-full font-medium border transition-all hover:border-[var(--border-hover)]"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create `apps/web/src/app/(auth)/sign-in/page.tsx`**

```tsx
'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignInPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm p-8 rounded-xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-2xl font-bold mb-6 text-center"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Sign In
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="sign_in"
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`}
          showLinks
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `apps/web/src/app/(auth)/sign-up/page.tsx`**

```tsx
'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignUpPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm p-8 rounded-xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-2xl font-bold mb-6 text-center"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Create Account
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="sign_up"
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`}
          showLinks
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `apps/web/src/app/(app)/layout.tsx`** (auth-protected)

```tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/sign-in')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <nav className="w-56 shrink-0 border-r flex flex-col p-4 gap-1"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <span className="text-xl font-extrabold mb-6 px-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Praxis
        </span>
        <a href="/dashboard" className="px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}>
          Dashboard
        </a>
        <a href="/tasks" className="px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}>
          Tasks
        </a>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 6: Verify auth flow works end-to-end**

Start web: `cd apps/web && pnpm dev`
- Visit http://localhost:3000 — landing page shows
- Visit http://localhost:3000/dashboard — redirects to `/sign-in`
- Sign up with an email — redirects to `/dashboard` (404 is fine for now)

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/ apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add auth pages and route protection"
```

---

## Phase 6: Shared UI Components

### Task 14: StatusPill, SkillChip, TaskCard

**Files:**
- Create: `apps/web/src/components/StatusPill.tsx`
- Create: `apps/web/src/components/SkillChip.tsx`
- Create: `apps/web/src/components/TaskCard.tsx`

- [ ] **Step 1: Create `apps/web/src/components/StatusPill.tsx`**

```tsx
import type { TaskStatus } from '@praxis/shared'

const config: Record<TaskStatus, { label: string; bg: string; color: string }> = {
  PENDING:     { label: 'Pending',     bg: 'var(--bg-elevated)',  color: 'var(--text-muted)' },
  IN_PROGRESS: { label: 'In Progress', bg: 'var(--brand-dim)',    color: 'var(--brand-bright)' },
  VERIFIED:    { label: 'Verified ✓',  bg: 'var(--success-dim)',  color: 'var(--success)' },
  FAILED:      { label: 'Failed',      bg: 'var(--error-dim)',    color: 'var(--error)' },
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const { label, bg, color } = config[status]
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}>
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Create `apps/web/src/components/SkillChip.tsx`**

```tsx
import { CheckCircle } from 'lucide-react'

export function SkillChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
      style={{
        background: 'var(--success-dim)',
        color: 'var(--success)',
        borderColor: 'var(--border-success)',
      }}>
      <CheckCircle size={12} />
      {name}
    </span>
  )
}
```

- [ ] **Step 3: Create `apps/web/src/components/TaskCard.tsx`**

```tsx
import Link from 'next/link'
import type { TaskWithStatus } from '@praxis/shared'
import { StatusPill } from './StatusPill'

export function TaskCard({ task }: { task: TaskWithStatus }) {
  return (
    <Link href={`/task/${task.id}`}
      className="block p-5 rounded-xl border transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </h3>
        <StatusPill status={task.status} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded border"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
          {task.language.toUpperCase()}
        </span>
        <span className="text-xs px-2 py-0.5 rounded border"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
          {task.difficulty}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/StatusPill.tsx apps/web/src/components/SkillChip.tsx apps/web/src/components/TaskCard.tsx
git commit -m "feat(web): add StatusPill, SkillChip, TaskCard components"
```

---

## Phase 7: App Pages

### Task 15: Dashboard and Tasks pages

**Files:**
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`
- Create: `apps/web/src/app/(app)/tasks/page.tsx`

- [ ] **Step 1: Create `apps/web/src/app/(app)/dashboard/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { DashboardStats } from '@praxis/shared'
import { TaskCard } from '@/components/TaskCard'
import { SkillChip } from '@/components/SkillChip'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    apiClient.getDashboard().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-6"
          style={{ background: 'var(--bg-elevated)' }} />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse"
              style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Verified Skills</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--success)' }}>
            {stats.totalVerified}
          </p>
        </div>
        <div className="p-5 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Total Attempts</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.totalAttempts}
          </p>
        </div>
      </div>

      {stats.verifiedSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Your Verified Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.verifiedSkills.map(us => (
              <SkillChip key={us.id} name={us.skill.name} />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Tasks
      </h2>
      <div className="grid gap-3">
        {stats.recentTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `apps/web/src/app/(app)/tasks/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { TaskWithStatus } from '@praxis/shared'
import { TaskCard } from '@/components/TaskCard'

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithStatus[] | null>(null)

  useEffect(() => {
    apiClient.getTasks().then(setTasks).catch(console.error)
  }, [])

  if (!tasks) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="h-8 w-32 rounded-lg animate-pulse mb-6"
          style={{ background: 'var(--bg-elevated)' }} />
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse"
              style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Tasks
      </h1>
      <div className="grid gap-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify dashboard renders**

Ensure API is running (`cd apps/api && pnpm dev`) and web is running (`cd apps/web && pnpm dev`). Sign in and visit http://localhost:3000/dashboard. Expected: stats cards and task list render (may show 0s until API connects).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/'(app)'/dashboard/ apps/web/src/app/'(app)'/tasks/
git commit -m "feat(web): add dashboard and tasks pages"
```

---

## Phase 8: Core Task Page

### Task 16: CodeEditor component

**Files:**
- Create: `apps/web/src/components/CodeEditor.tsx`

- [ ] **Step 1: Install Monaco Editor**

```bash
cd apps/web && pnpm add @monaco-editor/react
```

- [ ] **Step 2: Create `apps/web/src/components/CodeEditor.tsx`**

```tsx
'use client'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export function CodeEditor({ value, onChange, language = 'python' }: CodeEditorProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg"
      style={{ background: 'var(--editor-bg)' }}>
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          padding: { top: 16, bottom: 16 },
          folding: false,
          wordWrap: 'on',
        }}
        onMount={(editor, monaco) => {
          monaco.editor.defineTheme('praxis-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#0B0B14',
              'editor.lineHighlightBackground': '#161626',
              'editorGutter.background': '#12121F',
              'editorLineNumber.foreground': '#5A5A72',
              'editorLineNumber.activeForeground': '#9090A8',
            },
          })
          monaco.editor.setTheme('praxis-dark')
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/CodeEditor.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add Monaco CodeEditor component"
```

---

### Task 17: useVerification hook

**Files:**
- Create: `apps/web/src/hooks/useVerification.ts`

- [ ] **Step 1: Install canvas-confetti**

```bash
cd apps/web && pnpm add canvas-confetti && pnpm add -D @types/canvas-confetti
```

- [ ] **Step 2: Create `apps/web/src/hooks/useVerification.ts`**

```typescript
'use client'

import { useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { apiClient } from '@/lib/api'

export type VerificationStatus = 'idle' | 'running' | 'verified' | 'failed'

export interface UseVerificationReturn {
  status: VerificationStatus
  feedback: string
  rawOutput: string
  attempts: number
  verify: (code: string) => Promise<void>
  reset: () => void
}

export function useVerification(taskId: string): UseVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [feedback, setFeedback] = useState('')
  const [rawOutput, setRawOutput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const typewrite = useCallback((text: string, onDone?: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFeedback('')
    let i = 0
    intervalRef.current = setInterval(() => {
      setFeedback(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(intervalRef.current!)
        onDone?.()
      }
    }, 25)
  }, [])

  const verify = useCallback(async (code: string) => {
    setStatus('running')
    setFeedback('')
    setRawOutput('')
    setAttempts(prev => prev + 1)

    try {
      const result = await apiClient.verify({ taskId, code })
      setRawOutput(result.executionOutput)

      if (result.verified) {
        const message = result.message ?? 'All tests passed!'
        typewrite(message, () => {
          setStatus('verified')
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { x: 0.5, y: 0 },
            colors: ['#7B5EA7', '#9D77D4', '#10B981', '#EEEEF5'],
          })
        })
      } else {
        const msg = result.feedback ?? 'Some tests failed. Try again.'
        typewrite(msg, () => setStatus('failed'))
      }
    } catch {
      setFeedback('Something went wrong. Try again.')
      setStatus('failed')
    }
  }, [taskId, typewrite])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('idle')
    setFeedback('')
    setRawOutput('')
  }, [])

  return { status, feedback, rawOutput, attempts, verify, reset }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/useVerification.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add useVerification hook with typewriter and confetti"
```

---

### Task 18: CoachPanel component

**Files:**
- Create: `apps/web/src/components/CoachPanel.tsx`

- [ ] **Step 1: Create `apps/web/src/components/CoachPanel.tsx`**

```tsx
'use client'

import type { VerificationStatus } from '@/hooks/useVerification'
import { SkillChip } from './SkillChip'

interface CoachPanelProps {
  status: VerificationStatus
  feedback: string
  attempts: number
  skillTags: string[]
  onRetry: () => void
  onNextTask: () => void
}

export function CoachPanel({ status, feedback, attempts, skillTags, onRetry, onNextTask }: CoachPanelProps) {
  return (
    <div className="h-full flex flex-col p-6 border-l"
      style={{
        background: 'var(--bg-surface)',
        borderColor: status === 'verified'
          ? 'var(--border-success)'
          : status === 'failed'
          ? 'var(--border-error)'
          : 'var(--border)',
        boxShadow: status === 'verified' ? '0 0 24px var(--success-glow)' : undefined,
      }}>
      <div className="flex items-center gap-2 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <StatusDot status={status} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {status === 'idle'     ? 'Praxis Agent'   : ''}
          {status === 'running'  ? 'Analyzing...'   : ''}
          {status === 'verified' ? 'Skill Verified!' : ''}
          {status === 'failed'   ? 'Not quite'      : ''}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {status === 'idle' && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Write your solution and click <strong style={{ color: 'var(--text-primary)' }}>"Run & Verify"</strong> when ready.
            <br /><br />
            I'll execute your code in a live sandbox and tell you exactly what passes or fails.
          </p>
        )}

        {status === 'running' && (
          <div className="space-y-3">
            {['Spinning up sandbox...', 'Executing your code...', 'Running test cases...'].map((line, i) => (
              <div key={i} className="h-4 rounded animate-pulse"
                style={{ background: 'var(--bg-elevated)', width: `${70 + i * 10}%` }} />
            ))}
          </div>
        )}

        {(status === 'failed' || status === 'verified') && feedback && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: status === 'verified' ? 'var(--success)' : 'var(--text-secondary)' }}>
            {feedback}
            <span className="animate-pulse">▌</span>
          </p>
        )}

        {status === 'verified' && skillTags.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-muted)' }}>Skills Earned</p>
            <div className="flex flex-wrap gap-2">
              {skillTags.map(tag => <SkillChip key={tag} name={tag} />)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        {status === 'failed' && (
          <>
            <p className="text-xs text-center mb-2" style={{ color: 'var(--text-muted)' }}>
              Attempt {attempts}
            </p>
            <button onClick={onRetry}
              className="w-full py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'var(--brand)', color: 'var(--text-primary)' }}>
              ▶ Run & Verify Again
            </button>
          </>
        )}
        {status === 'verified' && (
          <button onClick={onNextTask}
            className="w-full py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: 'var(--success)', color: 'var(--text-inverse)' }}>
            → Next Task
          </button>
        )}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: VerificationStatus }) {
  const color = {
    idle:     'var(--success)',
    running:  'var(--brand)',
    verified: 'var(--success)',
    failed:   'var(--error)',
  }[status]

  return (
    <span className="relative flex h-2.5 w-2.5">
      {(status === 'idle' || status === 'running') && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: color }} />
      )}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: color }} />
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/CoachPanel.tsx
git commit -m "feat(web): add CoachPanel with 4 states"
```

---

### Task 19: VerifiedOverlay component

**Files:**
- Create: `apps/web/src/components/VerifiedOverlay.tsx`

- [ ] **Step 1: Create `apps/web/src/components/VerifiedOverlay.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { SkillChip } from './SkillChip'
import Link from 'next/link'

interface VerifiedOverlayProps {
  skillTags: string[]
  onDismiss: () => void
  nextTaskId?: string
}

export function VerifiedOverlay({ skillTags, onDismiss, nextTaskId }: VerifiedOverlayProps) {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { x: 0.5, y: 0 },
      colors: ['#7B5EA7', '#9D77D4', '#10B981', '#EEEEF5'],
    })
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm cursor-pointer"
      style={{ background: 'rgba(7, 7, 15, 0.88)' }}
      onClick={onDismiss}>
      <div className="text-center px-8" onClick={e => e.stopPropagation()}>
        <svg viewBox="0 0 80 80" className="mx-auto mb-6" width={80} height={80}>
          <circle cx="40" cy="40" r="36" fill="none"
            stroke="var(--success)" strokeWidth="4" strokeDasharray="226" strokeDashoffset="226"
            style={{ animation: 'draw-circle 0.4s ease forwards' }} />
          <polyline points="24,40 35,52 56,30" fill="none"
            stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="48" strokeDashoffset="48"
            style={{ animation: 'draw-check 0.3s ease 0.4s forwards' }} />
        </svg>
        <style>{`
          @keyframes draw-circle { to { stroke-dashoffset: 0; } }
          @keyframes draw-check  { to { stroke-dashoffset: 0; } }
        `}</style>

        <h2 className="text-7xl font-extrabold mb-6 tracking-widest"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--success)' }}>
          VERIFIED
        </h2>

        {skillTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {skillTags.map((tag, i) => (
              <span key={tag} className="animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <SkillChip name={tag} />
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {nextTaskId && (
            <Link href={`/task/${nextTaskId}`}
              className="px-6 py-3 rounded-full text-sm font-medium"
              style={{ background: 'var(--success)', color: 'var(--text-inverse)' }}>
              → Continue to Next Task
            </Link>
          )}
          <Link href="/dashboard"
            className="px-6 py-3 rounded-full text-sm font-medium border"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/VerifiedOverlay.tsx
git commit -m "feat(web): add VerifiedOverlay with SVG checkmark animation"
```

---

### Task 20: Core task page `/task/[taskId]`

**Files:**
- Create: `apps/web/src/app/(app)/task/[taskId]/page.tsx`

- [ ] **Step 1: Create `apps/web/src/app/(app)/task/[taskId]/page.tsx`**

```tsx
'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import type { TaskWithStatus } from '@praxis/shared'
import { CodeEditor } from '@/components/CodeEditor'
import { CoachPanel } from '@/components/CoachPanel'
import { VerifiedOverlay } from '@/components/VerifiedOverlay'
import { StatusPill } from '@/components/StatusPill'
import { useVerification } from '@/hooks/useVerification'

export default function TaskPage({ params }: PageProps<'/task/[taskId]'>) {
  const { taskId } = use(params)
  const router = useRouter()
  const [task, setTask] = useState<TaskWithStatus | null>(null)
  const [code, setCode] = useState('')
  const [activeTab, setActiveTab] = useState<'description' | 'editor'>('description')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const { status, feedback, rawOutput, attempts, verify, reset } = useVerification(taskId)

  useEffect(() => {
    apiClient.getTask(taskId).then(t => {
      setTask(t)
      setCode(t.latestCode ?? t.starterCode)
    }).catch(() => router.push('/tasks'))
  }, [taskId, router])

  useEffect(() => {
    if (status === 'verified') setShowOverlay(true)
  }, [status])

  if (!task) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-32 rounded animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-base)' }}>
      {showOverlay && (
        <VerifiedOverlay
          skillTags={task.skillTags}
          onDismiss={() => setShowOverlay(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b shrink-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <Link href="/tasks" className="text-sm transition-colors hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-muted)' }}>
          ← Tasks
        </Link>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs px-2 py-0.5 rounded border"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            {task.language.toUpperCase()}
          </span>
          <StatusPill status={task.status} />
        </div>
      </div>

      {/* Main panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex flex-col" style={{ width: '55%' }}>
          {/* Tabs */}
          <div className="flex border-b shrink-0"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            {(['description', 'editor'] as const).map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2"
                style={{
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'description' ? (
              <div className="p-6 prose prose-invert max-w-none"
                style={{ color: 'var(--text-secondary)' }}>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{task.description}</pre>
              </div>
            ) : (
              <div className="h-full p-3">
                <CodeEditor value={code} onChange={setCode} language={task.language} />
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="border-t shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => { setActiveTab('editor'); verify(code) }}
                disabled={status === 'running'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-bright))', color: 'white' }}>
                {status === 'running' ? '⟳ Running...' : '▶ Run & Verify'}
              </button>
              <button
                onClick={() => { setCode(task.starterCode); reset() }}
                className="px-4 py-2.5 rounded-full text-sm font-medium border transition-all"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                ↺ Reset
              </button>
            </div>

            {/* Terminal */}
            <div className="border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setTerminalOpen(o => !o)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <span>{terminalOpen ? '▾' : '▸'}</span> TERMINAL
              </button>
              {terminalOpen && (
                <div className="px-4 pb-3 max-h-40 overflow-auto"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--editor-bg)' }}>
                  <pre>{rawOutput || '> No output yet'}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-hidden">
          <CoachPanel
            status={status}
            feedback={feedback}
            attempts={attempts}
            skillTags={task.skillTags}
            onRetry={() => verify(code)}
            onNextTask={() => router.push('/tasks')}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the full loop end-to-end**

Ensure both API and web are running. Sign in, go to a task, write a correct solution (e.g. `def factorial(n): return 1 if n == 0 else n * factorial(n-1)`), click "Run & Verify". Expected: CoachPanel transitions idle → running → verified, confetti fires, VerifiedOverlay shows.

- [ ] **Step 3: Test a failing submission**

Enter wrong code (e.g. `def factorial(n): return 0`), click "Run & Verify". Expected: CoachPanel shows 'failed' state with agent feedback typed in.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/
git commit -m "feat(web): add core task page with full verification loop"
```

---

## Phase 9: Final Wiring

### Task 21: Update the marketing page root route and delete old default page

**Files:**
- Delete: old root `apps/web/src/app/page.tsx` (the default Next.js scaffold)
- Verify: `(marketing)/page.tsx` handles `/`

- [ ] **Step 1: Remove old scaffold page if it still exists**

Check if `apps/web/src/app/page.tsx` exists at root level. If so, delete it — the `(marketing)/page.tsx` handles `/`.

```bash
rm apps/web/src/app/page.tsx 2>/dev/null || true
```

- [ ] **Step 2: Redirect `/dashboard` to tasks if no tasks started yet**

In `apps/web/src/app/(app)/dashboard/page.tsx`, if `stats.recentTasks.length === 0`, render a link to `/tasks`:

Add after the skills section:
```tsx
{stats.recentTasks.length === 0 && (
  <div className="p-6 rounded-xl border text-center"
    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
      No tasks started yet.
    </p>
    <Link href="/tasks"
      className="px-5 py-2.5 rounded-full text-sm font-medium"
      style={{ background: 'var(--brand)', color: 'white' }}>
      Browse Tasks
    </Link>
  </div>
)}
```

- [ ] **Step 3: Final smoke test — full MVP user journey**

1. Visit http://localhost:3000 — landing page
2. Click "Get Started" → sign up with email
3. Redirected to `/dashboard` — shows 0 verified, 0 attempts, "Browse Tasks" CTA
4. Click "Browse Tasks" → 3 task cards visible
5. Click "Recursive Factorial" → task page opens, Monaco editor with starter code
6. Switch to Editor tab, write correct solution, click "Run & Verify"
7. CoachPanel: idle → running → verified. Confetti. VerifiedOverlay shows.
8. Dismiss overlay, return to dashboard — shows 1 verified, skill badges
9. Task card shows "Verified ✓"

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Praxis MVP — skill verification loop end-to-end"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✓ Monorepo: pnpm workspace, `apps/web`, `apps/api`, `packages/shared` — Tasks 1–4
- ✓ Shared types: all enums and interfaces — Task 2
- ✓ Database schema (5 tables) + seed (3 tasks) — Tasks 5–6
- ✓ Supabase JWT guard — Task 7
- ✓ Users module (getOrCreateUser, dashboard stats) — Task 8
- ✓ Tasks module (never exposes test_code) — Task 9
- ✓ Verification module (E2B sandbox + Claude agent + orchestration) — Task 10
- ✓ Design tokens + Praxis fonts — Task 11
- ✓ Supabase client + typed API client — Task 12
- ✓ Auth pages + route protection — Task 13
- ✓ StatusPill, SkillChip, TaskCard — Task 14
- ✓ Dashboard + Tasks pages with skeletons — Task 15
- ✓ Monaco CodeEditor (ssr: false) — Task 16
- ✓ useVerification hook (typewriter + confetti) — Task 17
- ✓ CoachPanel (4 states) — Task 18
- ✓ VerifiedOverlay (SVG animation + confetti) — Task 19
- ✓ Core task page — Task 20
- ✓ Final wiring + smoke test — Task 21

**Placeholder scan:** No TBDs. All steps have complete code.

**Type consistency:**
- `TaskWithStatus` used consistently in TaskCard, tasks page, dashboard, task page
- `VerificationStatus` from `useVerification` used consistently in CoachPanel props
- `DashboardStats` from `@praxis/shared` used in dashboard page
- `VerifyRequest`/`VerifyResponse` from `@praxis/shared` used in api.ts and verification.service.ts
- `SandboxResult` defined in sandbox.service.ts, consumed by agent.service.ts and verification.service.ts
