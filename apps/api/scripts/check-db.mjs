import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_DIRECT_URL, { max: 1, connect_timeout: 20 })

async function main() {
  const cols = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='drizzle' AND table_name='__drizzle_migrations'`)
  console.log('Migration table columns:', cols.map(r => r.column_name).join(', '))

  const rows = await sql.unsafe(`SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`)
  console.log('Applied migrations count:', rows.length)

  const col = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='ingested_data'`)
  console.log('ingested_data column exists:', col.length > 0)

  const col2 = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_name='project_verification_reports' AND column_name='ai_model_version'`)
  console.log('ai_model_version column exists:', col2.length > 0)

  const enumVals = await sql.unsafe(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid=pg_enum.enumtypid WHERE pg_type.typname='submission_status' ORDER BY enumsortorder`)
  console.log('submission_status values:', enumVals.map(r => r.enumlabel).join(', '))

  const tables = await sql.unsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`)
  console.log('Public tables:', tables.map(r => r.table_name).join(', '))

  // Check report_generator_version column
  const col3 = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_name='project_verification_reports' AND column_name='report_generator_version'`)
  console.log('report_generator_version column exists:', col3.length > 0)

  // Check enum values for verdict
  const verdictVals = await sql.unsafe(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid=pg_enum.enumtypid WHERE pg_type.typname='verdict' ORDER BY enumsortorder`)
  console.log('verdict values:', verdictVals.map(r => r.enumlabel).join(', '))
}

main().catch(e => { console.error(e.message); process.exitCode = 1 }).finally(() => sql.end())
