import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Button } from '@/components/ui/button'
import type { ProjectSubmission, ProjectSubmissionEvent } from '@praxis/shared'
import { formatDate, githubRepoUrl, repoName, shortSha } from '@/lib/praxis-format'
import { SubmissionTimeline } from '@/features/submissions/components/submission-timeline'
import { SubmissionPoller } from '@/features/submissions/components/submission-poller'
import { LiveStepIndicator } from '@/features/submissions/components/live-step-indicator'
import { CancelSubmissionButton } from '@/features/submissions/components/cancel-submission-button'
import { RequeueSubmissionButton } from '@/features/submissions/components/requeue-submission-button'
import { RetrySubmissionButton } from '@/features/submissions/components/retry-submission-button'
import { UpdateCommitButton } from '@/features/submissions/components/update-commit-button'
import { StatusBadge } from '@/features/submissions/components/status-badge'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import { IconArrowLeft, IconBrandGithub, IconAlertCircle, IconClock, IconExternalLink } from '@tabler/icons-react'
import { ElapsedTime } from '@/features/submissions/components/elapsed-time'

type Props = {
  params: Promise<{ id: string }>
}


export default async function SubmissionDetailPage(props: Props) {
  const { id } = await props.params
  const [submission, events] = await Promise.all([
    serverApiFetch<ProjectSubmission>(`/submissions/${id}`),
    serverApiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`).catch(() => []),
  ])

  // Fire-and-forget: mark this submission as viewed so the nav badge clears
  serverApiFetch(`/submissions/${id}/viewed`, { method: 'PATCH' }).catch(() => {})

  const isInProgress = IN_PROGRESS_STATUSES.includes(submission.status)
  const statusHasReport = submission.status === 'verified' || submission.status === 'insufficient'
  const isFailed = ['failed', 'ingestion_failed', 'analysis_failed', 'report_generation_failed'].includes(submission.status)
  const isQueued = submission.status === 'queued'

  // Fetch report existence and execution result in parallel — only when submission is terminal
  type ExecutionSummary = { passed: number; failed: number; skipped: number; timedOut: boolean; language: string } | null
  const [reportExists, execution] = statusHasReport || isFailed
    ? await Promise.all([
        statusHasReport
          ? serverApiFetch(`/reports/submissions/${id}`).then(() => true).catch(() => false)
          : Promise.resolve(false),
        serverApiFetch<ExecutionSummary>(`/reports/submissions/${id}/execution`).catch(() => null),
      ])
    : [false, null] as const

  const hasReport = statusHasReport && reportExists

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full">
      <SubmissionPoller isInProgress={isInProgress} />

      <div className="mb-8">
        <Link
          href="/submissions"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <IconArrowLeft size={14} />
          Back to submissions
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-mono truncate">
              {repoName(submission.githubRepoFullName)}
            </h1>
            <a
              href={githubRepoUrl(submission.githubRepoFullName)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconBrandGithub size={13} />
              {submission.githubRepoFullName}
              <IconExternalLink size={11} />
            </a>
          </div>
          <StatusBadge status={submission.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Details</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Repository</span>
                <span className="text-xs font-mono font-medium truncate">{repoName(submission.githubRepoFullName)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Commit</span>
                <a
                  href={`${githubRepoUrl(submission.githubRepoFullName)}/commit/${submission.commitSha}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono hover:underline"
                >
                  {shortSha(submission.commitSha)}
                </a>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Submitted</span>
                <span className="text-xs" suppressHydrationWarning>{formatDate(submission.submittedAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={submission.status} />
              </div>
              {execution?.language && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Language</span>
                  <span className="text-xs font-mono">{execution.language}</span>
                </div>
              )}
              {execution && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Tests ran</span>
                  <span className="text-xs tabular-nums">
                    {execution.timedOut ? (
                      <span className="text-amber-600">Timed out</span>
                    ) : (
                      <>
                        {execution.passed > 0 && <span className="text-green-600">{execution.passed} passed</span>}
                        {execution.passed > 0 && execution.failed > 0 && <span className="text-muted-foreground"> · </span>}
                        {execution.failed > 0 && <span className="text-destructive">{execution.failed} failed</span>}
                        {execution.passed === 0 && execution.failed === 0 && <span className="text-muted-foreground">0 tests</span>}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isInProgress && (
            <>
              <LiveStepIndicator status={submission.status} />
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-xs text-muted-foreground">Typically 2–5 minutes. Updates automatically.</p>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  <ElapsedTime since={submission.submittedAt} />
                </span>
              </div>
            </>
          )}

          {isQueued && (
            <CancelSubmissionButton submissionId={submission.id} />
          )}

          {hasReport && (
            <Button className="w-full" asChild>
              <Link href={`/reports/${submission.id}`}>View full report</Link>
            </Button>
          )}

          {isFailed && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <IconAlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Verification failed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {submission.failureReason ?? 'An error occurred during verification.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <RetrySubmissionButton submissionId={submission.id} />
                <UpdateCommitButton submissionId={submission.id} />
              </div>
            </div>
          )}

          {submission.status === 'cancelled' && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <IconClock size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Submission cancelled</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You cancelled this submission before verification started.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <RequeueSubmissionButton submissionId={submission.id} />
                <p className="text-[11px] text-muted-foreground text-center">
                  Re-queuing will restart verification. Usually takes 2–5 minutes.
                </p>
                <UpdateCommitButton submissionId={submission.id} />
              </div>
            </div>
          )}

          {submission.status === 'expired' && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <IconClock size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Submission expired</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This submission stayed in progress too long. Please submit again.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <UpdateCommitButton submissionId={submission.id} />
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                  <Link href={`/submit?challengeId=${submission.challengeId}`}>Submit as new</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Verification timeline</p>
            <SubmissionTimeline submission={submission} events={events} />
          </div>
        </div>
      </div>
    </div>
  )
}
