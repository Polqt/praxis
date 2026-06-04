'use client'

import { IconCheck } from '@tabler/icons-react'
import { STATUS_CONFIG } from '@/features/reports/constants'
import type { ReportStatus } from '@/features/reports/types'

const LANGUAGE_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
}

type Props = {
  repositoryName: string
  challengeTitle: string
  status: ReportStatus
  compositeScore: number
  language?: string | null
}

export function ReportHero({ repositoryName, challengeTitle, status, compositeScore, language }: Props) {
  const config = STATUS_CONFIG[status]
  const langLabel = language ? (LANGUAGE_LABEL[language.toLowerCase()] ?? language) : null

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
          Verification Report
        </p>
        <h1 className="text-2xl font-semibold tracking-tight font-mono truncate">
          {repositoryName}
        </h1>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {challengeTitle && (
            <p className="text-sm text-muted-foreground">{challengeTitle}</p>
          )}
          {langLabel && (
            <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm bg-muted text-muted-foreground border-border">
              {langLabel}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${config.className}`}>
          {status === 'verified' && <IconCheck size={13} strokeWidth={2.5} />}
          {config.label}
        </span>
        <p className="text-2xl font-semibold tabular-nums">
          {compositeScore ?? 0}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </p>
      </div>
    </div>
  )
}
