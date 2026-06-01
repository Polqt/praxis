'use client'

const SECTION_LABEL = 'text-xs font-medium uppercase tracking-widest text-muted-foreground'

type Props = {
  reportsCount: number
  skillsCount: number
  challengesCompleted: number
}

export function ProofStatisticsSection({ reportsCount, skillsCount, challengesCompleted }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-4`}>Statistics</p>
      <div className="flex items-start divide-x divide-border">
        <div className="pr-8">
          <p className="text-2xl font-semibold tabular-nums">{reportsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Reports</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{skillsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Skills</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{challengesCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">Challenges completed</p>
        </div>
      </div>
    </div>
  )
}
