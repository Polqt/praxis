import { Progress } from '@/components/ui/progress'
import { SECTION_LABEL_CLASS } from '../constants'
import type { SkillProgressItem } from '../types'

type Props = {
  items: SkillProgressItem[]
}

export function SkillProgressSection({ items }: Props) {
  if (items.length === 0) return null
  if (items.every((item) => item.awarded)) return null

  return (
    <div>
      <p className={`${SECTION_LABEL_CLASS} mb-1`}>Skill progress</p>
      <p className="text-xs text-muted-foreground mb-3">
        Skills can be eligible by category score before they are awarded on a verified report.
      </p>
      <div className="rounded-lg border divide-y divide-border">
        {items.map((item) => {
          const scorePercent = (item.score / 10) * 100
          return (
            <div key={item.name} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {item.score}/10 · min {item.minimumScore}
                </span>
              </div>
              <Progress
                value={scorePercent}
                className={`h-1 *:data-[slot=progress-indicator]:transition-none ${
                  item.awarded
                    ? '*:data-[slot=progress-indicator]:bg-green-500'
                    : item.eligible
                      ? '*:data-[slot=progress-indicator]:bg-amber-500'
                      : '*:data-[slot=progress-indicator]:bg-muted-foreground/40'
                }`}
              />
              {!item.awarded && (
                <p className="text-[11px] mt-1.5 text-muted-foreground">
                  {item.eligible
                    ? <span className="text-amber-600 font-medium">Eligible — awarded on a verified result</span>
                    : `+${item.pointsNeeded} point${item.pointsNeeded !== 1 ? 's' : ''} needed`
                  }
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
