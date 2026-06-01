import type { SubmissionStatus } from '@praxis/shared'

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
}

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  'verified', 'insufficient', 'failed', 'expired',
]
