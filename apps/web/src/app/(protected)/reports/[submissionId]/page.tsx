import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { VerificationReport } from '@praxis/shared'
import { ReportVisibilityButton } from '@/features/studio/components/report-visibility-button'

type PrivateReportPageProps = {
  params: Promise<{ submissionId: string }>
}

export default async function PrivateReportPage(props: PrivateReportPageProps) {
  const { submissionId } = await props.params
  const report = await serverApiFetch<VerificationReport>(`/submissions/${submissionId}/report`)

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Badge variant="outline" className="capitalize">{report.verdict}</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Verification report</h1>
          <p className="mt-2 text-sm text-muted-foreground">{report.publicSummary}</p>
        </div>
        <ReportVisibilityButton submissionId={report.submissionId} isPublic={report.isPublic} />
      </div>

      {report.isPublic && report.publicToken && (
        <Link className="mt-4 inline-block text-sm underline" href={`/proof/${report.publicToken}`}>
          Open public proof page
        </Link>
      )}

      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-5xl font-semibold">{report.compositeScore}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Composite score</p>
          <div className="mt-6 divide-y">
            {Object.entries(report.categoryScores).map(([name, score]) => (
              <div key={name} className="py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{name}</p>
                  <Badge variant="outline">{score.score}/10</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{score.narrative}</p>
                {score.citations.length > 0 && (
                  <p className="mt-2 text-xs font-mono text-muted-foreground">{score.citations.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
