'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG } from '@/features/submissions/constants'
import type { Submission } from '@/features/submissions/types'

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

type Props = {
  submission: Submission
}

export function SubmissionCard({ submission }: Props) {
  const config = STATUS_CONFIG[submission.status]

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium font-mono text-sm truncate">{submission.repositoryName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{submission.challengeCategory}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{submission.challengeTitle}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${config.className}`}
        >
          {submission.status === 'verified' ? `✓ ${config.label}` : config.label}
        </span>
      </div>
      <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">
            Submitted {relativeDate(submission.createdAt)}
          </p>
          {submission.lastAnalyzedAt && (
            <p className="text-xs text-muted-foreground">
              Analyzed {relativeDate(submission.lastAnalyzedAt)}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={`/submissions/${submission.id}`}>View report</Link>
        </Button>
      </div>
    </div>
  )
}
