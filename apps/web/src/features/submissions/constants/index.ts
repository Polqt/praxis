import type { SubmissionStatus, FilterBucket } from '@/features/submissions/types'

export type StatusConfig = {
  label: string
  className: string
}

export const STATUS_CONFIG: Record<SubmissionStatus, StatusConfig> = {
  queued: {
    label: 'Queued',
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  ingesting: {
    label: 'Processing',
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  analyzing: {
    label: 'Analyzing',
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  generating_report: {
    label: 'Generating report',
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  verified: {
    label: 'Verified',
    className: 'text-green-700 bg-green-50 border-green-200',
  },
  insufficient: {
    label: 'Insufficient',
    className: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  failed: {
    label: 'Failed',
    className: 'text-red-700 bg-red-50 border-red-200',
  },
}

// Approximate pipeline progress per stage
export const STAGE_PROGRESS: Record<SubmissionStatus, number> = {
  queued: 10,
  ingesting: 30,
  analyzing: 60,
  generating_report: 80,
  verified: 100,
  insufficient: 100,
  failed: 100,
}

export const IN_PROGRESS_STATUSES: SubmissionStatus[] = [
  'queued',
  'ingesting',
  'analyzing',
  'generating_report',
]

export const TERMINAL_STATUSES: SubmissionStatus[] = ['verified', 'insufficient', 'failed']

export const FILTER_BUCKETS: { value: FilterBucket; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
]

export const STATUS_TO_FILTER: Record<SubmissionStatus, FilterBucket> = {
  verified: 'verified',
  queued: 'in_progress',
  ingesting: 'in_progress',
  analyzing: 'in_progress',
  generating_report: 'in_progress',
  insufficient: 'failed',
  failed: 'failed',
}

// Ordered pipeline stages shown in the step timeline and detail timeline
export const PIPELINE_STAGES: Array<{ status: SubmissionStatus | 'created'; label: string }> = [
  { status: 'created', label: 'Submission created' },
  { status: 'queued', label: 'Queued' },
  { status: 'ingesting', label: 'Repository ingested' },
  { status: 'analyzing', label: 'Analysis started' },
  { status: 'generating_report', label: 'Report generating' },
  { status: 'verified', label: 'Verified' },
]

export const EVENT_TYPE_LABELS: Record<string, string> = {
  created: 'Submission created',
  queued: 'Queued',
  ingesting: 'Repository ingested',
  ingestion_failed: 'Processing failed',
  analyzing: 'Analysis started',
  analysis_failed: 'Analysis failed',
  generating_report: 'Report generating',
  report_generation_failed: 'Report generation failed',
  awaiting_human_review: 'Awaiting review',
  verified: 'Verified',
  insufficient: 'Insufficient',
  failed: 'Failed',
  expired: 'Expired',
}
