import { deriveStrengths } from './derive-strengths'
import { deriveImprovements } from './derive-improvements'
import type { VerificationReport } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem } from '@/features/reports/types'

const VALID_STATUSES: ReportStatus[] = ['verified', 'insufficient', 'failed']

function toReportStatus(verdict: string): ReportStatus {
  return VALID_STATUSES.includes(verdict as ReportStatus)
    ? (verdict as ReportStatus)
    : 'insufficient'
}

export function toReport(raw: VerificationReport, overrides?: { isPublic?: boolean }): Report {
  const scores: ScoreItem[] = Object.entries(raw.categoryScores).map(([category, data]) => ({
    category,
    score: data.score,
    narrative: data.narrative ?? '',
    citations: data.citations ?? [],
    status: data.status as ScoreItem['status'],
    minimumScore: data.minimumScore,
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
    isPublic: overrides?.isPublic ?? raw.isPublic ?? false,
    publicToken: raw.publicToken,
  }
}
