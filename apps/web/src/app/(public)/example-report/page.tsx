import type { Metadata } from 'next'
import { exampleReport } from '@/features/reports/constants'
import { ReportClient } from '@/features/reports/components/report-client'

export const metadata: Metadata = {
  title: 'Example Verification Report | Praxis',
  description: 'See what a Praxis verification report looks like — scores, narratives, evidence citations, and actionable feedback across all rubric categories.',
}

export default function ExampleReportPage() {
  return (
    <div>
      <div className="w-full bg-muted/60 border-b border-border py-2.5">
        <p className="text-center text-xs text-muted-foreground">
          This is an example verification report. It does not represent a real submission.
        </p>
      </div>
      <ReportClient
        report={exampleReport}
        backHref="/challenges"
        backLabel="Back to challenges"
      />
    </div>
  )
}
