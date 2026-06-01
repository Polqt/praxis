'use client'

import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'
import { scoreColorClass } from '@/features/reports/constants'
import type { ScoreItem } from '@/features/reports/types'

type Props = {
  scores: ScoreItem[]
}

export function ScoreOverview({ scores }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-4`}>Scores</p>
      <div className="flex flex-col gap-3">
        {scores.map((item) => (
          <div key={item.category} className="flex items-center gap-4">
            <span className="text-sm font-medium w-44 shrink-0 truncate">{item.category}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreColorClass(item.score)}`}
                style={{ width: `${(item.score / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
              {item.score}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
