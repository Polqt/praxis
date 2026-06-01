'use client'

import { scoreBarColor, CATEGORY_STATUS_CLASS } from '@/features/reports/constants'
import type { ScoreItem } from '@/features/reports/types'

const SECTION_LABEL = 'text-xs font-medium uppercase tracking-widest text-muted-foreground'

type Props = {
  scores: ScoreItem[]
}

export function ScoreOverview({ scores }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-5`}>Rubric results</p>
      <div className="flex flex-col">
        {scores.map((item, i) => (
          <div key={item.category}>
            {i > 0 && <hr className="border-border my-5" />}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium flex-1">{item.category}</span>
              {item.status && (
                <span
                  className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${CATEGORY_STATUS_CLASS[item.status]}`}
                >
                  {item.status}
                </span>
              )}
              <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
                {item.score}/10
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-muted overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${scoreBarColor(item.score)}`}
                style={{ width: `${(item.score / 10) * 100}%` }}
              />
            </div>
            {item.narrative && (
              <p className="text-sm text-foreground leading-relaxed mb-2">{item.narrative}</p>
            )}
            {item.citations.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Evidence found
                </p>
                <div className="flex flex-col gap-0.5">
                  {item.citations.map((file) => (
                    <span key={file} className="text-[11px] font-mono text-muted-foreground">
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
