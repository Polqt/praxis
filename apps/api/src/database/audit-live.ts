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

  const sql = postgres(dbUrl, { max: 1, connect_timeout: 20 })
  const results: CheckResult[] = []

  try {
    // 1. Check V1 tables exist
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

    // 2. Check RLS enabled
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

    // 3. Check schema state directly (replaces migration hash tracking which Drizzle doesn't populate for manually-applied migrations)
    const schemaChecks: { name: string; query: string; expectEmpty: boolean; description: string }[] = [
      {
        name: 'schema:ingested_data_dropped',
        query: `SELECT column_name FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='ingested_data'`,
        expectEmpty: true,
        description: 'ingested_data column dropped from project_submissions',
      },
      {
        name: 'schema:ai_model_version_dropped',
        query: `SELECT column_name FROM information_schema.columns WHERE table_name='project_verification_reports' AND column_name='ai_model_version'`,
        expectEmpty: true,
        description: 'ai_model_version column dropped from project_verification_reports',
      },
      {
        name: 'schema:report_generator_version_exists',
        query: `SELECT column_name FROM information_schema.columns WHERE table_name='project_verification_reports' AND column_name='report_generator_version'`,
        expectEmpty: false,
        description: 'report_generator_version column present in project_verification_reports',
      },
      {
        name: 'schema:analyzer_version_exists',
        query: `SELECT column_name FROM information_schema.columns WHERE table_name='project_verification_reports' AND column_name='analyzer_version'`,
        expectEmpty: false,
        description: 'analyzer_version column present in project_verification_reports',
      },
      {
        name: 'schema:audit_logs_exists',
        query: `SELECT table_name FROM information_schema.tables WHERE table_name='audit_logs'`,
        expectEmpty: false,
        description: 'audit_logs table exists',
      },
    ]
    for (const check of schemaChecks) {
      const rows = await sql.unsafe(check.query)
      const pass = check.expectEmpty ? rows.length === 0 : rows.length > 0
      results.push({ name: check.name, pass, detail: pass ? check.description : `FAILED: ${check.description}` })
    }

    // 4. Enum value checks
    const submissionStatusVals = await sql.unsafe(`
      SELECT enumlabel FROM pg_enum
      JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
      WHERE pg_type.typname = 'submission_status' ORDER BY enumsortorder
    `)
    const statusValues = submissionStatusVals.map((r: { enumlabel: string }) => r.enumlabel)
    results.push({
      name: 'enum:submission_status_no_awaiting_human_review',
      pass: !statusValues.includes('awaiting_human_review'),
      detail: !statusValues.includes('awaiting_human_review')
        ? `Values: ${statusValues.join(', ')}`
        : 'awaiting_human_review STILL PRESENT',
    })

    const verdictVals = await sql.unsafe(`
      SELECT enumlabel FROM pg_enum
      JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
      WHERE pg_type.typname = 'verdict' ORDER BY enumsortorder
    `)
    const verdictValues = verdictVals.map((r: { enumlabel: string }) => r.enumlabel)
    results.push({
      name: 'enum:verdict_no_conditional',
      pass: !verdictValues.includes('conditional'),
      detail: !verdictValues.includes('conditional')
        ? `Values: ${verdictValues.join(', ')}`
        : 'conditional STILL PRESENT',
    })

    // 5. Check username unique index
    const usernameIdx = await sql.unsafe(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'users_username_unique'
    `)
    results.push({
      name: 'index:users_username_unique',
      pass: usernameIdx.length > 0,
      detail: usernameIdx.length > 0 ? 'exists' : 'MISSING',
    })

    // 6. Service-role insert test on audit_logs
    try {
      await sql.unsafe(`INSERT INTO audit_logs (event_type) VALUES ('audit_test')`)
      await sql.unsafe(`DELETE FROM audit_logs WHERE event_type = 'audit_test'`)
      results.push({ name: 'access:service_role_audit_insert', pass: true, detail: 'INSERT + DELETE on audit_logs succeeded' })
    } catch (err) {
      results.push({ name: 'access:service_role_audit_insert', pass: false, detail: `Failed: ${(err as Error).message}` })
    }

    // 7. Count applied migration hashes (informational)
    const migrationCount = await sql.unsafe(`SELECT COUNT(*) as cnt FROM drizzle.__drizzle_migrations`).catch(() => [{ cnt: 'unknown' }])
    const cnt = (migrationCount[0] as { cnt: string | number }).cnt
    results.push({
      name: 'info:drizzle_migration_hashes',
      pass: true,
      detail: `${cnt} hash(es) tracked in drizzle.__drizzle_migrations (migrations 0009-0011 were applied directly, not via drizzle-kit)`,
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
    `**Database:** ${process.env.DATABASE_DIRECT_URL ? 'Supabase direct (port 5432)' : 'pooled'}`,
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
