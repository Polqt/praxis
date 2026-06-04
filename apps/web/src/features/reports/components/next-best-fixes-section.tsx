'use client'

import { motion } from 'framer-motion'
import { IconArrowUpRight } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
import { SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { deriveNextBestFixes } from '../utils/derive-next-best-fixes'
import type { ScoreItem } from '../types'

type Props = {
  scores: ScoreItem[]
}

export function NextBestFixesSection({ scores }: Props) {
  const fixes = deriveNextBestFixes(scores)
  if (fixes.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="mt-6 rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <IconArrowUpRight size={15} className="text-primary shrink-0" />
        <p className={SECTION_LABEL_CLASS}>Fastest path to verification</p>
      </div>
      <ol className="space-y-2">
        {fixes.map((fix, index) => (
          <li key={fix} className="flex gap-3 text-sm text-muted-foreground">
            <span className="font-mono text-xs text-foreground mt-0.5">{index + 1}.</span>
            <span>{fix}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
