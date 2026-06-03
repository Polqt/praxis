'use client'

import { deriveEngineerTitle } from '../utils/derive-engineer-title'

type Props = {
  username: string
  verifiedSkills: string[]
  reportsCount: number
  verificationsCount: number
}

export function ProfileHero({ username, verifiedSkills, reportsCount, verificationsCount }: Props) {
  const title = deriveEngineerTitle(verifiedSkills)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">@{username}</h1>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      <div className="flex items-center gap-3 mt-4">
        <StatPill value={verifiedSkills.length} label="Skills" />
        <StatPill value={verificationsCount} label="Verifications" />
        <StatPill value={reportsCount} label="Reports" />
      </div>
    </div>
  )
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-1.5">
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
