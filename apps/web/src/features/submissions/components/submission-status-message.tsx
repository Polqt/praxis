import Link from 'next/link'
import { IconAlertCircle, IconClock } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { ProjectSubmission } from '@praxis/shared'

type Props = {
  submission: ProjectSubmission
}

export function SubmissionStatusMessage({ submission }: Props) {
  if (IN_PROGRESS_STATUSES.includes(submission.status)) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        Verification is running. Results will appear here when complete.
      </p>
    )
  }

  if (submission.status === 'verified' || submission.status === 'insufficient') {
    return (
      <Button className="w-full mt-4" asChild>
        <Link href={`/reports/${submission.id}`}>View report</Link>
      </Button>
    )
  }

  if (
    submission.status === 'failed' ||
    submission.status === 'ingestion_failed' ||
    submission.status === 'analysis_failed' ||
    submission.status === 'report_generation_failed'
  ) {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3">
        <IconAlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {submission.failureReason ?? 'Verification failed. Please try again or contact support.'}
        </p>
      </div>
    )
  }

  if (submission.status === 'expired') {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3">
        <IconClock size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Verification expired. The submission stayed in progress too long. Please submit again.
        </p>
      </div>
    )
  }

  return null
}
