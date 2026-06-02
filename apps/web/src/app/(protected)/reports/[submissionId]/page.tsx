import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'
import { toReport } from '@/features/reports/utils/to-report'
import type { VerificationReport } from '@praxis/shared'

type Props = {
  params: Promise<{ submissionId: string }>
}

export default async function PrivateReportPage({ params }: Props) {
  const { submissionId } = await params

  const raw = await serverApiFetch<VerificationReport>(`/reports/submissions/${submissionId}`).catch(() => null)

  if (!raw) notFound()

  return (
    <ReportClient
      report={toReport(raw)}
      actions={
        <ReportVisibilityButton submissionId={raw.submissionId} isPublic={raw.isPublic} initialPublicToken={raw.publicToken} />
      }
    />
  )
}
