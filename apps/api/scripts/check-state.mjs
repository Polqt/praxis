import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_DIRECT_URL, { max: 1, connect_timeout: 20 })

async function main() {
  const users = await sql.unsafe(`SELECT id, email, username FROM users ORDER BY created_at DESC LIMIT 5`)
  console.log('Users:', JSON.stringify(users))

  const challenges = await sql.unsafe(`SELECT id, title FROM project_challenges WHERE is_active = true LIMIT 5`)
  console.log('Active challenges:', JSON.stringify(challenges))

  const subs = await sql.unsafe(`SELECT id, status, github_repo_full_name, commit_sha FROM project_submissions ORDER BY submitted_at DESC LIMIT 3`)
  console.log('Recent submissions:', JSON.stringify(subs))

  const auditRecent = await sql.unsafe(`SELECT event_type, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5`)
  console.log('Recent audit events:', JSON.stringify(auditRecent))
}

main().catch(e => { console.error(e.message); process.exitCode = 1 }).finally(() => sql.end())
