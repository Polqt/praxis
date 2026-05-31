import * as assert from 'node:assert/strict'
import { ChallengesService } from './challenges.service'

const calls: string[] = []
const db = {
  db: {
    select: () => {
      calls.push('select')
      return {
        from: () => ({
          where: () => ({
            orderBy: () => Promise.resolve([]),
            limit: () => Promise.resolve([]),
          }),
        }),
      }
    },
  },
}

const service = new ChallengesService(db as never)
void service.listActive().then(() => {
  assert.deepEqual(calls, ['select'])
})
