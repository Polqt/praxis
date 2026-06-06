import {
  FAILED_STATUSES,
  IN_PROGRESS_STATUSES,
} from '@/features/submissions/constants'
import type { SubmissionFilter } from '@/features/submissions/types'
import type { ProjectSubmission } from '@praxis/shared'

export function filterSubmissions(
  submissions: ProjectSubmission[],
  filter: SubmissionFilter,
): ProjectSubmission[] {
  if (filter === 'verified') {
    return submissions.filter((submission) => submission.status === 'verified')
  }

  if (filter === 'in-progress') {
    return submissions.filter((submission) =>
      IN_PROGRESS_STATUSES.includes(submission.status),
    )
  }

  if (filter === 'failed') {
    return submissions.filter((submission) =>
      FAILED_STATUSES.includes(submission.status),
    )
  }

  return submissions
}

export function countSubmissions(
  submissions: ProjectSubmission[],
  filter: SubmissionFilter,
): number {
  return filterSubmissions(submissions, filter).length
}
