import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'
import { ReportFeedbackForm } from '@/features/reports/components/report-feedback-form'
import { ShareOnTwitterButton } from '@/features/reports/components/share-on-twitter-button'
import { TestExecutionOutput } from '@/features/reports/components/test-execution-output'
import { toReport } from '@/features/reports/utils/to-report'
import type { VerificationReport, ProjectSubmission } from '@praxis/shared'

type Props = {
  params: Promise<{ submissionId: string }>
}

export default async function PrivateReportPage({ params }: Props) {
  const { submissionId } = await params

  type ExecutionOutput = {
    language: string; testCommand: string; exitCode: number
    passed: number; failed: number; skipped: number
    durationMs: number | null; stdout: string | null; stderr: string | null; timedOut: boolean
  }

  const [raw, submission, execution] = await Promise.all([
    serverApiFetch<VerificationReport>(`/reports/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ProjectSubmission>(`/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ExecutionOutput | null>(`/reports/submissions/${submissionId}/execution`).catch(() => null),
  ])

  if (!raw) notFound()

  const showTwitterShare = raw.verdict === 'verified' || raw.verdict === 'insufficient'

  // Find best-scoring category for richer share text
  const categoryEntries = Object.entries(raw.categoryScores ?? {})
  const bestCategory = categoryEntries.length > 0
    ? categoryEntries.reduce<{ name: string; score: number } | null>((best, [name, data]) => {
        const score = (data as { score: number }).score
        return !best || score > best.score ? { name, score } : best
      }, null)
    : null

  return (
    <ReportClient
      report={toReport(raw)}
      challengeId={submission?.challengeId}
      actions={
        <ReportVisibilityButton submissionId={raw.submissionId} isPublic={raw.isPublic} initialPublicToken={raw.publicToken} />
      }
      executionSlot={execution ? <TestExecutionOutput execution={execution} /> : undefined}
      feedbackSlot={<ReportFeedbackForm submissionId={submissionId} challengeId={submission?.challengeId} />}
      twitterSlot={showTwitterShare ? (
        <ShareOnTwitterButton
          verdict={raw.verdict as 'verified' | 'insufficient'}
          compositeScore={raw.compositeScore}
          challengeTitle={raw.challengeTitle ?? ''}
          publicToken={raw.publicToken}
          bestCategory={bestCategory}
        />
      ) : undefined}
    />
  )
}
