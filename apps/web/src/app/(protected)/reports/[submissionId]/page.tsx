import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'
import { deriveStrengths } from '@/features/reports/utils/derive-strengths'
import { deriveImprovements } from '@/features/reports/utils/derive-improvements'
import type { VerificationReport, ProjectSubmission } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem } from '@/features/reports/types'

type Props = {
  params: Promise<{ submissionId: string }>
}

const VALID_STATUSES: ReportStatus[] = ['verified', 'insufficient', 'failed']

function toReportStatus(verdict: string): ReportStatus {
  return VALID_STATUSES.includes(verdict as ReportStatus)
    ? (verdict as ReportStatus)
    : 'insufficient'
}

function toReport(raw: VerificationReport, submission: ProjectSubmission): Report {
  const scores: ScoreItem[] = Object.entries(raw.categoryScores).map(([category, data]) => ({
    category,
    score: data.score,
    narrative: data.narrative ?? '',
    citations: data.citations ?? [],
  }))

  const rawStrengths = raw.strengths ?? []
  const rawImprovements = raw.improvements ?? []
  const strengths = rawStrengths.length > 0 ? rawStrengths : deriveStrengths(scores)
  const improvements = rawImprovements.length > 0 ? rawImprovements : deriveImprovements(scores)
  const derivedStrengthsAndImprovements = rawStrengths.length === 0 || rawImprovements.length === 0

  const allCitedFiles = Array.from(new Set(scores.flatMap((s) => s.citations)))

  return {
    id: raw.id,
    submissionId: raw.submissionId,
    repositoryName: submission.githubRepoFullName,
    commitSha: submission.commitSha,
    challengeTitle: '',
    status: toReportStatus(raw.verdict),
    compositeScore: raw.compositeScore,
    summary: raw.publicSummary ?? '',
    scores,
    skills: [],
    strengths,
    improvements,
    derivedStrengthsAndImprovements,
    allCitedFiles,
    generatedAt: raw.generatedAt,
    modelVersion: raw.analyzerVersion,
    isPublic: raw.isPublic,
    publicToken: raw.publicToken,
  }
}

export default async function PrivateReportPage({ params }: Props) {
  const { submissionId } = await params

  const [raw, submission] = await Promise.all([
    serverApiFetch<VerificationReport>(`/reports/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ProjectSubmission>(`/submissions/${submissionId}`).catch(() => null),
  ])

  if (!raw || !submission) notFound()

  const report = toReport(raw, submission)

  return (
    <ReportClient
      report={report}
      actions={
        <ReportVisibilityButton submissionId={raw.submissionId} isPublic={raw.isPublic} initialPublicToken={raw.publicToken} />
      }
    />
  )
}
