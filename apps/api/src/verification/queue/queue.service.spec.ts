import * as assert from 'node:assert/strict'
import { VERIFICATION_JOB_NAMES, VERIFICATION_QUEUE_NAME } from './queue.constants'
import { VerificationQueueService } from './queue.service'

const added: Array<{ name: string; payload: unknown; options: unknown }> = []
const queue = {
  add: (name: string, payload: unknown, options: unknown) => {
    added.push({ name, payload, options })
    return Promise.resolve()
  },
}

void (async () => {
  const service = new VerificationQueueService(queue as never)
  await service.enqueueIngestRepo('sub_123')
  assert.equal(VERIFICATION_QUEUE_NAME, 'verification')
  assert.equal(added[0].name, VERIFICATION_JOB_NAMES.ingestRepo)
  assert.deepEqual(added[0].payload, { submissionId: 'sub_123' })
  assert.deepEqual(Object.keys(added[0].payload as Record<string, unknown>), ['submissionId'])
  assert.equal((added[0].options as { attempts: number }).attempts, 3)
  assert.deepEqual((added[0].options as { backoff: { type: string; delay: number } }).backoff, {
    type: 'exponential',
    delay: 10_000,
  })

  await service.enqueueReEnrichReport('report_123')
  assert.equal(added[1].name, VERIFICATION_JOB_NAMES.reEnrichReport)
  assert.equal((added[1].options as { attempts: number }).attempts, 5)
  assert.deepEqual((added[1].options as { backoff: { type: string; delay: number } }).backoff, {
    type: 'fixed',
    delay: 30 * 60 * 1000,
  })
})()
