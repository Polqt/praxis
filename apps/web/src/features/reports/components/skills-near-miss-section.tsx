'use client'

import { motion } from 'framer-motion'
import { IconTargetArrow } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
import { SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { SCORE_MID_THRESHOLD } from '@/features/reports/utils/score-color'
import type { ScoreItem } from '@/features/reports/types'

type Props = {
  scores: ScoreItem[]
}

const LOW_SCORE_THRESHOLD = SCORE_MID_THRESHOLD - 2

type ProgressItem = { score: ScoreItem; reason: 'floor-missed' | 'low-score' }

function collectProgressItems(scores: ScoreItem[]): ProgressItem[] {
  const items: ProgressItem[] = []
  for (const score of scores) {
    const floor = score.minimumScore ?? 0
    if (floor > 0 && score.score < floor) {
      items.push({ score, reason: 'floor-missed' })
    } else if (floor === 0 && score.score <= LOW_SCORE_THRESHOLD) {
      items.push({ score, reason: 'low-score' })
    }
  }
  return items
}

export function SkillsNearMissSection({ scores }: Props) {
  const items = collectProgressItems(scores)
  if (items.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="mt-6 rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <IconTargetArrow size={14} className="text-muted-foreground shrink-0" />
        <p className={SECTION_LABEL_CLASS}>Skill progress</p>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Categories that need improvement to unlock verified skill badges.
      </p>
      <div className="flex flex-col">
        {items.map(({ score, reason }) => (
          <div key={score.category} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <span className="text-sm font-medium">{score.category}</span>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {reason === 'floor-missed'
                ? `${score.score}/10, needs ${score.minimumScore}/10`
                : `${score.score}/10, low score`}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
