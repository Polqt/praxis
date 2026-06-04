'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'
import type { ScoreItem } from '@/features/reports/types'

type SkillTier = 'gold' | 'standard' | 'muted'

const TIER_CLASS: Record<SkillTier, string> = {
  gold: 'border-amber-400 bg-amber-50 text-amber-900',
  standard: 'border-border bg-card text-foreground',
  muted: 'border-muted bg-muted/40 text-muted-foreground',
}

const ICON_CLASS: Record<SkillTier, string> = {
  gold: 'text-amber-500',
  standard: 'text-green-500',
  muted: 'text-muted-foreground',
}

function getTier(skillName: string, scores: ScoreItem[]): SkillTier {
  const match = scores.find((s) => s.category.toLowerCase() === skillName.toLowerCase())
  if (!match) return 'standard'
  if (match.score >= 8) return 'gold'
  if (match.score >= 6) return 'standard'
  return 'muted'
}

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
            const tier = getTier(skill, scores)
            return (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${TIER_CLASS[tier]}`}
              >
                <IconCircleCheckFilled size={13} className={`shrink-0 ${ICON_CLASS[tier]}`} />
                {skill}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
