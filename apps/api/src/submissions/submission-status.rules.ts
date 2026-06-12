import type { SubmissionStatus } from '@praxis/shared'

// ingestion_failed, analysis_failed, report_generation_failed are intentionally
// NOT in this set — they are retryable intermediate failures, not final outcomes.
// A user or the retry endpoint can transition them back to 'queued'.
const terminalStatuses = new Set<SubmissionStatus>([
  'verified',
  'insufficient',
  'failed',
  'expired',
  'cancelled',
])

const allowedTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  created: ['queued', 'expired', 'cancelled'],
  queued: ['ingesting', 'expired', 'cancelled'],
  ingesting: ['analyzing', 'ingestion_failed', 'expired'],
  ingestion_failed: ['queued', 'failed', 'expired'],
  analyzing: ['generating_report', 'analysis_failed', 'expired'],
  analysis_failed: ['queued', 'failed', 'expired'],
  generating_report: [
    'verified',
    'insufficient',
    'failed',
    'report_generation_failed',
    'expired',
  ],
  report_generation_failed: ['queued', 'failed', 'expired'],
  // Terminal statuses only allow re-queue for user-initiated retry/resubmit flows
  verified: [],
  insufficient: ['queued'],
  failed: ['queued'],
  expired: ['queued'],
  cancelled: ['queued'],
}

export function isTerminalSubmissionStatus(status: SubmissionStatus) {
  return terminalStatuses.has(status)
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus) {
  if (from === to) return true
  return allowedTransitions[from]?.includes(to) ?? false
}
