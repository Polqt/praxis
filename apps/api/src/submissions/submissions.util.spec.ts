import * as assert from 'node:assert/strict'
import { parseRepoFullName } from './submissions.util'

assert.deepEqual(parseRepoFullName('openai/codex'), { owner: 'openai', repo: 'codex' })
assert.throws(() => parseRepoFullName('openai'), /owner\/repo/)
assert.throws(() => parseRepoFullName('openai/codex/extra'), /owner\/repo/)
