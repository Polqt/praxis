'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconTrophy, IconMedal, IconAward } from '@tabler/icons-react'
import { useLeaderboard } from '@/features/profile/hooks/use-leaderboard-query'
import { fadeUp, staggerContainer } from '@/lib/animations'
import type { LeaderboardEntry } from '@/lib/api'

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <IconTrophy size={16} className="text-amber-400 shrink-0" />
  if (rank === 2) return <IconMedal size={16} className="text-slate-400 shrink-0" />
  if (rank === 3) return <IconAward size={16} className="text-amber-700 shrink-0" />
  return <span className="text-xs font-mono text-muted-foreground w-4 text-center shrink-0">{rank}</span>
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const isTopThree = entry.rank <= 3

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/p/${entry.username}`}
        className={[
          'flex items-center gap-4 px-5 py-4 rounded-lg border bg-card',
          'hover:bg-accent/30 transition-colors duration-150',
          isTopThree ? 'border-amber-200/50 dark:border-amber-800/30' : '',
        ].join(' ')}
      >
        <RankIcon rank={entry.rank} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">@{entry.username}</p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums">{entry.verifiedCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">verified</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums">{entry.bestScore}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">best score</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}

export function LeaderboardClient() {
  const { data, isLoading, isError } = useLeaderboard()

  return (
    <div className="px-10 py-10 w-full max-w-2xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top verified developers ranked by completed challenges and best score.
        </p>
      </motion.div>

      {isLoading && <LeaderboardSkeleton />}

      {isError && (
        <p className="text-sm text-muted-foreground text-center py-16">
          Failed to load leaderboard. Please try again.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-16">
          No verified developers yet. Be the first.
        </p>
      )}

      {data && data.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {data.map((entry, i) => (
            <LeaderboardRow key={entry.username} entry={entry} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
