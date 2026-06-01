'use client'

import { IconCheck } from '@tabler/icons-react'
import { STATUS_CONFIG } from '@/features/reports/constants'
import type { ReportStatus } from '@/features/reports/types'

type Props = {
  repositoryName: string
  challengeTitle: string
  status: ReportStatus
  compositeScore: number
}

export function ReportHero({ repositoryName, challengeTitle, status, compositeScore }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Verification Report
        </p>
        <h1 className="text-2xl font-semibold tracking-tight font-mono truncate">
          {repositoryName}
        </h1>
        <p className="text-base text-muted-foreground mt-1">{challengeTitle}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${config.className}`}
        >
          {status === 'verified' && <IconCheck size={14} strokeWidth={2.5} />}
          {config.label}
        </span>
        <span className="text-2xl font-semibold tabular-nums text-muted-foreground">
          {compositeScore}
          <span className="text-sm font-medium text-muted-foreground/60">/100</span>
        </span>
      </div>
    </div>
  )
}
