'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconSend } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, isTerminalSubmission, repoName, statusLabel } from '@/lib/praxis-format'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { ProjectSubmission, SubmissionStatus } from '@praxis/shared'

const TERMINAL_STATUSES: SubmissionStatus[] = ['verified', 'insufficient', 'failed', 'expired']

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const label = statusLabel(status)
  const isActive = IN_PROGRESS_STATUSES.includes(status)

  if (status === 'verified') {
    return (
      <Badge className="rounded bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'insufficient') {
    return (
      <Badge className="rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'failed' || status === 'expired') {
    return (
      <Badge variant="destructive" className="rounded text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (isActive) {
    return (
      <Badge variant="secondary" className="rounded text-[11px] font-medium gap-1.5">
        <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="rounded text-[11px] font-medium">
      {label}
    </Badge>
  )
}

type FilterTab = 'all' | 'verified' | 'in-progress' | 'failed'

function filterSubmissions(submissions: ProjectSubmission[], tab: FilterTab): ProjectSubmission[] {
  if (tab === 'verified') return submissions.filter((s) => s.status === 'verified')
  if (tab === 'in-progress') return submissions.filter((s) => IN_PROGRESS_STATUSES.includes(s.status))
  if (tab === 'failed') return submissions.filter((s) => s.status === 'failed' || s.status === 'insufficient')
  return submissions
}

type CardProps = {
  submission: ProjectSubmission
  index: number
}

function SubmissionCard({ submission, index }: CardProps) {
  const router = useRouter()
  const isActive = IN_PROGRESS_STATUSES.includes(submission.status)
  const isTerminal = TERMINAL_STATUSES.includes(submission.status)
  const delay = Math.min(index * 50, 400)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/submissions/${submission.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/submissions/${submission.id}`)}
      className={[
        'rounded-lg border bg-card px-5 py-4',
        'hover:bg-accent/30 transition-colors duration-150 cursor-pointer',
        'animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
        isActive ? 'border-l-2 border-l-primary' : '',
      ].join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium truncate">
            {repoName(submission.githubRepoFullName)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build a Production REST API
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(submission.submittedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={submission.status} />
          {isTerminal && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/reports/${submission.id}`}>View report</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

type Props = {
  submissions: ProjectSubmission[]
}

export function SubmissionsClient({ submissions }: Props) {
  const [tab, setTab] = useState<FilterTab>('all')
  const filtered = filterSubmissions(submissions, tab)

  return (
    <div className="px-10 py-10 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track every repository submitted for verification.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/challenges">Submit repository</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="bg-transparent p-0 h-auto gap-0 border-0">
          {(['all', 'verified', 'in-progress', 'failed'] as const).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="px-4 py-2 text-xs font-medium capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none"
            >
              {t === 'in-progress' ? 'In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator className="mt-0" />
      </Tabs>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <IconSend size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/challenges">Browse challenges</Link>
            </Button>
          </div>
        ) : (
          filtered.map((submission, i) => (
            <SubmissionCard key={submission.id} submission={submission} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
