import type { SubmissionStatus } from '@praxis/shared'

/** Typed constant map for all submission statuses — avoids raw string comparisons. */
export const SUBMISSION_STATUS = {
  created: 'created',
  queued: 'queued',
  ingesting: 'ingesting',
  ingestionFailed: 'ingestion_failed',
  analyzing: 'analyzing',
  analysisFailed: 'analysis_failed',
  generatingReport: 'generating_report',
  reportGenerationFailed: 'report_generation_failed',
  verified: 'verified',
  insufficient: 'insufficient',
  failed: 'failed',
  expired: 'expired',
  cancelled: 'cancelled',
} as const satisfies Record<string, SubmissionStatus>

export const IN_PROGRESS_STATUSES: SubmissionStatus[] = [
  'created', 'queued', 'ingesting', 'analyzing', 'generating_report',
]

export const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend Engineering',
  backend: 'Backend Engineering',
}

export interface PipelineStage {
  key: string
  label: string
  toStatus: SubmissionStatus | null
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: 'created',           label: 'Submission created',  toStatus: null },
  { key: 'queued',            label: 'Queued',              toStatus: 'queued' },
  { key: 'ingesting',         label: 'Ingesting repo',      toStatus: 'ingesting' },
  { key: 'analyzing',         label: 'Analyzing signals',   toStatus: 'analyzing' },
  { key: 'generating_report', label: 'Generating report',   toStatus: 'generating_report' },
]

export const PIPELINE_STAGE_DESCRIPTIONS: Partial<Record<string, string>> = {
  created:           'Your submission is queued for processing.',
  queued:            'Waiting for an available worker…',
  ingesting:         'Cloning repository and reading files…',
  analyzing:         'Extracting code signals with E2B sandbox…',
  generating_report: 'Scoring rubric categories and writing report…',
}

export const TERMINAL_STAGE_LABELS: Partial<Record<SubmissionStatus, string>> = {
  verified:     'Verified',
  insufficient: 'Insufficient',
  failed:       'Failed',
  expired:      'Expired',
  cancelled:    'Cancelled',
}

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  'verified', 'insufficient', 'failed', 'expired', 'cancelled',
  'ingestion_failed', 'analysis_failed', 'report_generation_failed',
]

// Statuses that indicate a verification error or incomplete result
export const FAILED_STATUSES: SubmissionStatus[] = [
  'failed', 'insufficient', 'ingestion_failed', 'analysis_failed', 'report_generation_failed',
]

export const STAGE_DESCRIPTION: Partial<Record<SubmissionStatus, string>> = {
  created:           'Queuing your submission…',
  queued:            'Waiting in queue…',
  ingesting:         'Reading your repository files…',
  analyzing:         'Extracting code signals…',
  generating_report: 'Scoring and writing your report…',
}
