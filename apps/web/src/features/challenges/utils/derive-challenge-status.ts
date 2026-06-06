import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { ChallengeSubmissionStatus } from '@/features/challenges/types'
import type { ProjectSubmission } from '@praxis/shared'

export function deriveChallengeSubmissionStatus(
  submissions: ProjectSubmission[],
): ChallengeSubmissionStatus | undefined {
  if (submissions.some((submission) => submission.status === 'verified')) {
    return 'verified'
  }

  if (
    submissions.some((submission) =>
      IN_PROGRESS_STATUSES.includes(submission.status),
    )
  ) {
    return 'in-progress'
  }

  return submissions.length > 0 ? 'attempted' : undefined
}
