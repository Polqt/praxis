'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'
import { statusConfig } from '@/features/submissions/constants/status-config'
import type { ProjectSubmission } from '@praxis/shared'

const TERMINAL_STATUSES = ['verified', 'insufficient', 'failed'] as const

function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as typeof TERMINAL_STATUSES[number])
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

type Props = {
  submission: ProjectSubmission | null
}

export function LatestSubmissionSection({ submission }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-3`}>Latest submission</p>
      {submission ? (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium font-mono truncate">{submission.githubRepoFullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {submission.rubricVersion ? `v${submission.rubricVersion}` : '—'}
              </p>
            </div>
            <span
              className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm shrink-0 ${statusConfig[submission.status]?.className ?? 'text-muted-foreground bg-muted border-border'}`}
            >
              {statusConfig[submission.status]?.label ?? submission.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">{relativeDate(submission.submittedAt)}</span>
            {isTerminal(submission.status) && (
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" asChild>
                <Link href={`/reports/${submission.id}`}>View report</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      )}
    </div>
  )
}
