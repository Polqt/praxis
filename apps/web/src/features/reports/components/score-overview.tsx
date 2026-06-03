'use client'

import { motion } from 'framer-motion'
import { IconAlertTriangle } from '@tabler/icons-react'
import { scoreBarColor, CATEGORY_STATUS_CLASS, CATEGORY_FIX_INSTRUCTIONS } from '@/features/reports/constants'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { ScoreItem } from '@/features/reports/types'

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

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Rubric results</p>
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

          return (
            <motion.div key={item.category} variants={fadeUp} className="p-5">
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

              <div className="h-1 rounded-full bg-muted overflow-hidden mb-3">
                <motion.div
                  className={`h-full rounded-full ${scoreBarColor(item.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 10) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
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
