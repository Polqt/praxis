import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'
import { ReportFeedbackForm } from '@/features/reports/components/report-feedback-form'
import { ResubmitAfterFixesButton } from '@/features/reports/components/resubmit-after-fixes-button'
import { ShareOnTwitterButton } from '@/features/reports/components/share-on-twitter-button'
import { TestExecutionOutput } from '@/features/reports/components/test-execution-output'
import { toReport } from '@/features/reports/utils/to-report'
import type { VerificationReport, ProjectSubmission, ProjectChallenge } from '@praxis/shared'

import type { ExecutionOutput } from '@/features/reports/types'

type Props = {
  params: Promise<{ submissionId: string }>
}

export default async function PrivateReportPage({ params }: Props) {
  const { submissionId } = await params

  type FeedbackSummary = { count: number; averageRating: number; highAccuracyCount: number } | null
  const [raw, submission, execution] = await Promise.all([
    serverApiFetch<VerificationReport>(`/reports/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ProjectSubmission>(`/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ExecutionOutput | null>(`/reports/submissions/${submissionId}/execution`).catch(() => null),
  ])

  const challenge = submission?.challengeId
    ? await serverApiFetch<ProjectChallenge>(`/challenges/${submission.challengeId}`).catch(() => null)
    : null

  if (!raw) notFound()

  const needsFeedback = raw.verdict === 'insufficient' || raw.compositeScore < 70
  const feedbackSummary = needsFeedback
    ? await serverApiFetch<FeedbackSummary>(`/reports/submissions/${submissionId}/feedback-summary`).catch(() => null)
    : null

  const showTwitterShare = raw.verdict === 'verified' || raw.verdict === 'insufficient'

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
      language={execution?.language ?? null}
      passingThreshold={challenge?.passingThreshold ?? null}
      submissionActions={raw.verdict === 'insufficient' ? (
        <ResubmitAfterFixesButton
          challengeId={submission?.challengeId}
          repositoryName={raw.repositoryName ?? ''}
          commitSha={raw.commitSha ?? undefined}
        />
      ) : undefined}
      proofActions={
        <ReportVisibilityButton
          submissionId={raw.submissionId}
          isPublic={raw.isPublic}
          initialPublicToken={raw.publicToken}
        />
      }
      executionSlot={(() => {
        if (!execution) return (
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-3">
            <span className="text-xs text-muted-foreground">Sandbox execution was not performed for this submission. Scores are based on static file analysis only.</span>
          </div>
        )
        const isSkipped = execution.publicSummary?.toLowerCase().includes('skipped') || execution.publicSummary?.toLowerCase().includes('not run')
        const isCloneFailed = execution.publicSummary?.toLowerCase().includes('clone') || execution.publicSummary?.toLowerCase().includes('private')
        return (
          <div className="space-y-2">
            {isCloneFailed && (
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <span className="text-xs text-amber-700">Could not clone repository — the repo may be private. <a href="/settings" className="underline underline-offset-2">Reconnect GitHub</a> to enable sandbox checks.</span>
              </div>
            )}
            {isSkipped && !isCloneFailed && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-3">
                <span className="text-xs text-muted-foreground">{execution.publicSummary}</span>
              </div>
            )}
            <TestExecutionOutput execution={execution} />
          </div>
        )
      })()}
      feedbackSlot={
        (raw.verdict === 'insufficient' || raw.compositeScore < 70)
          ? (
            <>
              {feedbackSummary && feedbackSummary.count >= 3 && (
                <p className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">{feedbackSummary.highAccuracyCount}</span> of{' '}
                  <span className="font-medium text-foreground">{feedbackSummary.count}</span> reviewers found this report accurate.
                </p>
              )}
              <ReportFeedbackForm submissionId={submissionId} challengeId={submission?.challengeId} />
            </>
          )
          : undefined
      }
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
