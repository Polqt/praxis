'use client'

import { Progress } from '@/components/ui/progress'
import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'
import type { StudioStats } from '@/features/studio/types'

type Props = {
  stats: StudioStats
}

export function VerificationProgressSection({ stats }: Props) {
  const { challengesCompleted, verifiedSkillsCount, reportsGenerated, totalChallenges } = stats
  const progressPct = totalChallenges > 0
    ? Math.round((challengesCompleted / totalChallenges) * 100)
    : 0

  return (
    <div className="mt-10">
      <p className={`${SECTION_LABEL} mb-4`}>Verification progress</p>
      <div className="rounded-lg bg-muted/40 p-5">
        <div className="flex items-start divide-x divide-border">
          <div className="pr-6">
            <p className="text-2xl font-semibold tabular-nums">{challengesCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">Challenges completed</p>
          </div>
          <div className="px-6">
            <p className="text-2xl font-semibold tabular-nums">{verifiedSkillsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Verified skills</p>
          </div>
          <div className="px-6">
            <p className="text-2xl font-semibold tabular-nums">{reportsGenerated}</p>
            <p className="text-xs text-muted-foreground mt-1">Reports generated</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4">
          <Progress value={progressPct} className="h-[3px] flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {challengesCompleted} of {totalChallenges} challenges
          </span>
        </div>
      </div>
    </div>
  )
}
