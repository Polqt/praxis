import 'dotenv/config'
import postgres from 'postgres'
import { randomBytes } from 'node:crypto'

const SUBMISSION_ID = process.argv[2] ?? 'kd8yl4bb6ov4xwb7pr6c10k9'
const sql = postgres(process.env.DATABASE_DIRECT_URL, { max: 1, connect_timeout: 20 })

async function main() {
  const token = randomBytes(24).toString('base64url')
  const updated = await sql.unsafe(`
    UPDATE project_verification_reports
    SET is_public = true, public_token = '${token}'
    WHERE submission_id = '${SUBMISSION_ID}'
    RETURNING id, public_token, is_public
  `)
  if (updated[0]) {
    console.log('Published report:', updated[0].id)
    console.log('Public token:', updated[0].public_token)
    console.log('Proof URL: http://localhost:3000/proof/' + updated[0].public_token)

    // Insert audit log
    await sql.unsafe(`
      INSERT INTO audit_logs (event_type, metadata)
      VALUES ('report_published', '{"reportId": "${updated[0].id}"}')
    `)
    console.log('Audit log inserted: report_published')
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1 }).finally(() => sql.end())
