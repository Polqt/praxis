'use client'

import Link from 'next/link'
import { IconClock } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { statusConfig, IN_PROGRESS_STATUSES } from '@/features/submissions/constants/status-config'
import type { ProjectSubmission } from '@praxis/shared'

const SECTION_LABEL = 'LATEST SUBMISSION'

const TERMINAL_STATUSES = ['verified', 'insufficient', 'failed'] as const
type TerminalStatus = typeof TERMINAL_STATUSES[number]

function isTerminal(status: string): status is TerminalStatus {
  return TERMINAL_STATUSES.includes(status as TerminalStatus)
}

type Props = {
  submission: ProjectSubmission | null
}

export function LatestSubmissionSection({ submission }: Props) {
  return (
    <div className="mb-10">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
        {SECTION_LABEL}
      </p>
      {submission ? (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-foreground font-mono truncate mb-0.5">
                {submission.githubRepoFullName}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {submission.rubricVersion ? `v${submission.rubricVersion}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${statusConfig[submission.status].className}`}
              >
                {statusConfig[submission.status].label}
              </span>
              {isTerminal(submission.status) && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/reports/${submission.id}`}>View report</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 flex flex-col items-center gap-3 text-center">
          <IconClock size={20} className="text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">
            No submissions yet. Verify your first project to get started.
          </p>
        </div>
      )}
    </div>
  )
}
