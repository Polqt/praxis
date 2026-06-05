import type { Metadata } from 'next'
import { exampleReport } from '@/features/reports/constants'
import { ReportClient } from '@/features/reports/components/report-client'

export const metadata: Metadata = {
  title: 'Example Verification Report | Praxis',
  description: 'See what a Praxis verification report looks like: scores, narratives, evidence citations, and actionable feedback across all rubric categories.',
}

export default function ExampleReportPage() {
  return (
    <div className="pt-14">
      <ReportClient
        report={exampleReport}
      />
    </div>
  )
}
