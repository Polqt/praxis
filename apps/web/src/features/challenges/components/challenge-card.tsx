'use client'

import Link from 'next/link'
import {
  IconArrowRight,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CHALLENGE_STATUS_BADGE,
  DIFFICULTY_CLASS,
  DIFFICULTY_LABEL,
} from '@/features/challenges/constants'
import { stripMarkdown } from '@/features/challenges/utils'
import type {
  Challenge,
  ChallengeSubmissionStatus,
} from '@/features/challenges/types'

type Props = {
  challenge: Challenge
  submissionStatus?: ChallengeSubmissionStatus
}

export function ChallengeCard({ challenge, submissionStatus }: Props) {
  const isVerified = submissionStatus === 'verified'
  const statusBadge = submissionStatus
    ? CHALLENGE_STATUS_BADGE[submissionStatus]
    : null
  const detailHref = `/challenges/${challenge.id}`

  return (
    <article
      className={`group relative rounded-lg border bg-card transition-colors hover:bg-accent/30 ${
        isVerified ? 'border-green-200' : ''
      }`}
    >
      <Link
        href={detailHref}
        aria-label={`View ${challenge.title} challenge`}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="pointer-events-none relative px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold">{challenge.title}</p>
          {statusBadge && (
            <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${statusBadge.className}`}>
              {isVerified && <IconCircleCheck size={10} strokeWidth={2.5} />}
              {statusBadge.label}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{stripMarkdown(challenge.description)}</p>
      </div>
      <div className="pointer-events-none relative flex items-center gap-4 border-t border-border/60 px-5 py-3">
        <div className="flex-1 flex flex-wrap gap-1.5">
          {challenge.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
        <span
          className={`shrink-0 text-[11px] font-medium px-2 py-0.5 border rounded-sm ${DIFFICULTY_CLASS[challenge.difficulty]}`}
        >
          {DIFFICULTY_LABEL[challenge.difficulty]}
        </span>
        <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:inline-flex">
          View details
          <IconArrowRight size={13} />
        </span>
        <Button
          variant={isVerified ? 'ghost' : 'outline'}
          size="sm"
          asChild
          className="pointer-events-auto relative z-10 shrink-0"
        >
          <Link href={`/submit?challengeId=${challenge.id}`}>
            {isVerified ? 'Submit again' : 'Submit repository'}
          </Link>
        </Button>
      </div>
    </article>
  )
}
