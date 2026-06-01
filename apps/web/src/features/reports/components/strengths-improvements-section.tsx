'use client'

import { IconArrowUpRight, IconArrowRight } from '@tabler/icons-react'
import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'

type Props = {
  strengths: string[]
  improvements: string[]
}

export function StrengthsImprovementsSection({ strengths, improvements }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-2 sm:grid-cols-1">
      <div>
        <p className={`${SECTION_LABEL} mb-4`}>Strengths</p>
        {strengths.length === 0 ? (
          <p className="text-sm text-muted-foreground">None identified.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {strengths.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <IconArrowUpRight
                  size={14}
                  className="text-green-500 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className={`${SECTION_LABEL} mb-4`}>Improvements</p>
        {improvements.length === 0 ? (
          <p className="text-sm text-muted-foreground">None identified.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <IconArrowRight
                  size={14}
                  className="text-amber-500 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
