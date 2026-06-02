'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ChallengeCard } from '@/features/challenges/components/challenge-card'
import type { Challenge, ChallengeCategory } from '@/features/challenges/types'

type Props = {
  challenges: Challenge[]
  isAuthenticated: boolean
}

// ── Shared primitives ────────────────────────────────────────────────────────

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

function ChallengeList({ challenges, isAuthenticated }: { challenges: Challenge[]; isAuthenticated: boolean }) {
  if (challenges.length === 0) {
    return <p className="text-sm text-muted-foreground mt-3">No challenges available.</p>
  }
  return (
    <div className="flex flex-col gap-3 mt-6">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  )
}

// ── Authenticated view (matches Studio / Submissions aesthetic) ───────────────

function ChallengesAppView({ challenges, isAuthenticated }: Props) {
  const [tab, setTab] = useState<ChallengeCategory>('frontend')
  const frontend = challenges.filter((c) => c.category === 'frontend')
  const backend = challenges.filter((c) => c.category === 'backend')

  return (
    <div className="px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a challenge, submit a repository, earn verified proof of work.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ChallengeCategory)}>
        <TabsList className="bg-transparent p-0 h-auto gap-0 border-0">
          {(['frontend', 'backend'] as const).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="px-4 py-2 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none capitalize"
            >
              {category === 'frontend' ? 'Frontend Engineering' : 'Backend Engineering'}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator className="mt-0" />
        <TabsContent value="frontend">
          <ChallengeList challenges={frontend} isAuthenticated={isAuthenticated} />
        </TabsContent>
        <TabsContent value="backend">
          <ChallengeList challenges={backend} isAuthenticated={isAuthenticated} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Public marketing view (matches why / how-it-works aesthetic) ──────────────

function ChallengesMarketingView({ challenges, isAuthenticated }: Props) {
  const [tab, setTab] = useState<ChallengeCategory>('frontend')
  const frontend = challenges.filter((c) => c.category === 'frontend')
  const backend = challenges.filter((c) => c.category === 'backend')

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
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
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

          <Tabs value={tab} onValueChange={(v) => setTab(v as ChallengeCategory)}>
            <TabsList className="bg-transparent p-0 h-auto gap-0 border-0 mb-0">
              {(['frontend', 'backend'] as const).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none"
                >
                  {category === 'frontend' ? 'Frontend Engineering' : 'Backend Engineering'}
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator className="mt-0" />
            <TabsContent value="frontend">
              <ChallengeList challenges={frontend} isAuthenticated={isAuthenticated} />
            </TabsContent>
            <TabsContent value="backend">
              <ChallengeList challenges={backend} isAuthenticated={isAuthenticated} />
            </TabsContent>
          </Tabs>
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
      <section
        className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border"
        style={{ background: 'var(--foreground)' }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <SectionLabel text="Ready" light />
          <h2
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl"
            style={{ color: 'var(--background)' }}
          >
            Connect. Submit. Get verified.
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

// ── Entry point ───────────────────────────────────────────────────────────────

export function ChallengesPublicPage({ challenges, isAuthenticated }: Props) {
  if (isAuthenticated) {
    return <ChallengesAppView challenges={challenges} isAuthenticated={isAuthenticated} />
  }
  return <ChallengesMarketingView challenges={challenges} isAuthenticated={isAuthenticated} />
}
