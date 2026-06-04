'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconAlertTriangle, IconBulb, IconSearch, IconEyeOff, IconChecklist, IconArrowRight } from '@tabler/icons-react'
import { CATEGORY_FIX_INSTRUCTIONS, SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { fadeUp } from '@/lib/animations'
import type { ScoreItem, ReportStatus } from '@/features/reports/types'

type Props = {
  status: ReportStatus
  scores: ScoreItem[]
  allCitedFiles: string[]
  submissionId: string
  challengeId?: string
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{title}</p>
      </div>
      {children}
    </motion.div>
  )
}

export function ReportClaritySection({ status, scores, allCitedFiles, challengeId }: Props) {
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

  return (
    <div className="mt-10 flex flex-col gap-4">
      <p className={SECTION_LABEL_CLASS}>Verification analysis</p>

      {/* Why this did not verify */}
      <Block icon={<IconAlertTriangle size={14} />} title="Why this did not verify">
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
            The composite score ({scores.reduce((a, s) => a + s.score, 0) > 0 ? 'below threshold' : 'insufficient'}) did not meet the passing threshold. No individual category floor was missed, but the weighted total fell short.
          </p>
        )}
      </Block>

      {failedCategories.length > 0 && (
        <Block icon={<IconBulb size={14} />} title="Highest-impact fixes">
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
        </Block>
      )}

      <Block icon={<IconSearch size={14} />} title="What Praxis found">
        {allCitedFiles.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground mb-2">{allCitedFiles.length} file{allCitedFiles.length !== 1 ? 's' : ''} used as evidence across all categories:</p>
            {allCitedFiles.slice(0, 8).map((f) => (
              <span key={f} className="text-[11px] font-mono text-muted-foreground">{f}</span>
            ))}
            {allCitedFiles.length > 8 && (
              <span className="text-[11px] text-muted-foreground">…and {allCitedFiles.length - 8} more</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No evidence files were cited. The repository may be empty or inaccessible.</p>
        )}
        {highCategories.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Strong signals detected in: {highCategories.map((s) => s.category).join(', ')}.
          </p>
        )}
      </Block>

      <Block icon={<IconEyeOff size={14} />} title="What Praxis could not verify">
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
      </Block>

      {checklist.length > 0 && (
        <Block icon={<IconChecklist size={14} />} title="Next submission checklist">
          <ul className="flex flex-col gap-2">
            {checklist.map((item) => (
              <li key={item} className="text-sm flex items-start gap-2">
                <span className="size-4 rounded border border-border shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <motion.div variants={fadeUp} className="rounded-lg border border-dashed bg-card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Ready to resubmit?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fix the issues above, push to your repository, and submit again. Each submission is evaluated independently.
          </p>
        </div>
        <Link
          href={challengeId ? `/submit?challengeId=${challengeId}` : '/challenges'}
          className="inline-flex items-center gap-1.5 shrink-0 h-9 px-4 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
        >
          Resubmit <IconArrowRight size={13} />
        </Link>
      </motion.div>
    </div>
  )
}
