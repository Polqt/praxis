'use client'

import { motion } from 'framer-motion'
import { IconTargetArrow } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
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
    <motion.div variants={fadeUp} className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <IconTargetArrow size={15} className="text-amber-600 shrink-0" />
        <p className="text-xs uppercase tracking-widest font-semibold text-amber-700">Skill progress</p>
      </div>
      <p className="text-xs text-amber-700 mb-3 leading-relaxed">
        These categories blocked verification or scored low. Improve them to raise your score and unlock verified skill badges.
      </p>
      <div className="flex flex-col gap-2">
        {items.map(({ score, reason }) => (
          <div key={score.category} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-amber-900">{score.category}</span>
            <span className="text-xs text-amber-700 tabular-nums shrink-0">
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
