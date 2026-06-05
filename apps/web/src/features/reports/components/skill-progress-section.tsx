import { IconCircleCheckFilled, IconCircleDashed } from '@tabler/icons-react'
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
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-4 px-4 py-3">
            {item.eligible ? (
              <IconCircleCheckFilled size={15} className={item.awarded ? 'text-green-500' : 'text-amber-500'} />
            ) : (
              <IconCircleDashed size={15} className="text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.score}/10 / minimum {item.minimumScore}/10
              </p>
            </div>
            <span className={[
              'shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest',
              item.awarded
                ? 'bg-green-100 text-green-700 border-green-200'
                : item.eligible
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-muted text-muted-foreground border-border',
            ].join(' ')}>
              {item.awarded ? 'Awarded' : item.eligible ? 'Eligible' : `Needs +${item.pointsNeeded}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
