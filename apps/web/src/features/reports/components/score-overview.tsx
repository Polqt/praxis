'use client'

import { motion } from 'framer-motion'
import { IconAlertTriangle, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { CATEGORY_STATUS_CLASS, CATEGORY_FIX_INSTRUCTIONS, SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { formatSignalKey } from '@/features/reports/utils/format-signal-key'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { ScoreItem } from '@/features/reports/types'

function SignalsPanel({ signals }: { signals: Record<string, unknown> }) {
  const entries = Object.entries(signals).filter(([, v]) => typeof v === 'boolean' || typeof v === 'number')
  if (entries.length === 0) return null

  return (
    <Collapsible className="mt-3">
      <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors group">
        <IconChevronRight size={11} className="group-data-[state=open]:hidden" />
        <IconChevronDown size={11} className="hidden group-data-[state=open]:block" />
        What was checked
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`size-1.5 rounded-full shrink-0 ${val ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
              <span className="text-[11px] text-muted-foreground">{formatSignalKey(key)}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

type Props = {
  scores: ScoreItem[]
  repositoryName?: string
  commitSha?: string
}

export function ScoreOverview({ scores, repositoryName, commitSha }: Props) {
  function citationUrl(filePath: string): string | null {
    if (!repositoryName || !commitSha) return null
    return `https://github.com/${repositoryName}/blob/${commitSha}/${filePath}`
  }

  if (scores.length === 0) {
    return (
      <div>
        <p className={`${SECTION_LABEL_CLASS} mb-6`}>Rubric results</p>
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No category scores available.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className={`${SECTION_LABEL_CLASS} mb-6`}>Rubric results</p>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="rounded-lg border divide-y divide-border"
      >
        {scores.map((item) => {
          const floorMissed = (item.status === 'floor' || item.status === 'fail')
            && item.minimumScore !== undefined
            && item.score < item.minimumScore
          const fixSteps = CATEGORY_FIX_INSTRUCTIONS[item.category] ?? []
          const scorePercent = (item.score / 10) * 100

          const categoryId = item.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return (
            <motion.div key={item.category} id={categoryId} variants={fadeUp} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium flex-1">{item.category}</span>
                {item.status && (
                  <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${CATEGORY_STATUS_CLASS[item.status]}`}>
                    {item.status}
                  </span>
                )}
                <span className="text-sm font-semibold tabular-nums w-10 text-right shrink-0">
                  {item.score}<span className="text-xs font-normal text-muted-foreground">/10</span>
                </span>
              </div>

              <div className="mb-3">
                <Progress
                  value={scorePercent}
                  className={`h-1 *:data-[slot=progress-indicator]:transition-none ${
                    item.status === 'pass'
                      ? '*:data-[slot=progress-indicator]:bg-green-500'
                      : item.status === 'floor'
                        ? '*:data-[slot=progress-indicator]:bg-amber-500'
                        : '*:data-[slot=progress-indicator]:bg-red-500'
                  }`}
                />
              </div>

              {item.executionEvidence && (
                <div className="inline-flex items-center gap-1.5 mb-3 px-2 py-1 rounded-md bg-muted/60 border border-border text-[11px] font-medium">
                  <span className="text-green-600">{item.executionEvidence.passed} passed</span>
                  {item.executionEvidence.failed > 0 && (
                    <><span className="text-muted-foreground">·</span><span className="text-red-600">{item.executionEvidence.failed} failed</span></>
                  )}
                  {item.executionEvidence.skipped > 0 && (
                    <><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{item.executionEvidence.skipped} skipped</span></>
                  )}
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground uppercase tracking-wider">{item.executionEvidence.language}</span>
                </div>
              )}

              {item.narrative && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.narrative}</p>
              )}

              {floorMissed && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 mb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <IconAlertTriangle size={12} className="text-amber-600 shrink-0" />
                    <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-widest">
                      Floor missed — scored {item.score}/10, minimum is {item.minimumScore}/10
                    </p>
                  </div>
                  {fixSteps.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {fixSteps.map((step) => (
                        <li key={step} className="text-xs text-amber-800 flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0">·</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {item.signals && <SignalsPanel signals={item.signals} />}

              {item.citations.length > 0 && (
                <div className="rounded-md bg-muted/50 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                    Evidence found
                  </p>
                  <div className="flex flex-col gap-1">
                    {item.citations.map((file) => {
                      const url = citationUrl(file)
                      return url ? (
                        <a
                          key={file}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-muted-foreground hover:text-foreground hover:underline transition-colors"
                        >
                          {file}
                        </a>
                      ) : (
                        <span key={file} className="text-[11px] font-mono text-muted-foreground">
                          {file}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
