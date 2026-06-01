'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG, TERMINAL_STATUSES } from '@/features/submissions/constants'
import type { Submission } from '@/features/submissions/types'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

type Props = {
  submission: Submission
}

export function SubmissionMetadataCard({ submission }: Props) {
  const config = STATUS_CONFIG[submission.status]
  const isTerminal = TERMINAL_STATUSES.includes(submission.status)

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-4 border-b">
        <p className="font-medium font-mono text-sm">{submission.repositoryName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{submission.challengeTitle}</p>
      </div>

      <div className="px-4 py-4 space-y-3 border-b">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Repository</span>
          <a
            href={submission.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground hover:underline truncate text-right"
          >
            {submission.repositoryName}
          </a>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Challenge</span>
          <span className="text-xs font-medium text-right">{submission.challengeTitle}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Branch</span>
          <span className="text-xs font-mono text-right">{submission.branch}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Commit</span>
          <span className="text-xs font-mono text-right truncate max-w-[140px]">
            {submission.commitSha.slice(0, 7)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Submitted</span>
          <span className="text-xs text-right">{formatDateTime(submission.createdAt)}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground shrink-0">Status</span>
          <span
            className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${config.className}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        {isTerminal ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/reports/${submission.id}`}>View report</Link>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Analysis in progress</p>
        )}
      </div>
    </div>
  )
}
