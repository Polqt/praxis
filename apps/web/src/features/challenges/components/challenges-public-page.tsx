'use client'

import Link from 'next/link'
import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChallengeCard } from '@/features/challenges/components/challenge-card'
import { DIFFICULTY_LABEL } from '@/features/challenges/constants'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import { fadeUp } from '@/lib/animations'
import type { Challenge, ChallengeCategory, ChallengeDifficulty } from '@/features/challenges/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type SubmissionStatus = 'verified' | 'in-progress' | 'attempted'

type Props = {
  challenges: Challenge[]
  isAuthenticated: boolean
  submissionStatusMap?: Record<string, SubmissionStatus>
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTY_ORDER: ChallengeDifficulty[] = ['junior', 'intermediate', 'senior']
const CATEGORIES: ChallengeCategory[] = ['frontend', 'backend']

// ── Utils ─────────────────────────────────────────────────────────────────────

function filterChallenges(
  all: Challenge[],
  category: ChallengeCategory,
  difficulty: ChallengeDifficulty | 'all',
): Challenge[] {
  return all.filter(
    (c) => c.category === category && (difficulty === 'all' || c.difficulty === difficulty),
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div className={`w-2 h-2.5 rounded-[1px] shrink-0 ${light ? 'bg-white/40' : 'bg-primary'}`} />
      <span className={`text-[13px] uppercase tracking-widest ${light ? 'text-white/40' : 'text-muted-foreground'}`}>
        {text}
      </span>
    </div>
  )
}

function MarqueeBand({ text }: { text: string }) {
  const repeated = text.repeat(6)
  return (
    <div className="w-full h-20 overflow-hidden flex items-center border-t border-b border-border bg-foreground">
      <div
        className="flex whitespace-nowrap text-white/20"
        style={{ animation: 'marquee 22s linear infinite', willChange: 'transform' }}
      >
        <span className="text-[13px] uppercase tracking-widest font-medium px-4">{repeated}</span>
        <span className="text-[13px] uppercase tracking-widest font-medium px-4">{repeated}</span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

type FilterBarProps = {
  category: ChallengeCategory
  difficulty: ChallengeDifficulty | 'all'
  onCategory: (c: ChallengeCategory) => void
  onDifficulty: (d: ChallengeDifficulty | 'all') => void
}

function FilterBar({ category, difficulty, onCategory, onDifficulty }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Category pills */}
      <div className="flex items-center gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={[
              'px-4 py-2 text-xs font-medium border-b-2 transition-colors',
              category === c
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {CATEGORY_LABEL[c] ?? c}
          </button>
        ))}
      </div>

      {/* Difficulty pills */}
      <div className="flex items-center gap-1.5">
        {(['all', ...DIFFICULTY_ORDER] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficulty(d)}
            className={[
              'text-[11px] font-medium px-2.5 py-1 rounded-sm border transition-colors',
              difficulty === d
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:bg-muted',
            ].join(' ')}
          >
            {d === 'all' ? 'All' : DIFFICULTY_LABEL[d]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Challenge list ────────────────────────────────────────────────────────────

type ChallengeListProps = {
  challenges: Challenge[]
  isAuthenticated: boolean
  submissionStatusMap: Record<string, SubmissionStatus>
  listKey: string
}

function ChallengeList({ challenges, isAuthenticated, submissionStatusMap, listKey }: ChallengeListProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={listKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-3 mt-6 min-h-[120px]"
      >
        {challenges.length === 0 ? (
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            No challenges in this category.
          </motion.p>
        ) : (
          challenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, delay: i * 0.04 }}
            >
              <ChallengeCard
                challenge={challenge}
                isAuthenticated={isAuthenticated}
                submissionStatus={submissionStatusMap[challenge.id]}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChallengesPublicPage({ challenges, isAuthenticated, submissionStatusMap = {} }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // Local state drives instant filtering — URL is kept in sync but never blocks UI
  const [category, setCategory] = useState<ChallengeCategory>(
    searchParams.get('tab') === 'backend' ? 'backend' : 'frontend',
  )
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | 'all'>(
    (DIFFICULTY_ORDER as string[]).includes(searchParams.get('difficulty') ?? '')
      ? (searchParams.get('difficulty') as ChallengeDifficulty)
      : 'all',
  )

  // Sync state → URL without blocking the UI
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('tab', category)
      if (difficulty !== 'all') params.set('difficulty', difficulty)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [category, difficulty, pathname, router])

  const filtered = filterChallenges(challenges, category, difficulty)
  const listKey = `${category}-${difficulty}`

  return (
    <div className="bg-background">

      {/* ── HERO ── */}
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 pt-14 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="Verification Challenges" />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
            Prove what you built.
            <br />
            Not what you claim.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Submit a real repository. Receive an independent verification report.
            Earn proof of work that speaks for itself.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? '/submit' : '/sign-in'}
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/example-report"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-border hover:bg-muted transition-colors"
            >
              See an example
            </Link>
          </div>
        </div>
      </section>

      <MarqueeBand text="API DESIGN · AUTHENTICATION · DATABASE DESIGN · TESTING · DOCUMENTATION · DEPLOYMENT · " />

      {/* ── BROWSE CHALLENGES ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-b border-border py-24">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="Browse Challenges" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4 text-foreground">
            One discipline. One challenge. One verified result.
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Each challenge defines exactly what gets evaluated. You know the rubric before you submit.
            No surprises. No ambiguity. The report reflects what was actually in your repository.
          </p>

          <FilterBar
            category={category}
            difficulty={difficulty}
            onCategory={setCategory}
            onDifficulty={setDifficulty}
          />
          <div className="border-b border-border" />

          <ChallengeList
            challenges={filtered}
            isAuthenticated={isAuthenticated}
            submissionStatusMap={submissionStatusMap}
            listKey={listKey}
          />
        </div>
      </section>

      {/* ── WHAT GETS EVALUATED ── */}
      <section className="min-h-screen bg-muted flex flex-col justify-center border-b border-border py-24">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="What Gets Evaluated" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-10 text-foreground">
            Six dimensions. All deterministic. No human bias.
          </h2>
          <div className="border-t border-border">
            {[
              { label: 'API Design', description: 'Route organization, HTTP conventions, validation patterns, error handling consistency.' },
              { label: 'Authentication', description: 'Auth implementation depth, JWT or session usage, guard and middleware patterns.' },
              { label: 'Database Design', description: 'ORM usage, migration files, schema definitions, relational patterns, transaction handling.' },
              { label: 'Testing', description: 'Test file count, integration and end-to-end suite presence, coverage configuration.' },
              { label: 'Documentation', description: 'README quality, setup instructions, API documentation, architecture notes.' },
              { label: 'Deployment', description: 'Dockerfile, CI workflow, deployment pipeline, infrastructure configuration.' },
            ].map(({ label, description }) => (
              <div key={label} className="flex gap-8 py-6 border-b border-border">
                <span className="text-[15px] font-medium text-foreground w-48 shrink-0">{label}</span>
                <span className="text-[15px] text-muted-foreground leading-relaxed">{description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border bg-foreground">
        <div className="max-w-4xl mx-auto w-full">
          <SectionLabel text="Ready" light />
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl text-background">
            Connect. Submit. Get verified.
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={isAuthenticated ? '/submit' : '/sign-in'}
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none bg-background text-foreground hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/example-report"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-white/30 text-background hover:bg-white/10 transition-colors"
            >
              See an example report
            </Link>
          </div>
          <p className="text-sm text-white/50">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

    </div>
  )
}
