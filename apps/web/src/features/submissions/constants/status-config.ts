import type { SubmissionStatus } from '@praxis/shared'

type StatusConfig = {
  label: string
  className: string
}

export const statusConfig: Record<SubmissionStatus, StatusConfig> = {
  created: { label: 'Created', className: 'text-muted-foreground bg-muted border-border' },
  queued: { label: 'Queued', className: 'text-amber-600 bg-amber-50 border-amber-200' },
  ingesting: { label: 'Processing', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  ingestion_failed: { label: 'Failed', className: 'text-red-600 bg-red-50 border-red-200' },
  analyzing: { label: 'Analyzing', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  analysis_failed: { label: 'Failed', className: 'text-red-600 bg-red-50 border-red-200' },
  generating_report: { label: 'Generating', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  report_generation_failed: { label: 'Failed', className: 'text-red-600 bg-red-50 border-red-200' },
  awaiting_human_review: { label: 'In Review', className: 'text-purple-600 bg-purple-50 border-purple-200' },
  verified: { label: 'Verified', className: 'text-green-600 bg-green-50 border-green-200' },
  insufficient: { label: 'Insufficient', className: 'text-orange-600 bg-orange-50 border-orange-200' },
  failed: { label: 'Failed', className: 'text-red-600 bg-red-50 border-red-200' },
  expired: { label: 'Expired', className: 'text-muted-foreground bg-muted border-border' },
}

export const IN_PROGRESS_STATUSES: SubmissionStatus[] = [
  'queued',
  'ingesting',
  'analyzing',
  'generating_report',
  'awaiting_human_review',
]
