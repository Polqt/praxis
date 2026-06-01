'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ProfileReport } from '@/features/profile/types'
import { formatDate } from '@/lib/praxis-format'
import { VERDICT_CLASS } from '../constants'

type Props = {
  reports: ProfileReport[]
}

export function VerifiedProjectsSection({ reports }: Props) {
  return (
    <div>
      <p className={`text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3`}>Verified projects</p>
      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verified projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border bg-card">
              <div className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium font-mono truncate">{report.repositoryName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.challengeTitle}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${VERDICT_CLASS[report.verdict] ?? 'text-muted-foreground bg-muted border-border'}`}
                >
                  {report.verdict}
                </span>
              </div>
              <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground capitalize">{report.challengeCategory}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(report.verifiedAt)}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 shrink-0" asChild>
                  <Link href={`/reports/${report.submissionId}`}>View report</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
