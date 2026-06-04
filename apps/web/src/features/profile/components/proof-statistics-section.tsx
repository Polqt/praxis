'use client'

type Props = {
  verifiedCount: number
  publishedReportsCount: number
  needsImprovementCount: number
  skillsCount: number
}

export function ProofStatisticsSection({ verifiedCount, publishedReportsCount, needsImprovementCount, skillsCount }: Props) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Statistics</p>
      <div className="flex items-start divide-x divide-border">
        <div className="pr-8">
          <p className="text-2xl font-semibold tabular-nums">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified projects</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{publishedReportsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Published reports</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{needsImprovementCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Needs improvement</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{skillsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified skills</p>
        </div>
      </div>
    </div>
  )
}
