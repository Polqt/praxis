import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_DIRECT_URL, { max: 1, connect_timeout: 20 })

async function main() {
  await sql.unsafe(`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`)
  console.log('RLS enabled on audit_logs')
  await sql.end()
}

main().catch(e => { console.error(e.message); process.exitCode = 1; sql.end() })
