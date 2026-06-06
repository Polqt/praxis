'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'
import {
  SKILL_TIER_CLASS,
  SKILL_TIER_ICON_CLASS,
} from '@/features/reports/constants'
import { getSkillTier } from '@/features/reports/utils/get-skill-tier'
import type { ScoreItem } from '@/features/reports/types'

type Props = {
  skills: string[]
  scores?: ScoreItem[]
}

export function VerifiedSkillsSection({ skills, scores = [] }: Props) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Verified skills</p>
      <p className="text-xs text-muted-foreground mb-3">Awarded for scoring above the floor threshold in each category.</p>
      {skills.length === 0 ? (
        <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Skills unlock when a submission is verified. Use the category progress below to see what still needs improvement.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const tier = getSkillTier(skill, scores)
            return (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${SKILL_TIER_CLASS[tier]}`}
              >
                <IconCircleCheckFilled size={13} className={`shrink-0 ${SKILL_TIER_ICON_CLASS[tier]}`} />
                {skill}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
