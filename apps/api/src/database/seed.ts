import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as postgresModule from 'postgres'
import { tracks, skills, projectChallenges } from './schema'

const postgres = (postgresModule as any).default ?? postgresModule
const client = postgres(process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  const insertedTracks = await db
    .insert(tracks)
    .values([{
      slug: 'backend',
      name: 'Backend Engineering',
      description: 'Verify production backend systems through real GitHub repositories.',
    }])
    .onConflictDoNothing()
    .returning()

  const backendTrack = insertedTracks[0]
    ?? (await db.select().from(tracks).where(eq(tracks.slug, 'backend')).limit(1))[0]

  await db
    .insert(skills)
    .values([
      { trackId: backendTrack.id, name: 'API Design', category: 'API Design' },
      { trackId: backendTrack.id, name: 'Authentication', category: 'Authentication' },
      { trackId: backendTrack.id, name: 'Database Design', category: 'Database Design' },
      { trackId: backendTrack.id, name: 'Testing', category: 'Testing' },
      { trackId: backendTrack.id, name: 'Documentation', category: 'Documentation' },
      { trackId: backendTrack.id, name: 'Deployment', category: 'Deployment' },
      { trackId: backendTrack.id, name: 'Code Architecture', category: 'Code Architecture' },
    ])
    .onConflictDoNothing()

  await db.update(projectChallenges).set({ isActive: false })

  const challenge = {
    trackId: backendTrack.id,
    title: 'Build a Production REST API',
    description: `## Build a Production REST API
      Submit any backend repository that demonstrates production REST API engineering.
      Accepted examples include inventory APIs, booking APIs, CRM backends, auth services, and internal tools APIs. The repository must show a complete backend system with API routes, authentication, persistence, tests, documentation, and deployment evidence.`,
    projectType: 'backend' as const,
    difficulty: 'advanced' as const,
    rubric: {
      categories: [
        { name: 'API Design', weight: 20, floor: 5 },
        { name: 'Authentication', weight: 15, floor: 5 },
        { name: 'Database Design', weight: 20, floor: 5 },
        { name: 'Testing', weight: 20, floor: 5 },
        { name: 'Documentation', weight: 10, floor: 3 },
        { name: 'Deployment', weight: 15, floor: 3 },
      ],
    },
    passingThreshold: 70,
    version: 1,
    isActive: true,
  }

  const existingChallenge = await db
    .select()
    .from(projectChallenges)
    .where(eq(projectChallenges.title, challenge.title))
    .limit(1)

  if (existingChallenge[0]) {
    await db
      .update(projectChallenges)
      .set(challenge)
      .where(eq(projectChallenges.id, existingChallenge[0].id))
  } else {
    await db.insert(projectChallenges).values([challenge])
  }

  const insertedFrontendTracks = await db
    .insert(tracks)
    .values([{
      slug: 'frontend',
      name: 'Frontend Engineering',
      description: 'Verify production frontend applications through real GitHub repositories.',
    }])
    .onConflictDoNothing()
    .returning()

  const frontendTrack = insertedFrontendTracks[0]
    ?? (await db.select().from(tracks).where(eq(tracks.slug, 'frontend')).limit(1))[0]

  await db
    .insert(skills)
    .values([
      { trackId: frontendTrack.id, name: 'Component Architecture', category: 'Component Architecture' },
      { trackId: frontendTrack.id, name: 'State Management', category: 'State Management' },
      { trackId: frontendTrack.id, name: 'Accessibility', category: 'Accessibility' },
      { trackId: frontendTrack.id, name: 'Styling', category: 'Styling' },
      { trackId: frontendTrack.id, name: 'Frontend Performance', category: 'Performance' },
      { trackId: frontendTrack.id, name: 'Frontend Testing', category: 'Testing' },
    ])
    .onConflictDoNothing()

  const frontendChallenge = {
    trackId: frontendTrack.id,
    title: 'Build a Production Frontend App',
    description: `## Build a Production Frontend App\nSubmit any React or Next.js repository that demonstrates production frontend engineering.\nAccepted examples include dashboards, SaaS UIs, portfolio sites, e-commerce frontends, and internal tools. The repository must show a complete frontend with component architecture, state management, styling, accessibility, performance awareness, and tests.`,
    projectType: 'frontend' as const,
    difficulty: 'advanced' as const,
    rubric: {
      categories: [
        { name: 'Component Architecture', weight: 25, floor: 5 },
        { name: 'State Management', weight: 20, floor: 3 },
        { name: 'Accessibility', weight: 15, floor: 3 },
        { name: 'Styling', weight: 15, floor: 3 },
        { name: 'Performance', weight: 10, floor: 3 },
        { name: 'Frontend Testing', weight: 15, floor: 5 },
      ],
    },
    passingThreshold: 70,
    version: 1,
    isActive: true,
  }

  const existingFrontend = await db
    .select()
    .from(projectChallenges)
    .where(eq(projectChallenges.title, frontendChallenge.title))
    .limit(1)

  if (existingFrontend[0]) {
    await db.update(projectChallenges).set(frontendChallenge).where(eq(projectChallenges.id, existingFrontend[0].id))
  } else {
    await db.insert(projectChallenges).values([frontendChallenge])
  }

  // ── Easy backend challenge ───────────────────────────────────────────────────
  const easyBackendChallenge = {
    trackId: backendTrack.id,
    difficulty: 'beginner' as const,
    title: 'Build a Basic CRUD API',
    description: `## Build a Basic CRUD API

Submit any backend repository that exposes a working CRUD API — no need for production-grade auth, test suites, or deployment pipelines. This challenge is designed for real projects that are earlier-stage or side projects.

Accepted examples include note-taking APIs, task managers, blog backends, contact list APIs, inventory managers, or any project with clear REST routes and a real database. You need working endpoints, a database, and a README — that is enough to pass.`,
    projectType: 'backend' as const,
    rubric: {
      categories: [
        // Architecture: just needs some folder structure — floor 0 means any score passes
        { name: 'Code Architecture', weight: 25, floor: 0 },
        // Authentication: floor 0 — auth is optional for a basic CRUD project
        { name: 'Authentication', weight: 10, floor: 0 },
        // Database Design: floor 3 — needs an ORM or schema file at minimum
        { name: 'Database Design', weight: 30, floor: 3 },
        // Testing: floor 0 — not required for an easy challenge
        { name: 'Testing', weight: 10, floor: 0 },
        // Documentation: floor 2 — just needs a README
        { name: 'Documentation', weight: 15, floor: 2 },
        // API Design: floor 0
        { name: 'API Design', weight: 10, floor: 0 },
      ],
    },
    passingThreshold: 50,
    version: 1,
    isActive: true,
  }

  const existingEasyBackend = await db
    .select()
    .from(projectChallenges)
    .where(eq(projectChallenges.title, easyBackendChallenge.title))
    .limit(1)

  if (existingEasyBackend[0]) {
    await db.update(projectChallenges).set(easyBackendChallenge).where(eq(projectChallenges.id, existingEasyBackend[0].id))
  } else {
    await db.insert(projectChallenges).values([easyBackendChallenge])
  }

  // ── Easy frontend challenge ──────────────────────────────────────────────────
  const easyFrontendChallenge = {
    trackId: frontendTrack.id,
    difficulty: 'beginner' as const,
    title: 'Build a React App',
    description: `## Build a React App

Submit any React or Next.js application — a portfolio, dashboard, landing page, side project, or personal tool. This challenge does not require a test suite, accessibility tooling, or performance optimizations. It is designed for real projects you have actually built and shipped.

Accepted examples include portfolio sites, landing pages, CRUD frontends, admin dashboards, personal tools, and e-commerce UIs. You need real component structure, some styling, and a README — that is enough to pass.`,
    projectType: 'frontend' as const,
    rubric: {
      categories: [
        // Component Architecture: floor 0 — just needs component files (.tsx/.jsx)
        { name: 'Component Architecture', weight: 35, floor: 3 },
        // Styling: floor 0 — any CSS or styling library passes
        { name: 'Styling', weight: 25, floor: 0 },
        // State Management: floor 0 — useState counts
        { name: 'State Management', weight: 20, floor: 0 },
        // Documentation: floor 2 — just needs a README
        { name: 'Documentation', weight: 10, floor: 2 },
        // Accessibility: floor 0 — baseline 2pts always given
        { name: 'Accessibility', weight: 10, floor: 0 },
      ],
    },
    passingThreshold: 50,
    version: 1,
    isActive: true,
  }

  const existingEasyFrontend = await db
    .select()
    .from(projectChallenges)
    .where(eq(projectChallenges.title, easyFrontendChallenge.title))
    .limit(1)

  if (existingEasyFrontend[0]) {
    await db.update(projectChallenges).set(easyFrontendChallenge).where(eq(projectChallenges.id, existingEasyFrontend[0].id))
  } else {
    await db.insert(projectChallenges).values([easyFrontendChallenge])
  }

  console.log('Seed complete')
  await client.end()
}

seed().catch(console.error)
