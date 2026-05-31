import * as assert from 'node:assert/strict'
import { canTransition, isTerminalSubmissionStatus } from './submission-status.rules'

assert.equal(canTransition('created', 'queued'), true)
assert.equal(canTransition('queued', 'ingesting'), true)
assert.equal(canTransition('ingesting', 'analyzing'), true)
assert.equal(canTransition('analyzing', 'generating_report'), true)
assert.equal(canTransition('generating_report', 'verified'), true)
assert.equal(canTransition('generating_report', 'insufficient'), true)
assert.equal(canTransition('verified', 'analyzing'), false)
assert.equal(canTransition('created', 'verified'), false)
assert.equal(canTransition('analyzing', 'expired'), true)
assert.equal(isTerminalSubmissionStatus('verified'), true)
assert.equal(isTerminalSubmissionStatus('insufficient'), true)
assert.equal(isTerminalSubmissionStatus('failed'), true)
assert.equal(isTerminalSubmissionStatus('expired'), true)
assert.equal(isTerminalSubmissionStatus('analyzing'), false)
