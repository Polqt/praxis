'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconCircleCheck } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_CLASS, DIFFICULTY_LABEL } from '@/features/challenges/constants'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import { stripMarkdown } from '@/features/challenges/utils'
import { fadeUp } from '@/lib/animations'
import type { Challenge } from '@/features/challenges/types'

type SubmissionStatus = 'verified' | 'in-progress' | 'attempted'

type Props = {
  challenge: Challenge
  isAuthenticated: boolean
  submissionStatus?: SubmissionStatus
}

const STATUS_BADGE: Record<SubmissionStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200' },
  'in-progress': { label: 'In progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  attempted: { label: 'Attempted', className: 'bg-muted text-muted-foreground border-border' },
}

export function ChallengeCard({ challenge, isAuthenticated, submissionStatus }: Props) {
  const ctaHref = isAuthenticated
    ? `/submit?challengeId=${challenge.id}`
    : buildAuthRedirect(`/submit?challengeId=${challenge.id}`)

  const isVerified = submissionStatus === 'verified'
  const statusBadge = submissionStatus ? STATUS_BADGE[submissionStatus] : null

  return (
    <motion.div variants={fadeUp} className={`rounded-lg border bg-card ${isVerified ? 'border-green-200' : ''}`}>
      <div className="px-5 py-4">
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
      <div className="px-5 py-3 border-t border-border/60 flex items-center gap-4">
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
        <Button variant={isVerified ? 'ghost' : 'outline'} size="sm" asChild className="shrink-0">
          <Link href={ctaHref}>
            {isVerified ? 'Submit again' : isAuthenticated ? 'Submit repository' : 'Start verification'}
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
