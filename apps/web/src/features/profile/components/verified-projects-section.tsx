'use client'

import Link from 'next/link'
import { IconFolder } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { resolveReportLink } from '@/features/profile/utils/resolve-report-link'
import type { ProfileReport } from '@/features/profile/types'
import type { User } from '@praxis/shared'
import { formatDate } from '@/lib/praxis-format'
import { VERDICT_CLASS } from '../constants'

type Props = {
  reports: ProfileReport[]
  profileUsername: string
  viewingUser: User | null
}

export function VerifiedProjectsSection({ reports, profileUsername, viewingUser }: Props) {
  const verified = reports.filter((r) => r.submissionStatus === 'verified')
  const insufficient = reports.filter((r) => r.submissionStatus === 'insufficient')

  return (
    <div className="flex flex-col gap-6">
      <Section
        label="Verified projects"
        reports={verified}
        profileUsername={profileUsername}
        viewingUser={viewingUser}
        emptyText="No verified projects yet."
      />
      {insufficient.length > 0 && (
        <Section
          label="Needs improvement"
          reports={insufficient}
          profileUsername={profileUsername}
          viewingUser={viewingUser}
          emptyText=""
          muted
        />
      )}
    </div>
  )
}

type SectionProps = {
  label: string
  reports: ProfileReport[]
  profileUsername: string
  viewingUser: User | null
  emptyText: string
  muted?: boolean
}

function Section({ label, reports, profileUsername, viewingUser, emptyText, muted }: SectionProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
      {reports.length === 0 ? (
        emptyText ? (
          <div className="rounded-lg border border-dashed flex flex-col items-center justify-center py-8 gap-2">
            <IconFolder size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : null
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const reportLink = resolveReportLink(report, profileUsername, viewingUser)
            return (
              <div key={report.id} className={`rounded-lg border bg-card ${muted ? 'opacity-70' : ''}`}>
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
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>{formatDate(report.verifiedAt)}</span>
                  </div>
                  {reportLink && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 shrink-0" asChild>
                      <Link href={reportLink}>View report</Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
