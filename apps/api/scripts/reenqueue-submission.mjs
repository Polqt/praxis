import 'dotenv/config'
import { Queue } from 'bullmq'

const SUBMISSION_ID = process.argv[2]
if (!SUBMISSION_ID) {
  console.error('Usage: node reenqueue-submission.mjs <submissionId>')
  process.exit(1)
}

const queue = new Queue('verification', {
  connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
})

async function main() {
  const job = await queue.add('ingest-repo', { submissionId: SUBMISSION_ID }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  })
  console.log(`Enqueued job ${job.id} for submission ${SUBMISSION_ID}`)
  await queue.close()
}

main().catch(e => { console.error(e.message); process.exitCode = 1 })
