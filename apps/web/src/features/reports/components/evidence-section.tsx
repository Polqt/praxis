'use client'

import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'
import type { EvidenceItem } from '@/features/reports/types'

type Props = {
  evidence: EvidenceItem[]
}

export function EvidenceSection({ evidence }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-4`}>Evidence found</p>
      {evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evidence recorded for this submission.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {evidence.map((item, i) => (
            <div
              key={i}
              className="rounded-md border bg-muted/30 px-4 py-3"
            >
              <p className="text-sm font-medium mb-2">{item.label}</p>
              <div className="flex flex-col gap-0.5">
                {item.files.map((file) => (
                  <span key={file} className="text-[11px] font-mono text-muted-foreground">
                    {file}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
