import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as postgresModule from 'postgres'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postgres = (postgresModule as any).default ?? postgresModule

const V1_TABLES = [
  'users',
  'tracks',
  'skills',
  'user_skills',
  'project_challenges',
  'github_accounts',
  'project_submissions',
  'project_submission_events',
  'project_verification_reports',
  'repository_ingestions',
  'repository_analyses',
  'audit_logs',
]

const EXPECTED_MIGRATIONS = [
  '0001_baseline',
  '0002_drop_v0_deprecated',
  '0003_v1_schema',
  '0004_submission_events_and_users_rls',
  '0005_repository_ingestions_and_analyses',
  '0006_username_unique_constraint',
  '0007_report_version_fields',
  '0008_audit_logs',
  '0009_enum_cleanup',
  '0010_submissions_drop_ingested_data',
  '0011_reports_version_fields',
]

interface CheckResult {
  name: string
  pass: boolean
  detail: string
}

async function main() {
  const dbUrl = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_DIRECT_URL or DATABASE_URL is required')
    process.exitCode = 1
    return
  }

  const sql = postgres(dbUrl, { max: 1 })
  const results: CheckResult[] = []

  try {
    // Check V1 tables exist
    const existingTables = await sql.unsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `)
    const existingSet = new Set(existingTables.map((r: { table_name: string }) => r.table_name))
    for (const table of V1_TABLES) {
      results.push({
        name: `table:${table}`,
        pass: existingSet.has(table),
        detail: existingSet.has(table) ? 'exists' : 'MISSING',
      })
    }

    // Check RLS enabled
    const rlsRows = await sql.unsafe(`
      SELECT relname, relrowsecurity FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE nspname = 'public' AND relkind = 'r' AND relname = ANY($1)
    `, [V1_TABLES])
    for (const row of rlsRows as { relname: string; relrowsecurity: boolean }[]) {
      results.push({
        name: `rls:${row.relname}`,
        pass: row.relrowsecurity,
        detail: row.relrowsecurity ? 'enabled' : 'DISABLED',
      })
    }

    // Check migrations applied
    const appliedMigrations = await sql.unsafe(`
      SELECT name FROM drizzle.__drizzle_migrations ORDER BY created_at
    `).catch(() => []) as { name: string }[]
    const appliedSet = new Set(appliedMigrations.map((r) => r.name))
    for (const migration of EXPECTED_MIGRATIONS) {
      results.push({
        name: `migration:${migration}`,
        pass: appliedSet.has(migration),
        detail: appliedSet.has(migration) ? 'applied' : 'NOT APPLIED',
      })
    }

    // Check username unique index exists
    const usernameIdx = await sql.unsafe(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'users_username_unique'
    `)
    results.push({
      name: 'index:users_username_unique',
      pass: usernameIdx.length > 0,
      detail: usernameIdx.length > 0 ? 'exists' : 'MISSING',
    })

    // Check ingested_data column is dropped from project_submissions
    const ingestedDataCol = await sql.unsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'project_submissions' AND column_name = 'ingested_data'
    `)
    results.push({
      name: 'column:project_submissions.ingested_data_dropped',
      pass: ingestedDataCol.length === 0,
      detail: ingestedDataCol.length === 0 ? 'dropped' : 'STILL EXISTS',
    })

    // Check ai_model_version column is dropped from project_verification_reports
    const aiModelCol = await sql.unsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'project_verification_reports' AND column_name = 'ai_model_version'
    `)
    results.push({
      name: 'column:project_verification_reports.ai_model_version_dropped',
      pass: aiModelCol.length === 0,
      detail: aiModelCol.length === 0 ? 'dropped' : 'STILL EXISTS',
    })

  } finally {
    await sql.end()
  }

  const passed = results.filter((r) => r.pass)
  const failed = results.filter((r) => !r.pass)
  const date = new Date().toISOString()

  const lines = [
    `# DB Audit Report`,
    ``,
    `**Date:** ${date}`,
    `**Database:** ${process.env.DATABASE_DIRECT_URL ? 'direct' : 'pooled'}`,
    ``,
    `## Results`,
    ``,
    `| Check | Status | Detail |`,
    `|-------|--------|--------|`,
    ...results.map((r) => `| ${r.name} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.detail} |`),
    ``,
    `## Summary`,
    ``,
    `- Passed: ${passed.length}`,
    `- Failed: ${failed.length}`,
    ``,
  ]

  if (failed.length > 0) {
    lines.push(`## Gaps`, ``)
    for (const f of failed) {
      lines.push(`- **${f.name}**: ${f.detail}`)
    }
    lines.push(``)
  }

  const output = lines.join('\n')
  const outPath = path.join(process.cwd(), 'docs', 'DB_AUDIT.md')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, output)

  console.log(output)

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`)
    process.exitCode = 1
  } else {
    console.log('All checks passed.')
  }
}

main().catch((error: unknown) => {
  console.error((error as Error).message)
  process.exitCode = 1
})
