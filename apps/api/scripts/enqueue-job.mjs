import 'dotenv/config'
import { Queue } from 'bullmq'

const JOB_NAME = process.argv[2]
const SUBMISSION_ID = process.argv[3]

if (!JOB_NAME || !SUBMISSION_ID) {
  console.error('Usage: node enqueue-job.mjs <job-name> <submissionId>')
  console.error('Job names: ingest-repo, analyze-project, generate-report, award-skills')
  process.exit(1)
}

const queue = new Queue('verification', {
  connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
})

async function main() {
  const job = await queue.add(JOB_NAME, { submissionId: SUBMISSION_ID }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  })
  console.log(`Enqueued ${JOB_NAME} job ${job.id} for submission ${SUBMISSION_ID}`)
  await queue.close()
}

main().catch(e => { console.error(e.message); process.exitCode = 1 })
