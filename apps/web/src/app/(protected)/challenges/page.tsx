import { serverApiFetch } from '@/lib/api.server'
import { ChallengesPageClient } from '@/features/challenges/components/challenges-page-client'
import {
  deriveChallengeSubmissionStatus,
  toChallenge,
} from '@/features/challenges/utils'
import type { ProjectChallenge, ProjectSubmission } from '@praxis/shared'
import type { ChallengeSubmissionStatus } from '@/features/challenges/types'

export default async function ChallengesPage() {
  const [raw, submissions] = await Promise.all([
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => [] as ProjectChallenge[]),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => [] as ProjectSubmission[]),
  ])

  const challenges = raw.map(toChallenge)

  const submissionsByChallenge = new Map<string, ProjectSubmission[]>()
  for (const submission of submissions) {
    const challengeSubmissions =
      submissionsByChallenge.get(submission.challengeId) ?? []
    challengeSubmissions.push(submission)
    submissionsByChallenge.set(submission.challengeId, challengeSubmissions)
  }

  const submissionStatusMap: Record<string, ChallengeSubmissionStatus> = {}
  for (const [challengeId, challengeSubmissions] of submissionsByChallenge) {
    const status = deriveChallengeSubmissionStatus(challengeSubmissions)
    if (status) submissionStatusMap[challengeId] = status
  }

  return (
    <ChallengesPageClient
      challenges={challenges}
      submissionStatusMap={submissionStatusMap}
    />
  )
}
