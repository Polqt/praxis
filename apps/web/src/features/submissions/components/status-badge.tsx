import { Badge } from '@/components/ui/badge'
import { statusLabel } from '@/lib/praxis-format'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { SubmissionStatus } from '@praxis/shared'

type Props = {
  status: SubmissionStatus | string
}

export function StatusBadge({ status }: Props) {
  const label = statusLabel(status as SubmissionStatus)

  if (status === 'verified') {
    return (
      <Badge className="rounded bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'insufficient') {
    return (
      <Badge className="rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (['failed', 'expired', 'ingestion_failed', 'analysis_failed', 'report_generation_failed'].includes(status)) {
    return <Badge variant="destructive" className="rounded text-[11px] font-medium">{label}</Badge>
  }
  if (status === 'cancelled') {
    return <Badge variant="outline" className="rounded text-[11px] font-medium text-muted-foreground">{label}</Badge>
  }
  if (IN_PROGRESS_STATUSES.includes(status as SubmissionStatus)) {
    return (
      <Badge variant="secondary" className="rounded text-[11px] font-medium gap-1.5">
        <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
        {label}
      </Badge>
    )
  }
  return <Badge variant="outline" className="rounded text-[11px] font-medium">{label}</Badge>
}
