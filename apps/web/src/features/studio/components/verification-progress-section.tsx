'use client'

import { Progress } from '@/components/ui/progress'
import type { StudioStats } from '@/features/studio/types'

const SECTION_LABEL = 'VERIFICATION PROGRESS'

type Props = {
  stats: StudioStats
}

export function VerificationProgressSection({ stats }: Props) {
  const { challengesCompleted, verifiedSkillsCount, reportsGenerated, totalChallenges } = stats
  const progressPct = totalChallenges > 0
    ? Math.round((challengesCompleted / totalChallenges) * 100)
    : 0

  return (
    <div className="mb-10">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
        {SECTION_LABEL}
      </p>
      <div className="rounded-lg bg-muted/30 p-5 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-medium text-foreground tabular-nums">{challengesCompleted}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Challenges completed</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground tabular-nums">{verifiedSkillsCount}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Verified skills</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground tabular-nums">{reportsGenerated}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Reports generated</p>
          </div>
        </div>
      </div>
      <Progress value={progressPct} className="mb-1.5" />
      <p className="text-[13px] text-muted-foreground">{progressPct}% verified</p>
    </div>
  )
}
