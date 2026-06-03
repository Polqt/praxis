import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'
import { ReportFeedbackForm } from '@/features/reports/components/report-feedback-form'
import { ShareOnTwitterButton } from '@/features/reports/components/share-on-twitter-button'
import { toReport } from '@/features/reports/utils/to-report'
import type { VerificationReport, ProjectSubmission } from '@praxis/shared'

type Props = {
  params: Promise<{ submissionId: string }>
}

export default async function PrivateReportPage({ params }: Props) {
  const { submissionId } = await params

  const [raw, submission] = await Promise.all([
    serverApiFetch<VerificationReport>(`/reports/submissions/${submissionId}`).catch(() => null),
    serverApiFetch<ProjectSubmission>(`/submissions/${submissionId}`).catch(() => null),
  ])

  if (!raw) notFound()

  const showTwitterShare = raw.verdict === 'verified' || raw.verdict === 'insufficient'

  return (
    <ReportClient
      report={toReport(raw)}
      challengeId={submission?.challengeId}
      actions={
        <ReportVisibilityButton submissionId={raw.submissionId} isPublic={raw.isPublic} initialPublicToken={raw.publicToken} />
      }
      feedbackSlot={<ReportFeedbackForm submissionId={submissionId} />}
      twitterSlot={showTwitterShare ? (
        <ShareOnTwitterButton
          verdict={raw.verdict as 'verified' | 'insufficient'}
          compositeScore={raw.compositeScore}
          challengeTitle={raw.challengeTitle ?? ''}
          publicToken={raw.publicToken}
        />
      ) : undefined}
    />
  )
}
