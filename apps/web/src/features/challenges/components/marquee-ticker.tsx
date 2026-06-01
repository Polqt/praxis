'use client'

import { MARQUEE_TEXT, MARQUEE_DURATION_S } from '@/features/challenges/constants'

export function MarqueeTicker() {
  return (
    <div className="w-full bg-foreground overflow-hidden" style={{ height: '36px' }}>
      <div
        className="flex items-center h-full whitespace-nowrap"
        style={{ animation: `marquee ${MARQUEE_DURATION_S}s linear infinite` }}
      >
        <span className="text-[11px] uppercase tracking-widest text-background/40 shrink-0">
          {MARQUEE_TEXT}
        </span>
        <span className="text-[11px] uppercase tracking-widest text-background/40 shrink-0" aria-hidden>
          {MARQUEE_TEXT}
        </span>
      </div>
    </div>
  )
}
