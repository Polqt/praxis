'use client'

import { formatDate } from "@/lib/praxis-format"


type Props = {
  repositoryName: string
  commitSha: string
  challengeTitle: string
  generatedAt: string
  modelVersion: string
}

export function ReportFooter({ repositoryName, commitSha, challengeTitle, generatedAt, modelVersion }: Props) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4">
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Repository</p>
        <p className="text-[11px] font-mono">{repositoryName}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Commit</p>
        <p className="text-[11px] font-mono">{commitSha.slice(0, 7)}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Challenge</p>
        <p className="text-[11px]">{challengeTitle}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Generated</p>
        <p className="text-[11px]">{formatDate(generatedAt)}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Model</p>
        <p className="text-[11px] font-mono">{modelVersion}</p>
      </div>
    </div>
  )
}
