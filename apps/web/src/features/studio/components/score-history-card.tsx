'use client'

import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import {
  SCORE_CHART_HEIGHT,
  SCORE_CHART_WIDTH,
} from '@/features/studio/constants'
import { getSparklinePoints } from '@/features/studio/utils/get-sparkline-points'
import type { ScoreHistoryEntry } from '@/lib/api'

type Props = {
  history: ScoreHistoryEntry[]
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null
  const improved = scores[scores.length - 1] > scores[0]

  return (
    <svg width={SCORE_CHART_WIDTH} height={SCORE_CHART_HEIGHT} className="overflow-visible">
      <polyline
        points={getSparklinePoints(scores)}
        fill="none"
        stroke={improved ? 'rgb(34,197,94)' : 'rgb(239,68,68)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BaselineBar({ score }: { score: number }) {
  const fillWidth = Math.round((score / 100) * SCORE_CHART_WIDTH)
  return (
    <svg width={SCORE_CHART_WIDTH} height={SCORE_CHART_HEIGHT} className="overflow-visible">
      <rect x={0} y={SCORE_CHART_HEIGHT - 4} width={SCORE_CHART_WIDTH} height={4} rx={2} fill="rgb(229,231,235)" />
      <rect x={0} y={SCORE_CHART_HEIGHT - 4} width={fillWidth} height={4} rx={2} fill="rgb(148,163,184)" />
    </svg>
  )
}

export function ScoreHistoryCard({ history }: Props) {
  if (history.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Score history</p>
      <div className="space-y-3">
        {history.map(({ challengeId, title, scores }) => {
          const isSingle = scores.length === 1
          const first = scores[0].score
          const last = scores[scores.length - 1].score
          const delta = last - first
          return (
            <div key={challengeId} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSingle ? (
                    <span>{first}/100</span>
                  ) : (
                    <>
                      {first} → {last}
                      {delta !== 0 && (
                        <span className={delta > 0 ? 'text-green-600 ml-1' : 'text-destructive ml-1'}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
              {isSingle
                ? <BaselineBar score={first} />
                : <Sparkline scores={scores.map((s) => s.score)} />
              }
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
