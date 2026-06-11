import { IconCircleCheckFilled, IconCircleDashed } from '@tabler/icons-react'
import { Progress } from '@/components/ui/progress'
import { SECTION_LABEL_CLASS } from '../constants'
import type { SkillProgressItem } from '../types'

type Props = {
  items: SkillProgressItem[]
}

export function SkillProgressSection({ items }: Props) {
  if (items.length === 0) return null

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
              <div className="flex items-center gap-3 mb-2">
                {item.eligible ? (
                  <IconCircleCheckFilled size={14} className={`shrink-0 ${item.awarded ? 'text-green-500' : 'text-amber-500'}`} />
                ) : (
                  <IconCircleDashed size={14} className="shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.name}</span>
                <span className={[
                  'shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest',
                  item.awarded
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : item.eligible
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-muted text-muted-foreground border-border',
                ].join(' ')}>
                  {item.awarded ? 'Awarded' : item.eligible ? 'Eligible' : `+${item.pointsNeeded}`}
                </span>
              </div>
              <div className="pl-6.5 flex items-center gap-2">
                <Progress
                  value={scorePercent}
                  className={`h-1 flex-1 *:data-[slot=progress-indicator]:transition-none ${
                    item.awarded
                      ? '*:data-[slot=progress-indicator]:bg-green-500'
                      : item.eligible
                        ? '*:data-[slot=progress-indicator]:bg-amber-500'
                        : '*:data-[slot=progress-indicator]:bg-muted-foreground/40'
                  }`}
                />
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 w-14 text-right">
                  {item.score}/10 min {item.minimumScore}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
