'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconSend } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { SubmissionCard } from '@/features/submissions/components/submission-card'
import { SubmissionCardActive } from '@/features/submissions/components/submission-card-active'
import {
  FILTER_BUCKETS,
  STATUS_TO_FILTER,
  IN_PROGRESS_STATUSES,
} from '@/features/submissions/constants'
import type { Submission, FilterBucket } from '@/features/submissions/types'

type Props = {
  submissions: Submission[]
}

export function SubmissionsClient({ submissions }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterBucket>('all')

  const filtered =
    activeFilter === 'all'
      ? submissions
      : submissions.filter((s) => STATUS_TO_FILTER[s.status] === activeFilter)

  return (
    <div className="px-12 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track every repository you have submitted for verification.
        </p>
      </div>

      <div className="flex items-center gap-1 mb-6 p-1 bg-muted rounded-md w-fit">
        {FILTER_BUCKETS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={[
              'px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
              activeFilter === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconSend size={24} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/challenges">Browse challenges</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((submission) =>
            IN_PROGRESS_STATUSES.includes(submission.status) ? (
              <SubmissionCardActive key={submission.id} submission={submission} />
            ) : (
              <SubmissionCard key={submission.id} submission={submission} />
            )
          )}
        </div>
      )}
    </div>
  )
}
