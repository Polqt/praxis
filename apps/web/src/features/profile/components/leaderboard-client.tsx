'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconTrophy, IconMedal, IconAward } from '@tabler/icons-react'
import { fadeUp, staggerContainer } from '@/lib/animations'
import type { LeaderboardEntry } from '@/lib/api'

type Props = {
  entries: LeaderboardEntry[]
}

function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div
        className="rounded-[1px] shrink-0"
        style={{ width: '8px', height: '10px', background: light ? 'rgba(255,255,255,0.4)' : 'var(--primary)' }}
      />
      <span
        className="text-[13px] uppercase tracking-widest"
        style={{ color: light ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}
      >
        {text}
      </span>
    </div>
  )
}

function MarqueeBand({ text }: { text: string }) {
  const repeated = text.repeat(6)
  return (
    <div
      className="w-full overflow-hidden flex items-center border-t border-b border-border"
      style={{ background: 'var(--foreground)', height: '80px' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 22s linear infinite', willChange: 'transform' }}
      >
        <span className="text-[13px] uppercase tracking-widest font-medium px-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {repeated}
        </span>
        <span className="text-[13px] uppercase tracking-widest font-medium px-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {repeated}
        </span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <IconTrophy size={18} className="text-amber-400 shrink-0" />
  if (rank === 2) return <IconMedal size={18} className="text-slate-400 shrink-0" />
  if (rank === 3) return <IconAward size={18} className="text-amber-700 shrink-0" />
  return <span className="text-sm font-mono text-muted-foreground w-5 text-center shrink-0">{rank}</span>
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTopThree = entry.rank <= 3
  const lastVerified = entry.lastVerifiedAt
    ? new Date(entry.lastVerifiedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : null

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/p/${entry.username}`}
        className={[
          'flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 border-b border-border',
          'hover:bg-muted/40 transition-colors duration-150',
          isTopThree ? 'bg-muted/20' : '',
        ].join(' ')}
      >
        <div className="w-8 flex justify-center shrink-0">
          <RankIcon rank={entry.rank} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-medium truncate">@{entry.username}</p>
            {entry.recentlyActive && (
              <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700 border border-green-200 shrink-0">
                Active
              </span>
            )}
          </div>
          {lastVerified && (
            <p className="text-[11px] text-muted-foreground mt-0.5" suppressHydrationWarning>
              Last verified {lastVerified}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 sm:gap-10 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[15px] font-semibold tabular-nums">{entry.verifiedCount}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">verified</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold tabular-nums">{entry.bestScore}<span className="text-xs font-normal text-muted-foreground">/100</span></p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:block">best score</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function LeaderboardClient({ entries }: Props) {
  return (
    <div className="bg-background">
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 pt-14 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="Leaderboard" />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
            Developers who prove
            <br />
            what they built.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Ranked by verified challenges completed. Scores are earned through deterministic
            repository analysis — not self-reported.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
            >
              Get verified
            </Link>
            <Link
              href="/challenges"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-border hover:bg-muted transition-colors"
            >
              Browse challenges
            </Link>
          </div>
        </div>
      </section>

      <MarqueeBand text="VERIFIED · DETERMINISTIC · PROOF OF WORK · REPOSITORY ANALYSIS · " />

      <section className="min-h-screen bg-background flex flex-col justify-center border-b border-border py-24">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="Rankings" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4 text-foreground">
            Every entry is earned. Nothing is self-reported.
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Rankings update automatically when a new verification completes. Primary sort by
            verified challenges, tiebreak by best composite score.
          </p>

          <div className="flex items-center gap-5 px-6 py-3 border border-b-0 border-border bg-muted/50">
            <div className="w-8 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Developer</span>
            </div>
            <div className="flex items-center gap-10 shrink-0">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium w-16 text-right">Verified</span>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium w-20 text-right">Best score</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground px-1 pt-2 pb-0">
            Rankings update automatically after each verification completes.
          </p>

          <div className="border border-border">
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-16">
                No verified developers yet. Be the first.
              </p>
            )}
            {entries.length > 0 && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {entries.map((entry) => (
                  <LeaderboardRow key={entry.username} entry={entry} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section
        className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border"
        style={{ background: 'var(--foreground)' }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <SectionLabel text="Your turn" light />
          <h2
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl"
            style={{ color: 'var(--background)' }}
          >
            Submit a real project.
            <br />
            Earn your place.
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
              style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            >
              Get started
            </Link>
            <Link
              href="/example-report"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border hover:bg-white/10 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--background)' }}
            >
              See an example report
            </Link>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Free to start. No credit card required.
          </p>
        </div>
      </section>
    </div>
  )
}
