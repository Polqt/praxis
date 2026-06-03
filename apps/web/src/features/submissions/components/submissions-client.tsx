'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconSend } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { repoName } from '@/lib/praxis-format'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import { StatusBadge } from '@/features/submissions/components/status-badge'
import { FormattedDate } from '@/components/ui/formatted-date'
import type { ProjectSubmission } from '@praxis/shared'

type FilterTab = 'all' | 'verified' | 'in-progress' | 'failed'

function filterSubmissions(submissions: ProjectSubmission[], tab: FilterTab): ProjectSubmission[] {
  if (tab === 'verified') return submissions.filter((s) => s.status === 'verified')
  if (tab === 'in-progress') return submissions.filter((s) => IN_PROGRESS_STATUSES.includes(s.status))
  if (tab === 'failed') return submissions.filter((s) =>
    ['failed', 'insufficient', 'ingestion_failed', 'analysis_failed', 'report_generation_failed'].includes(s.status)
  )
  return submissions
}

function SubmissionCard({ submission }: { submission: ProjectSubmission }) {
  const router = useRouter()
  const isActive = IN_PROGRESS_STATUSES.includes(submission.status)

  return (
    <motion.div
      variants={fadeUp}
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/submissions/${submission.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/submissions/${submission.id}`)}
      className={[
        'rounded-lg border bg-card px-5 py-4',
        'hover:bg-accent/30 transition-colors duration-150 cursor-pointer',
        isActive ? 'border-l-2 border-l-primary' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium truncate">{repoName(submission.githubRepoFullName)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{submission.githubRepoFullName}</p>
          <p className="text-xs text-muted-foreground mt-0.5"><FormattedDate value={submission.submittedAt} /></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={submission.status} />
          {(submission.status === 'verified' || submission.status === 'insufficient') && (
            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <Link href={`/reports/${submission.id}`}>View report</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
]

export function SubmissionsClient({ submissions }: { submissions: ProjectSubmission[] }) {
  const [tab, setTab] = useState<FilterTab>('all')
  const filtered = filterSubmissions(submissions, tab)

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Track every repository submitted for verification.</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/challenges">Submit repository</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="bg-transparent p-0 h-auto gap-0 border-0">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="px-4 py-2 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator className="mt-0" />
      </Tabs>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-4 flex flex-col gap-2"
      >
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 gap-3">
            <IconSend size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {tab === 'all' ? 'No submissions yet.' :
               tab === 'verified' ? 'No verified submissions yet.' :
               tab === 'in-progress' ? 'No submissions in progress.' :
               'No failed submissions.'}
            </p>
            {tab === 'all' && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/challenges">Browse challenges</Link>
              </Button>
            )}
          </motion.div>
        ) : (
          filtered.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))
        )}
      </motion.div>
    </div>
  )
}
