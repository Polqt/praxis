import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { deriveStrengths } from '@/features/reports/utils/derive-strengths'
import { deriveImprovements } from '@/features/reports/utils/derive-improvements'
import type { VerificationReport } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem } from '@/features/reports/types'

type PublicProofPageProps = {
  params: Promise<{ publicToken: string }>
}

export async function generateMetadata({ params }: PublicProofPageProps): Promise<Metadata> {
  const { publicToken } = await params
  const raw = await serverApiFetch<VerificationReport>(`/proof/${publicToken}`).catch(() => null)
  if (!raw) return { title: 'Proof not found' }

  const repoName = raw.repositoryName ?? 'Unknown repo'
  const verdict = raw.verdict === 'verified' ? 'Verified' : 'Insufficient'
  const score = raw.compositeScore
  const title = `${repoName} — ${verdict} · ${score}/100 | Praxis`
  const description = raw.publicSummary ?? `${repoName} was evaluated by Praxis and scored ${score}/100.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Praxis',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
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

  const rawStrengths = raw.strengths ?? []
  const rawImprovements = raw.improvements ?? []
  const strengths = rawStrengths.length > 0 ? rawStrengths : deriveStrengths(scores)
  const improvements = rawImprovements.length > 0 ? rawImprovements : deriveImprovements(scores)
  const allCitedFiles = Array.from(new Set(scores.flatMap((s) => s.citations)))

  return {
    id: raw.id,
    submissionId: raw.submissionId,
    repositoryName: raw.repositoryName ?? '',
    commitSha: raw.commitSha ?? '',
    challengeTitle: raw.challengeTitle ?? '',
    status: toReportStatus(raw.verdict),
    compositeScore: raw.compositeScore,
    summary: raw.publicSummary ?? '',
    scores,
    skills: [],
    strengths,
    improvements,
    derivedStrengthsAndImprovements: rawStrengths.length === 0 || rawImprovements.length === 0,
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
