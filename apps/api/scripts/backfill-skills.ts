/**
 * One-time backfill script: re-awards skills for all verified submissions.
 *
 * Run with:
 *   pnpm --filter @praxis/api ts-node -r dotenv/config scripts/backfill-skills.ts
 *
 * Safe to run multiple times — onConflictDoNothing prevents duplicates.
 */
import 'dotenv/config'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as postgresModule from 'postgres'
import {
  projectChallenges,
  projectSubmissions,
  projectVerificationReports,
  skills,
  userSkills,
} from './schema'

const postgres = (postgresModule as any).default ?? postgresModule
const client = postgres(process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!)
const db = drizzle(client)

async function backfill() {
  console.log('Fetching all verified submissions…')

  const verifiedSubmissions = await db
    .select({
      submissionId: projectSubmissions.id,
      userId: projectSubmissions.userId,
      challengeId: projectSubmissions.challengeId,
    })
    .from(projectSubmissions)
    .where(eq(projectSubmissions.status, 'verified'))

  console.log(`Found ${verifiedSubmissions.length} verified submissions`)

  const allSkills = await db.select().from(skills)
  const skillByNameLower = new Map(allSkills.map((s) => [s.name.toLowerCase(), s]))

  let awarded = 0
  let skipped = 0

  for (const sub of verifiedSubmissions) {
    const [challenge, report] = await Promise.all([
      db.select().from(projectChallenges).where(eq(projectChallenges.id, sub.challengeId)).limit(1),
      db.select().from(projectVerificationReports)
        .where(and(
          eq(projectVerificationReports.submissionId, sub.submissionId),
          eq(projectVerificationReports.verdict, 'verified'),
        ))
        .limit(1),
    ])

    if (!challenge[0] || !report[0]) { skipped++; continue }

    const rubric = challenge[0].rubric as { categories: { name: string; floor: number }[] }
    const categoryScores = report[0].categoryScores as Record<string, { score: number }>

    const eligibleNames = rubric.categories
      .filter((cat) => (categoryScores[cat.name]?.score ?? 0) >= cat.floor)
      .map((cat) => cat.name)

    const matchedSkills = eligibleNames
      .map((name) => skillByNameLower.get(name.toLowerCase()))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)

    if (matchedSkills.length === 0) { skipped++; continue }

    const inserted = await db
      .insert(userSkills)
      .values(matchedSkills.map((skill) => ({
        userId: sub.userId,
        skillId: skill.id,
        sourceType: 'project' as const,
      })))
      .onConflictDoNothing()
      .returning()

    awarded += inserted.length
    if (inserted.length > 0) {
      console.log(`  Awarded ${inserted.length} skill(s) to user ${sub.userId} for submission ${sub.submissionId}`)
    }
  }

  console.log(`\nBackfill complete — ${awarded} skill awards inserted, ${skipped} submissions skipped`)
  await client.end()
}

backfill().catch((err) => { console.error(err); process.exit(1) })
