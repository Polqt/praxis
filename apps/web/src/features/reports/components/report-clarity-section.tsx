'use client'

import { motion } from 'framer-motion'
import { IconAlertTriangle, IconBulb, IconSearch, IconEyeOff, IconChecklist, IconArrowRight } from '@tabler/icons-react'
import { CATEGORY_FIX_INSTRUCTIONS, SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { fadeUp } from '@/lib/animations'
import type { ScoreItem, ReportStatus } from '@/features/reports/types'

type Props = {
  status: ReportStatus
  scores: ScoreItem[]
  allCitedFiles: string[]
}

function groupByDirectory(files: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const f of files) {
    const lastSlash = f.lastIndexOf('/')
    const dir = lastSlash > -1 ? f.slice(0, lastSlash) : '(root)'
    const name = lastSlash > -1 ? f.slice(lastSlash + 1) : f
    const existing = groups.get(dir)
    if (existing) existing.push(name)
    else groups.set(dir, [name])
  }
  return groups
}

function BlockHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{title}</p>
    </div>
  )
}

export function ReportClaritySection({ status, scores, allCitedFiles }: Props) {
  if (status === 'verified') return null

  const failedCategories = scores.filter(
    (s) => (s.status === 'floor' || s.status === 'fail') && s.minimumScore !== undefined && s.score < s.minimumScore,
  )
  const lowCategories = scores.filter((s) => s.score <= 6 && !failedCategories.includes(s))
  const highCategories = scores.filter((s) => s.score >= 8)

  const highImpactFixes = failedCategories.flatMap((s) => CATEGORY_FIX_INSTRUCTIONS[s.category] ?? []).slice(0, 5)
  const checklist = [
    ...failedCategories.map((s) => `Bring ${s.category} above the minimum score (${s.minimumScore}/10)`),
    ...lowCategories.slice(0, 2).map((s) => `Improve ${s.category} (currently ${s.score}/10)`),
  ]

  const visibleFiles = allCitedFiles.slice(0, 20)
  const dirGroups = groupByDirectory(visibleFiles)

  return (
    <motion.div variants={fadeUp} className="mt-10">
      <p className={`${SECTION_LABEL_CLASS} mb-4`}>Verification analysis</p>

      <div className="rounded-lg border bg-card divide-y divide-border">
        <div className="p-5">
          <BlockHeader icon={<IconAlertTriangle size={14} />} title="Why this did not verify" />
          {failedCategories.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {failedCategories.map((s) => (
                <li key={s.category} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0">·</span>
                  <span>
                    <strong>{s.category}</strong> scored {s.score}/10 — the minimum required is {s.minimumScore}/10. Floor conditions must be met for a verified result.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              The composite score did not meet the passing threshold. No individual category floor was missed, but the weighted total fell short.
            </p>
          )}
        </div>

        {failedCategories.length > 0 && (
          <div className="p-5">
            <BlockHeader icon={<IconBulb size={14} />} title="Highest-impact fixes" />
            {highImpactFixes.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {highImpactFixes.map((fix) => (
                  <li key={fix} className="text-sm flex items-start gap-2">
                    <IconArrowRight size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    {fix}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-2">
                {failedCategories.map((s) => (
                  <li key={s.category} className="text-sm flex items-start gap-2">
                    <IconArrowRight size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    Improve <strong>{s.category}</strong> — bring it above the minimum score of {s.minimumScore}/10.
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="p-5">
          <BlockHeader icon={<IconSearch size={14} />} title="What Praxis found" />
          {allCitedFiles.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">{allCitedFiles.length} file{allCitedFiles.length !== 1 ? 's' : ''} used as evidence across all categories:</p>
              <div className="flex flex-col gap-3">
                {Array.from(dirGroups.entries()).map(([dir, names]) => (
                  <div key={dir}>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">{dir}/</p>
                    <div className="flex flex-col gap-0.5 pl-3 border-l border-border">
                      {names.map((name) => (
                        <span key={name} className="text-[11px] font-mono text-muted-foreground">{name}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {allCitedFiles.length > 20 && (
                  <span className="text-[11px] text-muted-foreground">…and {allCitedFiles.length - 20} more</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No evidence files were cited. The repository may be empty or inaccessible.</p>
          )}
          {highCategories.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Strong signals detected in: {highCategories.map((s) => s.category).join(', ')}.
            </p>
          )}
        </div>

        <div className="p-5">
          <BlockHeader icon={<IconEyeOff size={14} />} title="What Praxis could not verify" />
          <p className="text-sm text-muted-foreground mb-2">
            Praxis uses deterministic repository signal detection. The following are outside scope:
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              'Runtime behavior or actual API responses',
              'Code quality beyond structural signals (readability, business logic)',
              'Test quality — only test file presence and type is checked',
              'Private dependency or service configurations',
            ].map((item) => (
              <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="mt-0.5 shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {checklist.length > 0 && (
          <div className="p-5">
            <BlockHeader icon={<IconChecklist size={14} />} title="Next submission checklist" />
            <ul className="flex flex-col gap-2">
              {checklist.map((item) => (
                <li key={item} className="text-sm flex items-start gap-2">
                  <span className="size-4 rounded border border-border shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}
