import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as postgresModule from 'postgres'
import { tracks, skills, projectChallenges } from './schema'

const postgres = (postgresModule as any).default ?? postgresModule
const client = postgres(process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  // Track
  const insertedTracks = await db
    .insert(tracks)
    .values([{
      slug: 'backend',
      name: 'Backend Engineering',
      description: 'Verify real-world backend systems — APIs, auth, databases, and deployment.',
    }])
    .onConflictDoNothing()
    .returning()

  const backendTrack = insertedTracks[0]
    ?? (await db.select().from(tracks).limit(1))[0]

  // Skills
  await db
    .insert(skills)
    .values([
      { trackId: backendTrack.id, name: 'REST API Design',               category: 'API' },
      { trackId: backendTrack.id, name: 'Authentication & Authorization', category: 'Security' },
      { trackId: backendTrack.id, name: 'Database Design',               category: 'Data' },
      { trackId: backendTrack.id, name: 'Testing',                       category: 'Quality' },
      { trackId: backendTrack.id, name: 'Security Fundamentals',         category: 'Security' },
      { trackId: backendTrack.id, name: 'Deployment & CI/CD',            category: 'Operations' },
    ])
    .onConflictDoNothing()

  // Challenge
  await db
    .insert(projectChallenges)
    .values([{
      trackId: backendTrack.id,
      title: 'Build a Production-Ready REST API',
      description: `## Build a Production-Ready REST API

Submit a backend project that demonstrates real-world engineering practices.

Your project should implement a REST API with authentication, database persistence, and meaningful test coverage. It should be deployable and demonstrate awareness of security and operational concerns.

**What we look for:**
- Clean API design with appropriate HTTP methods and status codes
- Working authentication/authorization (JWT, sessions, or OAuth)
- Database integration with migrations or schema management
- Test coverage for core functionality
- Evidence of deployment (CI/CD, Docker, cloud platform)
- Basic security practices (env vars for secrets, input validation, dependency hygiene)`,
      projectType: 'backend' as const,
      rubric: {
        categories: [
          { name: 'Code Quality',  weight: 20, floor: 4 },
          { name: 'Architecture',  weight: 20, floor: 4 },
          { name: 'Testing',       weight: 25, floor: 5 },
          { name: 'Documentation', weight: 10, floor: 0 },
          { name: 'Security',      weight: 15, floor: 5 },
          { name: 'Deployment',    weight: 10, floor: 0 },
        ],
      },
      passingThreshold: 70,
      version: 1,
      isActive: true,
    }])
    .onConflictDoNothing()

  console.log('Seed complete')
  await client.end()
}

seed().catch(console.error)
