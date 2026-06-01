'use client'

import { IconArrowUpRight, IconArrowRight } from '@tabler/icons-react'


type Props = {
  strengths: string[]
  improvements: string[]
  derived: boolean
}

export function StrengthsImprovementsSection({ strengths, improvements, derived }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className={`text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1`}>Strengths</p>
        {derived && (
          <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>
        )}
        {!derived && <div className="mb-3" />}
        {strengths.length === 0 ? (
          <p className="text-sm text-muted-foreground">None identified.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {strengths.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <IconArrowUpRight size={14} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1`}>Improvements</p>
        {derived && (
          <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>
        )}
        {!derived && <div className="mb-3" />}
        {improvements.length === 0 ? (
          <p className="text-sm text-muted-foreground">None identified.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <IconArrowRight size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
