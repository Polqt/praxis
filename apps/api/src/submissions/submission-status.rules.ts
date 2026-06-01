import type { SubmissionStatus } from '@praxis/shared'

const terminalStatuses = new Set<SubmissionStatus>([
  'verified',
  'insufficient',
  'failed',
  'expired',
])

const allowedTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  created: ['queued', 'expired'],
  queued: ['ingesting', 'expired'],
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
  verified: [],
  insufficient: [],
  failed: [],
  expired: [],
}

export function isTerminalSubmissionStatus(status: SubmissionStatus) {
  return terminalStatuses.has(status)
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus) {
  if (from === to) return true
  if (isTerminalSubmissionStatus(from)) return false
  return allowedTransitions[from]?.includes(to) ?? false
}
