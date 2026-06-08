import type { SubmissionStatus } from '@praxis/shared'
import type { SubmissionFilter } from '@/features/submissions/types'

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

export const SUBMISSION_FILTERS: {
  value: SubmissionFilter
  label: string
  emptyMessage: string
}[] = [
  { value: 'all', label: 'All', emptyMessage: 'No submissions yet.' },
  {
    value: 'verified',
    label: 'Verified',
    emptyMessage: 'No verified submissions yet.',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    emptyMessage: 'No submissions in progress.',
  },
  { value: 'failed', label: 'Failed', emptyMessage: 'No failed submissions.' },
]

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

export const SUBMIT_ERRORS = {
  invalidUrl: 'Enter a valid GitHub URL — e.g. https://github.com/owner/repo',
  invalidSha:
    'Commit SHA must be a 7–40 character hex string (e.g. a1b2c3d). Leave blank to use the latest commit.',
  rateLimit:
    'Submission limit reached. Please wait a few minutes before submitting again.',
  repoNotFound:
    'Repository not found. Make sure it exists and you have access to it.',
  forbidden:
    'You must own or have write access to submit this repository.',
  duplicate:
    "You've already submitted this exact commit. Try a different commit SHA or repository.",
  generic: 'Something went wrong. Please try again.',
} as const

export const SUBMIT_ERROR_BY_STATUS: Partial<Record<number, string>> = {
  429: SUBMIT_ERRORS.rateLimit,
  404: SUBMIT_ERRORS.repoNotFound,
  403: SUBMIT_ERRORS.forbidden,
  409: SUBMIT_ERRORS.duplicate,
}

export const SUBMISSION_STATUS_TOOLTIP: Partial<
  Record<SubmissionStatus, string>
> = {
  created: 'Submission created and waiting to be queued.',
  queued: 'Waiting for a worker to pick up this submission.',
  ingesting: 'Reading your repository files from GitHub.',
  ingestion_failed: 'Failed to read repository files. You can retry.',
  analyzing: 'Detecting signals across your codebase.',
  analysis_failed: 'Analysis step failed. You can retry.',
  generating_report: 'Scoring your project and writing the report.',
  report_generation_failed: 'Report generation failed. You can retry.',
  verified: 'This project met all scoring thresholds.',
  insufficient:
    'This project did not meet the passing threshold. See the report for details.',
  failed: 'Verification failed. See the report for details.',
  expired: 'This submission was in progress too long and expired.',
  cancelled: 'You cancelled this submission before it was processed.',
}

export const STATUS_BADGE_CLASS = 'rounded text-[11px] font-medium'
export const BASE_POLL_INTERVAL_MS = 3_000
export const MAX_POLL_INTERVAL_MS = 60_000
export const OLD_SUBMISSION_THRESHOLD_MS = 5 * 60 * 1000

export const EXTRA_SUBMISSION_EVENT_LABELS: Record<string, string> = {
  submission_cancelled: 'Cancelled',
  submission_requeued: 'Re-queued',
  submission_retried: 'Retried',
}

export const TIMELINE_FAILED_STATUSES = [
  ...FAILED_STATUSES,
  'expired',
] as const

export const FAILED_SUBMISSION_STATUS_SET = new Set<SubmissionStatus>(
  TIMELINE_FAILED_STATUSES,
)
