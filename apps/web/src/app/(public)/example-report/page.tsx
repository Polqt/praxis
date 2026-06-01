import { exampleReport } from '@/features/reports/constants'
import { ReportClient } from '@/features/reports/components/report-client'

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
