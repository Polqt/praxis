import 'dotenv/config'
import { Queue } from 'bullmq'

const queue = new Queue('verification', {
  connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
})

async function main() {
  const counts = await queue.getJobCounts('waiting', 'active', 'failed', 'completed', 'delayed')
  console.log('Queue counts:', JSON.stringify(counts))

  const waiting = await queue.getWaiting(0, 20)
  const active = await queue.getActive(0, 20)
  const failed = await queue.getFailed(0, 10)

  console.log('Waiting:', waiting.map(j => ({ id: j.id, name: j.name, data: j.data })))
  console.log('Active:', active.map(j => ({ id: j.id, name: j.name })))
  console.log('Failed:', failed.map(j => ({ id: j.id, name: j.name, reason: j.failedReason?.slice(0, 100) })))

  await queue.close()
}

main().catch(e => { console.error(e.message); process.exitCode = 1 })
