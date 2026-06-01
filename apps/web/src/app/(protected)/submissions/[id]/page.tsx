import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { SubmissionDetailClient } from '@/features/submissions/components/submission-detail-client'
import type { ProjectSubmission, ProjectSubmissionEvent } from '@praxis/shared'
import type { Submission, SubmissionEvent, SubmissionStatus } from '@/features/submissions/types'

type Props = {
  params: Promise<{ id: string }>
}

const VALID_STATUSES: SubmissionStatus[] = [
  'queued', 'ingesting', 'analyzing', 'generating_report',
  'verified', 'insufficient', 'failed',
]

function toSubmission(
  raw: ProjectSubmission,
  events: ProjectSubmissionEvent[],
): Submission {
  const status = VALID_STATUSES.includes(raw.status as SubmissionStatus)
    ? (raw.status as SubmissionStatus)
    : 'queued'

  const mappedEvents: SubmissionEvent[] = events.map((e) => ({
    id: e.id,
    type: e.toStatus,
    metadata: e.metadata,
    createdAt: e.createdAt,
  }))

  return {
    id: raw.id,
    repositoryUrl: `https://github.com/${raw.githubRepoFullName}`,
    repositoryName: raw.githubRepoFullName,
    branch: 'main',
    commitSha: raw.commitSha,
    challengeId: raw.challengeId,
    challengeTitle: '',
    challengeCategory: '',
    status,
    createdAt: raw.submittedAt,
    lastAnalyzedAt: raw.analyzedAt,
    events: mappedEvents,
  }
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params

  const [raw, events] = await Promise.all([
    serverApiFetch<ProjectSubmission>(`/submissions/${id}`).catch(() => null),
    serverApiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`).catch(() => [] as ProjectSubmissionEvent[]),
  ])

  if (!raw) notFound()

  const submission = toSubmission(raw, events)

  return <SubmissionDetailClient submission={submission} />
}
