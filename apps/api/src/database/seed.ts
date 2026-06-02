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

  console.log('Seed complete')
  await client.end()
}

seed().catch(console.error)
