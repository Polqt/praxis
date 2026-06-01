import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import type { VerificationReport, ProjectSubmission } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem, EvidenceItem } from '@/features/reports/types'

type Props = {
  params: Promise<{ submissionId: string }>
}

const VALID_STATUSES: ReportStatus[] = ['verified', 'insufficient', 'failed']

function toReportStatus(verdict: string): ReportStatus {
  if (VALID_STATUSES.includes(verdict as ReportStatus)) return verdict as ReportStatus
  return 'failed'
}

function toReport(
  raw: VerificationReport,
  submission: ProjectSubmission,
): Report {
  const scores: ScoreItem[] = Object.entries(raw.categoryScores).map(([category, data]) => ({
    category,
    score: data.score,
  }))

  const evidence: EvidenceItem[] = Object.entries(raw.categoryScores)
    .filter(([, data]) => data.citations.length > 0)
    .map(([category, data]) => ({
      label: `${category} evidence`,
      files: data.citations,
    }))

  return {
    id: raw.id,
    submissionId: raw.submissionId,
    repositoryUrl: `https://github.com/${submission.githubRepoFullName}`,
    repositoryName: submission.githubRepoFullName,
    commitSha: submission.commitSha,
    challengeId: submission.challengeId,
    challengeTitle: '',
    status: toReportStatus(raw.verdict),
    summary: raw.publicSummary ?? '',
    scores,
    skills: [],
    evidence,
    strengths: [],
    improvements: [],
    generatedAt: raw.generatedAt,
    modelVersion: raw.aiModelVersion,
  }
}

export default async function ReportPage({ params }: Props) {
  const { submissionId } = await params

  const [raw, submission] = await Promise.all([
    serverApiFetch<VerificationReport>(`/reports/${submissionId}`).catch(() => null),
    serverApiFetch<ProjectSubmission>(`/submissions/${submissionId}`).catch(() => null),
  ])

  if (!raw || !submission) notFound()

  const report = toReport(raw, submission)

  return <ReportClient report={report} />
}
