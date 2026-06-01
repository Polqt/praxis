import * as assert from 'node:assert/strict'
import type { SubmissionStatus } from '@praxis/shared'

// Terminal statuses that must never be expired — mirror the service constant
const TERMINAL_STATUSES: SubmissionStatus[] = [
  'verified',
  'insufficient',
  'failed',
  'expired',
  'ingestion_failed',
  'analysis_failed',
  'report_generation_failed',
]

function isTerminal(status: SubmissionStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

function isStale(submittedAt: Date, expiryHours: number): boolean {
  const cutoff = new Date(Date.now() - expiryHours * 60 * 60 * 1000)
  return submittedAt < cutoff
}

function shouldExpire(status: SubmissionStatus, submittedAt: Date, expiryHours: number): boolean {
  return !isTerminal(status) && isStale(submittedAt, expiryHours)
}

// Test 1: analyzing submission older than 7h with 6h threshold → should expire
const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000)
assert.equal(shouldExpire('analyzing', sevenHoursAgo, 6), true,
  'analyzing submission 7h old should be expired with 6h threshold')

// Test 2: verified submission 24h old → must never expire (terminal)
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
assert.equal(shouldExpire('verified', twentyFourHoursAgo, 6), false,
  'verified submission must never be expired regardless of age')

// Test 3: queued submission 5h old with 6h threshold → not stale yet
const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000)
assert.equal(shouldExpire('queued', fiveHoursAgo, 6), false,
  'queued submission 5h old is within 6h threshold and must not expire')

// Verify all terminal statuses are protected
for (const status of TERMINAL_STATUSES) {
  assert.equal(isTerminal(status as SubmissionStatus), true,
    `${status} must be recognized as terminal`)
  assert.equal(shouldExpire(status as SubmissionStatus, twentyFourHoursAgo, 6), false,
    `${status} must never be selected for expiry`)
}

// Non-terminal statuses are eligible for expiry when old enough
const nonTerminalStatuses: SubmissionStatus[] = ['created', 'queued', 'ingesting', 'analyzing', 'generating_report']
for (const status of nonTerminalStatuses) {
  assert.equal(shouldExpire(status, sevenHoursAgo, 6), true,
    `${status} 7h old must be eligible for expiry`)
}
