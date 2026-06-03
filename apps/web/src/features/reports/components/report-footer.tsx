'use client'

import { formatDate } from '@/lib/praxis-format'

type Props = {
  repositoryName: string
  commitSha: string
  challengeTitle: string
  generatedAt: string
  modelVersion: string
}

export function ReportFooter({ repositoryName, commitSha, challengeTitle, generatedAt, modelVersion }: Props) {
  const shortSha = commitSha.slice(0, 7)
  const commitUrl = repositoryName && commitSha
    ? `https://github.com/${repositoryName}/commit/${commitSha}`
    : null

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4">
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Repository</p>
        <a
          href={`https://github.com/${repositoryName}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-mono hover:underline"
        >
          {repositoryName}
        </a>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Commit</p>
        {commitUrl ? (
          <a href={commitUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono hover:underline">
            {shortSha}
          </a>
        ) : (
          <p className="text-[11px] font-mono">{shortSha}</p>
        )}
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Challenge</p>
        <p className="text-[11px]">{challengeTitle}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Generated</p>
        <p className="text-[11px]" suppressHydrationWarning>{formatDate(generatedAt)}</p>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">Analyzer</p>
        <p className="text-[11px] font-mono">{modelVersion}</p>
      </div>
    </div>
  )
}
