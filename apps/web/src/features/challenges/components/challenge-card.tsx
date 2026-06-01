'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_BADGE_CLASS, DIFFICULTY_LABEL } from '@/features/challenges/constants'
import type { Challenge } from '@/features/challenges/types'

type Props = {
  challenge: Challenge
  isAuthenticated: boolean
}

export function ChallengeCard({ challenge, isAuthenticated }: Props) {
  const href = isAuthenticated
    ? `/challenges/${challenge.slug}`
    : `/sign-in?redirect=/challenges/${challenge.slug}`

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-foreground">{challenge.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
      </div>
      <div className="px-5 py-3 border-t border-border/60 flex items-center gap-4">
        <div className="flex-1 flex items-center flex-wrap gap-1.5">
          {challenge.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
        <Badge
          className={`shrink-0 border text-[11px] ${DIFFICULTY_BADGE_CLASS[challenge.difficulty]}`}
        >
          {DIFFICULTY_LABEL[challenge.difficulty]}
        </Badge>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={href}>View challenge</Link>
        </Button>
      </div>
    </div>
  )
}
