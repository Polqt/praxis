'use client'

import { IconArrowUpRight, IconArrowRight } from '@tabler/icons-react'

type ItemListProps = {
  items: string[]
  icon: React.ReactNode
  empty: string
}

function ItemList({ items, icon, empty }: ItemListProps) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {icon}
          <span className="text-sm">{item}</span>
        </div>
      ))}
    </div>
  )
}

type Props = {
  strengths: string[]
  improvements: string[]
  derived: boolean
}

export function StrengthsImprovementsSection({ strengths, improvements, derived }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-lg border bg-card p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Strengths</p>
        {derived && <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>}
        {!derived && <div className="mb-3" />}
        <ItemList
          items={strengths}
          icon={<IconArrowUpRight size={14} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2} />}
          empty="None identified."
        />
      </div>
      <div className="rounded-lg border bg-card p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Improvements</p>
        {derived && <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>}
        {!derived && <div className="mb-3" />}
        <ItemList
          items={improvements}
          icon={<IconArrowRight size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />}
          empty="None identified."
        />
      </div>
    </div>
  )
}
