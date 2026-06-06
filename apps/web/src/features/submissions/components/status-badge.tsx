import { Badge } from '@/components/ui/badge'
import { statusLabel } from '@/lib/praxis-format'
import {
  FAILED_STATUSES,
  IN_PROGRESS_STATUSES,
  STATUS_BADGE_CLASS,
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_TOOLTIP,
} from '@/features/submissions/constants'
import type { SubmissionStatus } from '@praxis/shared'

type Props = {
  status: SubmissionStatus | string
}

export function StatusBadge({ status }: Props) {
  const label = statusLabel(status as SubmissionStatus)
  const tooltip = SUBMISSION_STATUS_TOOLTIP[status as SubmissionStatus]

  if (status === SUBMISSION_STATUS.verified) {
    return (
      <Badge title={tooltip} className={`${STATUS_BADGE_CLASS} bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300`}>
        {label}
      </Badge>
    )
  }
  if (status === SUBMISSION_STATUS.insufficient) {
    return (
      <Badge title={tooltip} className={`${STATUS_BADGE_CLASS} bg-amber-50 text-amber-700 border border-amber-200`}>
        {label}
      </Badge>
    )
  }
  if (FAILED_STATUSES.includes(status as SubmissionStatus) || status === SUBMISSION_STATUS.expired) {
    return <Badge title={tooltip} variant="destructive" className={STATUS_BADGE_CLASS}>{label}</Badge>
  }
  if (status === SUBMISSION_STATUS.cancelled) {
    return <Badge title={tooltip} variant="outline" className={`${STATUS_BADGE_CLASS} text-muted-foreground`}>{label}</Badge>
  }
  if (IN_PROGRESS_STATUSES.includes(status as SubmissionStatus)) {
    return (
      <Badge title={tooltip} variant="secondary" className={`${STATUS_BADGE_CLASS} gap-1.5`}>
        <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
        {label}
      </Badge>
    )
  }
  return <Badge title={tooltip} variant="outline" className={STATUS_BADGE_CLASS}>{label}</Badge>
}
