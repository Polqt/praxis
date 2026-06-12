import { deriveStrengths } from './derive-strengths'
import { deriveImprovements } from './derive-improvements'
import { deriveConfidence } from './derive-confidence'
import type { VerificationReport } from '@praxis/shared'
import type { Report, ReportStatus, ScoreItem, ExecutionEvidence } from '@/features/reports/types'

const VALID_STATUSES: ReportStatus[] = ['verified', 'insufficient', 'failed']

function toReportStatus(verdict: string): ReportStatus {
  return VALID_STATUSES.includes(verdict as ReportStatus)
    ? (verdict as ReportStatus)
    : 'insufficient'
}

export function toReport(raw: VerificationReport, overrides?: { isPublic?: boolean }): Report {
  const scores: ScoreItem[] = Object.entries(raw.categoryScores).map(([category, data]) => {
    const exec = (data.signals as Record<string, unknown> | undefined)?.execution as
      | { passed: number; failed: number; skipped: number; language: string }
      | null
      | undefined

    const executionEvidence: ExecutionEvidence | null = exec
      ? { passed: exec.passed, failed: exec.failed, skipped: exec.skipped, language: exec.language }
      : null

    const displaySignals = { ...((data.signals ?? {}) as Record<string, unknown>) }
    delete displaySignals.execution

    const scoreItem: ScoreItem = {
      category,
      score: data.score,
      narrative: data.narrative ?? '',
      citations: data.citations ?? [],
      status: data.status as ScoreItem['status'],
      minimumScore: data.minimumScore,
      weight: data.weight,
      executionEvidence,
      signals: Object.keys(displaySignals).length > 0 ? displaySignals : undefined,
    }
    return { ...scoreItem, confidence: deriveConfidence(scoreItem) }
  })

  const rawStrengths = raw.strengths ?? []
  const rawImprovements = raw.improvements ?? []
  const strengths = rawStrengths.length > 0 ? rawStrengths : deriveStrengths(scores)
  const improvements = rawImprovements.length > 0 ? rawImprovements : deriveImprovements(scores)
  const allCitedFiles = Array.from(new Set(scores.flatMap((s) => s.citations)))
  const skillProgress = raw.skillProgress ?? []
  const skills = skillProgress
    .filter((item) => item.awarded)
    .map((item) => item.name)

  return {
    id: raw.id,
    submissionId: raw.submissionId,
    repositoryName: raw.repositoryName ?? '',
    commitSha: raw.commitSha ?? '',
    challengeTitle: raw.challengeTitle ?? '',
    status: toReportStatus(raw.verdict),
    compositeScore: raw.compositeScore,
    summary: raw.publicSummary ?? '',
    aiFallback: raw.aiFallback ?? false,
    scores,
    skills,
    strengths,
    improvements,
    derivedStrengthsAndImprovements: rawStrengths.length === 0 && rawImprovements.length === 0,
    allCitedFiles,
    generatedAt: raw.generatedAt,
    modelVersion: raw.analyzerVersion,
    isPublic: overrides?.isPublic ?? raw.isPublic ?? false,
    publicToken: raw.publicToken,
    skillProgress,
    aiReview: raw.aiReview ?? null,
    previousSubmission: raw.previousSubmission ?? null,
  }
}
