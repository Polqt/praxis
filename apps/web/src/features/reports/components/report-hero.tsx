'use client'

import {
  LANGUAGE_LABEL,
  SECTION_LABEL_CLASS,
} from '@/features/reports/constants'
import type { ReportStatus } from '@/features/reports/types'

type Props = {
  repositoryName: string
  challengeTitle: string
  status: ReportStatus
  compositeScore: number
  language?: string | null
}

export function ReportHero({ repositoryName, challengeTitle, language }: Props) {
  const langLabel = language ? (LANGUAGE_LABEL[language.toLowerCase()] ?? language) : null

  return (
    <div className="min-w-0">
      <p className={`${SECTION_LABEL_CLASS} mb-2`}>Verification Report</p>
      <h1 className="text-3xl font-semibold tracking-tight font-mono truncate">
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
  )
}
