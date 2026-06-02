import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { deriveStrengths } from '@/features/reports/utils/derive-strengths'
import { deriveImprovements } from '@/features/reports/utils/derive-improvements'
import type { VerificationReport } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem } from '@/features/reports/types'

type PublicProofPageProps = {
  params: Promise<{ publicToken: string }>
}

const VALID_STATUSES: ReportStatus[] = ['verified', 'insufficient', 'failed']

function toReportStatus(verdict: string): ReportStatus {
  return VALID_STATUSES.includes(verdict as ReportStatus)
    ? (verdict as ReportStatus)
    : 'insufficient'
}

function toReport(raw: VerificationReport): Report {
  const scores: ScoreItem[] = Object.entries(raw.categoryScores).map(([category, data]) => ({
    category,
    score: data.score,
    narrative: data.narrative ?? '',
    citations: data.citations ?? [],
  }))

  const rawAny = raw as unknown as Record<string, unknown>
  const hasRealStrengths = Array.isArray(rawAny.strengths) && (rawAny.strengths as unknown[]).length > 0
  const hasRealImprovements = Array.isArray(rawAny.improvements) && (rawAny.improvements as unknown[]).length > 0

  const strengths = hasRealStrengths ? (rawAny.strengths as string[]) : deriveStrengths(scores)
  const improvements = hasRealImprovements ? (rawAny.improvements as string[]) : deriveImprovements(scores)

  const allCitedFiles = Array.from(new Set(scores.flatMap((s) => s.citations)))

  return {
    id: raw.id,
    submissionId: raw.submissionId,
    repositoryName: raw.repositoryName ?? '',
    commitSha: '',
    challengeTitle: '',
    status: toReportStatus(raw.verdict),
    compositeScore: raw.compositeScore,
    summary: raw.publicSummary ?? '',
    scores,
    skills: [],
    strengths,
    improvements,
    derivedStrengthsAndImprovements: !hasRealStrengths || !hasRealImprovements,
    allCitedFiles,
    generatedAt: raw.generatedAt,
    modelVersion: raw.analyzerVersion,
    isPublic: true,
    publicToken: raw.publicToken,
  }
}

export default async function PublicProofPage(props: PublicProofPageProps) {
  const { publicToken } = await props.params
  const raw = await serverApiFetch<VerificationReport>(`/proof/${publicToken}`).catch(() => null)

  if (!raw) notFound()

  const report = toReport(raw)

  return (
    <ReportClient
      report={report}
      backHref="/"
      backLabel="Back to Praxis"
    />
  )
}
