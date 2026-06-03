'use client'

type Props = {
  verifiedCount: number
  skillsCount: number
  challengesCompleted: number
}

export function ProofStatisticsSection({ verifiedCount, skillsCount, challengesCompleted }: Props) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Statistics</p>
      <div className="flex items-start divide-x divide-border">
        <div className="pr-8">
          <p className="text-2xl font-semibold tabular-nums">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{skillsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Skills earned</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{challengesCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">Challenges completed</p>
        </div>
      </div>
    </div>
  )
}
