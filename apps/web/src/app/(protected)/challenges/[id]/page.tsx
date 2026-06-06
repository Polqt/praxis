import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ChallengeDetail } from '@/features/challenges/components/challenge-detail'
import {
  deriveChallengeSubmissionStatus,
  toChallenge,
} from '@/features/challenges/utils'
import type {
  ProjectChallenge,
  ProjectSubmission,
} from '@praxis/shared'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage(props: Props) {
  const { id } = await props.params
  const [challenge, submissions] = await Promise.all([
    serverApiFetch<ProjectChallenge>(`/challenges/${id}`).catch(() => null),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => []),
  ])

  if (!challenge) notFound()

  const challengeSubmissions = submissions.filter(
    (submission) => submission.challengeId === challenge.id,
  )
  const latestSubmission = challengeSubmissions.reduce<ProjectSubmission | null>(
    (latest, submission) => {
      if (!latest) return submission
      return new Date(submission.submittedAt) > new Date(latest.submittedAt)
        ? submission
        : latest
    },
    null,
  )

  return (
    <ChallengeDetail
      challenge={challenge}
      displayChallenge={toChallenge(challenge)}
      submissionStatus={deriveChallengeSubmissionStatus(challengeSubmissions)}
      latestSubmission={latestSubmission}
    />
  )
}
