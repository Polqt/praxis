import { Badge } from '@/components/ui/badge'
import { statusLabel } from '@/lib/praxis-format'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { SubmissionStatus } from '@praxis/shared'

const STATUS_TOOLTIP: Partial<Record<string, string>> = {
  created: 'Submission created and waiting to be queued.',
  queued: 'Waiting for a worker to pick up this submission.',
  ingesting: 'Reading your repository files from GitHub.',
  ingestion_failed: 'Failed to read repository files. You can retry.',
  analyzing: 'Detecting signals across your codebase.',
  analysis_failed: 'Analysis step failed. You can retry.',
  generating_report: 'Scoring your project and writing the report.',
  report_generation_failed: 'Report generation failed. You can retry.',
  verified: 'This project met all scoring thresholds.',
  insufficient: 'This project did not meet the passing threshold. See the report for details.',
  failed: 'Verification failed. See the report for details.',
  expired: 'This submission was in progress too long and expired.',
  cancelled: 'You cancelled this submission before it was processed.',
}

type Props = {
  status: SubmissionStatus | string
}

export function StatusBadge({ status }: Props) {
  const label = statusLabel(status as SubmissionStatus)
  const tooltip = STATUS_TOOLTIP[status]

  if (status === 'verified') {
    return (
      <Badge title={tooltip} className="rounded bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'insufficient') {
    return (
      <Badge title={tooltip} className="rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (['failed', 'expired', 'ingestion_failed', 'analysis_failed', 'report_generation_failed'].includes(status)) {
    return <Badge title={tooltip} variant="destructive" className="rounded text-[11px] font-medium">{label}</Badge>
  }
  if (status === 'cancelled') {
    return <Badge title={tooltip} variant="outline" className="rounded text-[11px] font-medium text-muted-foreground">{label}</Badge>
  }
  if (IN_PROGRESS_STATUSES.includes(status as SubmissionStatus)) {
    return (
      <Badge title={tooltip} variant="secondary" className="rounded text-[11px] font-medium gap-1.5">
        <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
        {label}
      </Badge>
    )
  }
  return <Badge title={tooltip} variant="outline" className="rounded text-[11px] font-medium">{label}</Badge>
}
