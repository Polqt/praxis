'use client'

import { motion } from 'framer-motion'
import { IconTargetArrow } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
import type { ScoreItem } from '@/features/reports/types'

type Props = {
  scores: ScoreItem[]
}

// Show a category in "almost there" if it missed the floor by ≤2 points
const NEAR_MISS_GAP = 2

export function SkillsNearMissSection({ scores }: Props) {
  const nearMiss = scores.filter(
    (s) =>
      s.minimumScore !== undefined &&
      s.score < s.minimumScore &&
      s.score >= s.minimumScore - NEAR_MISS_GAP,
  )

  if (nearMiss.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <IconTargetArrow size={15} className="text-amber-600 shrink-0" />
        <p className="text-xs uppercase tracking-widest font-semibold text-amber-700">Skills you almost earned</p>
      </div>
      <p className="text-xs text-amber-700 mb-3 leading-relaxed">
        These categories were within {NEAR_MISS_GAP} points of the required floor. Small improvements here would unlock the corresponding skill badge.
      </p>
      <div className="flex flex-col gap-2">
        {nearMiss.map((s) => {
          const gap = (s.minimumScore ?? 0) - s.score
          return (
            <div key={s.category} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-amber-900">{s.category}</span>
              <span className="text-xs text-amber-700 tabular-nums shrink-0">
                {s.score}/{s.minimumScore} — {gap} point{gap !== 1 ? 's' : ''} short
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
