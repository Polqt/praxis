'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_CLASS, DIFFICULTY_LABEL } from '@/features/challenges/constants'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import { stripMarkdown } from '@/features/challenges/utils'
import { fadeUp } from '@/lib/animations'
import type { Challenge } from '@/features/challenges/types'

type Props = {
  challenge: Challenge
  isAuthenticated: boolean
}

export function ChallengeCard({ challenge, isAuthenticated }: Props) {
  const ctaHref = isAuthenticated
    ? `/submit?challengeId=${challenge.id}`
    : buildAuthRedirect(`/submit?challengeId=${challenge.id}`)
  const ctaLabel = isAuthenticated ? 'Submit repository' : 'Start verification'

  return (
    <motion.div variants={fadeUp} className="rounded-lg border bg-card">
      <div className="px-5 py-4">
        <p className="text-sm font-semibold">{challenge.title}</p>
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
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </motion.div>
  )
}
