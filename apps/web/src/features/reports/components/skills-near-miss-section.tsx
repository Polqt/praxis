'use client'

import { motion } from 'framer-motion'
import { IconTargetArrow } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
import type { ScoreItem } from '@/features/reports/types'

type Props = {
  scores: ScoreItem[]
}

// Near floor miss: scored below the minimum but within this many points
const NEAR_FLOOR_GAP = 2
// Low score threshold for floor-0 categories — anything at or below this is surfaced
const LOW_SCORE_THRESHOLD = 4

type NearMissItem = { score: ScoreItem; reason: 'near-floor' | 'low-score' }

function collectNearMiss(scores: ScoreItem[]): NearMissItem[] {
  const items: NearMissItem[] = []
  for (const s of scores) {
    const floor = s.minimumScore ?? 0
    if (floor > 0 && s.score < floor && s.score >= floor - NEAR_FLOOR_GAP) {
      items.push({ score: s, reason: 'near-floor' })
    } else if (floor === 0 && s.score <= LOW_SCORE_THRESHOLD) {
      items.push({ score: s, reason: 'low-score' })
    }
  }
  return items
}

export function SkillsNearMissSection({ scores }: Props) {
  const items = collectNearMiss(scores)
  if (items.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <IconTargetArrow size={15} className="text-amber-600 shrink-0" />
        <p className="text-xs uppercase tracking-widest font-semibold text-amber-700">Areas to improve</p>
      </div>
      <p className="text-xs text-amber-700 mb-3 leading-relaxed">
        These categories scored low. Small improvements here would raise your composite score and unlock skill badges where applicable.
      </p>
      <div className="flex flex-col gap-2">
        {items.map(({ score: s, reason }) => (
          <div key={s.category} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-amber-900">{s.category}</span>
            <span className="text-xs text-amber-700 tabular-nums shrink-0">
              {reason === 'near-floor'
                ? `${s.score}/${s.minimumScore} — ${(s.minimumScore ?? 0) - s.score} point${(s.minimumScore ?? 0) - s.score !== 1 ? 's' : ''} below floor`
                : `${s.score}/10 — low score`}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
