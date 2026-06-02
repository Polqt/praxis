import 'dotenv/config'
import postgres from 'postgres'

const SUBMISSION_ID = process.argv[2] ?? 'kd8yl4bb6ov4xwb7pr6c10k9'
const sql = postgres(process.env.DATABASE_DIRECT_URL, { max: 1, connect_timeout: 20 })

async function main() {
  const reports = await sql.unsafe(`
    SELECT id, submission_id, composite_score, verdict,
           category_scores, public_summary,
           analyzer_version, scoring_version, report_generator_version,
           rubric_version, is_public, public_token, generated_at
    FROM project_verification_reports
    WHERE submission_id = '${SUBMISSION_ID}'
    LIMIT 1
  `)

  if (!reports[0]) {
    console.log('No report found for submission', SUBMISSION_ID)
    return
  }

  const r = reports[0]
  console.log('=== REPORT ===')
  console.log('Verdict:', r.verdict)
  console.log('Composite score:', r.composite_score)
  console.log('Analyzer version:', r.analyzer_version)
  console.log('Scoring version:', r.scoring_version)
  console.log('Report generator version:', r.report_generator_version)
  console.log('Rubric version:', r.rubric_version)
  console.log()

  const scores = r.category_scores
  for (const [cat, data] of Object.entries(scores)) {
    console.log(`--- ${cat} ---`)
    console.log('Score:', data.score)
    console.log('Narrative:', data.narrative)
    console.log('Citations:', JSON.stringify(data.citations))
    console.log()
  }

  // Check repository_ingestions
  const ingestion = await sql.unsafe(`
    SELECT id, repo_full_name, commit_sha, created_at,
           jsonb_array_length(ingested_data->'files') as file_count
    FROM repository_ingestions
    WHERE repo_full_name = 'Polqt/tallyx'
    ORDER BY created_at DESC LIMIT 1
  `)
  console.log('=== INGESTION ===')
  console.log(JSON.stringify(ingestion[0]))

  // Audit events for this submission
  const audits = await sql.unsafe(`
    SELECT event_type, metadata, created_at FROM audit_logs
    WHERE metadata->>'submissionId' = '${SUBMISSION_ID}'
       OR metadata->>'reportId' IN (SELECT id::text FROM project_verification_reports WHERE submission_id = '${SUBMISSION_ID}')
    ORDER BY created_at
  `)
  console.log('=== AUDIT EVENTS ===')
  for (const a of audits) {
    console.log(a.event_type, JSON.stringify(a.metadata))
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1 }).finally(() => sql.end())
