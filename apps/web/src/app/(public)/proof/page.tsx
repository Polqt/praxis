import Link from 'next/link'
import type { Metadata } from 'next'
import { IconCheck, IconExternalLink } from '@tabler/icons-react'
import { serverApiFetch } from '@/lib/api.server'
import type { PublicProofEntry } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Public Proofs · Praxis',
  description: 'Browse all published verification reports. Real repositories. Deterministic analysis. Proof that speaks for itself.',
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-primary" />
      <span className="text-[13px] uppercase tracking-widest text-muted-foreground">{text}</span>
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

function VerdictBadge({ verdict }: { verdict: string }) {
  const isVerified = verdict === 'verified'
  return (
    <span className={[
      'inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm shrink-0',
      isVerified
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-amber-100 text-amber-700 border-amber-200',
    ].join(' ')}>
      {isVerified && <IconCheck size={9} strokeWidth={3} />}
      {isVerified ? 'Verified' : 'Insufficient'}
    </span>
  )
}

function ProofCard({ proof }: { proof: PublicProofEntry }) {
  const repoShort = proof.repositoryName.split('/')[1] ?? proof.repositoryName
  const date = new Date(proof.generatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

  return (
    <Link
      href={`/proof/${proof.publicToken}`}
      className="group flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-5 border-b border-border hover:bg-muted/40 transition-colors duration-150"
    >
      {/* Score ring */}
      <div className="shrink-0 w-12 h-12 rounded-full border-2 border-border group-hover:border-foreground/30 transition-colors flex items-center justify-center">
        <span className="text-sm font-semibold tabular-nums leading-none">{proof.compositeScore}</span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-[15px] font-medium font-mono truncate">{repoShort}</p>
          <VerdictBadge verdict={proof.verdict} />
        </div>
        <p className="text-[12px] text-muted-foreground truncate">{proof.challengeTitle}</p>
        {proof.publicSummary && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 hidden sm:block">
            {proof.publicSummary}
          </p>
        )}
      </div>

      {/* Right meta */}
      <div className="shrink-0 text-right hidden sm:block">
        {proof.username && (
          <p className="text-[12px] text-muted-foreground">@{proof.username}</p>
        )}
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{date}</p>
      </div>

      <IconExternalLink size={14} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </Link>
  )
}

export default async function PublicProofsPage() {
  const proofs = await serverApiFetch<PublicProofEntry[]>('/proof', { next: { revalidate: 60 } }).catch(() => [] as PublicProofEntry[])

  const verified = proofs.filter((p) => p.verdict === 'verified')
  const total = proofs.length

  return (
    <div className="bg-background">

      {/* ── HERO ── */}
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 pt-14 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="Public Proofs" />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
            Real code.
            <br />
            Verified results.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Every proof on this page was generated from a real GitHub repository.
            No self-reporting. No fabrication. Deterministic analysis, published for anyone to read.
          </p>
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums">{total}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Published</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums">{verified.length}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Verified</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none bg-foreground text-background hover:opacity-90 transition-opacity"
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

      {/* ── PROOF LIST ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-b border-border py-24">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="All Published Proofs" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4 text-foreground">
            Every entry is earned. Nothing is self-reported.
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Scores are derived from real repository signals — file structure, test coverage, authentication patterns,
            deployment configuration. Click any proof to read the full report.
          </p>

          {/* Table header */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 border border-b-0 border-border bg-muted/50">
            <div className="w-12 shrink-0">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Score</span>
            </div>
            <div className="flex-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Repository</span>
            </div>
            <div className="hidden sm:block shrink-0 w-24 text-right">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Author</span>
            </div>
            <div className="w-4 shrink-0" />
          </div>

          <div className="border border-border">
            {proofs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                No published proofs yet. Be the first.
              </p>
            ) : (
              proofs.map((proof) => (
                <ProofCard key={proof.publicToken} proof={proof} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border bg-foreground">
        <div className="max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-white/40" />
            <span className="text-[13px] uppercase tracking-widest text-white/40">Your turn</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl text-background">
            Add your proof.
            <br />
            Join the record.
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/sign-in"
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
