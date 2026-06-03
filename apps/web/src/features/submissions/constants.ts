import type { SubmissionStatus } from '@praxis/shared'

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
  { key: 'ingesting',         label: 'Repository ingested', toStatus: 'ingesting' },
  { key: 'analyzing',         label: 'Analysis started',    toStatus: 'analyzing' },
  { key: 'generating_report', label: 'Report generating',   toStatus: 'generating_report' },
]

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
