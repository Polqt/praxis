import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { IconArrowLeft, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { serverApiFetch } from '@/lib/api.server'
import { ShareProofButton } from '@/features/reports/components/share-proof-button'
import { ScoreOverview } from '@/features/reports/components/score-overview'
import { ScoreErrorBoundary } from '@/features/reports/components/score-error-boundary'
import { StrengthsImprovementsSection } from '@/features/reports/components/strengths-improvements-section'
import { ProofSafetyLabels } from '@/features/reports/components/proof-safety-labels'
import { toReport } from '@/features/reports/utils/to-report'
import { STATUS_CONFIG } from '@/features/reports/constants'
import { formatDate } from '@/lib/praxis-format'
import type { VerificationReport } from '@praxis/shared'

type Props = {
  params: Promise<{ publicToken: string }>
}

type ProofMeta = {
  repositoryName: string
  compositeScore: number
  verdict: string
  publicSummary: string | null
  challengeTitle: string | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicToken } = await params
  const meta = await serverApiFetch<ProofMeta>(`/proof/${publicToken}/meta`, { next: { revalidate: 300 } }).catch(() => null)
  if (!meta) return { title: 'Proof not found' }

  const verdict = meta.verdict === 'verified' ? 'Verified' : 'Insufficient'
  const challengePart = meta.challengeTitle ? ` · ${meta.challengeTitle}` : ''
  const title = `${meta.repositoryName} — ${verdict}${challengePart} · ${meta.compositeScore}/100 | Praxis`
  const description = meta.publicSummary ?? `${meta.repositoryName} was evaluated by Praxis and scored ${meta.compositeScore}/100.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Praxis' },
    twitter: { card: 'summary', title, description },
  }
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-primary" />
      <span className="text-[13px] uppercase tracking-widest text-muted-foreground">{text}</span>
    </div>
  )
}

export default async function PublicProofPage({ params }: Props) {
  const { publicToken } = await params

  const [raw, viewingUser] = await Promise.all([
    serverApiFetch<VerificationReport>(`/proof/${publicToken}`).catch(() => null),
    serverApiFetch<{ id: string; username?: string }>('/users/me').catch(() => null),
  ])

  if (!raw) notFound()

  const report = toReport(raw, { isPublic: true })
  const statusConfig = STATUS_CONFIG[report.status]
  const isVerified = report.status === 'verified'
  const shortSha = report.commitSha?.slice(0, 7)
  const commitUrl = report.repositoryName && report.commitSha
    ? `https://github.com/${report.repositoryName}/commit/${report.commitSha}`
    : null

  const backHref = viewingUser ? '/proof' : '/proof'

  return (
    <div className="bg-background">

      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={14} />
            All proofs
          </Link>
          <div className="flex items-center gap-3">
            {raw.viewCount !== undefined && raw.viewCount > 0 && (
              <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:block">
                {raw.viewCount.toLocaleString()} {raw.viewCount === 1 ? 'view' : 'views'}
              </span>
            )}
            <ShareProofButton publicToken={publicToken} />
          </div>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="bg-muted px-6 pt-12 pb-16 border-b border-border">
        <div className="max-w-4xl mx-auto w-full">
          <SectionLabel text="Verification Report" />

          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight font-mono truncate text-foreground">
                {report.repositoryName?.split('/')[1] ?? report.repositoryName}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-mono">{report.repositoryName}</p>
              {report.challengeTitle && (
                <p className="text-sm text-muted-foreground mt-1">{report.challengeTitle}</p>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-sm font-medium ${statusConfig.className}`}>
                {isVerified && <IconCheck size={13} strokeWidth={2.5} />}
                {statusConfig.label}
              </span>
              <p className="text-5xl font-bold tabular-nums">
                {report.compositeScore ?? 0}
                <span className="text-base font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          </div>

          {report.summary && (
            <p className="text-base md:text-lg text-muted-foreground mt-8 max-w-3xl leading-relaxed">
              {report.summary}
            </p>
          )}

          {/* Compact test execution summary */}
          {(raw as { executionSummary?: { passed: number; failed: number; language: string; framework: string | null; durationMs: number | null; timedOut: boolean } | null }).executionSummary && (() => {
            const ex = (raw as unknown as { executionSummary: { passed: number; failed: number; language: string; framework: string | null; durationMs: number | null; timedOut: boolean } }).executionSummary
            const lang = ex.framework ?? ex.language
            const duration = ex.durationMs ? `${(ex.durationMs / 1000).toFixed(1)}s` : null
            return (
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {ex.timedOut ? (
                  <span className="text-[11px] px-2.5 py-1 rounded-sm border border-amber-200 bg-amber-50 text-amber-700">Execution timed out</span>
                ) : (
                  <>
                    {ex.passed > 0 && <span className="text-[11px] px-2.5 py-1 rounded-sm border border-green-200 bg-green-50 text-green-700">{ex.passed} tests passed</span>}
                    {ex.failed > 0 && <span className="text-[11px] px-2.5 py-1 rounded-sm border border-red-200 bg-red-50 text-red-700">{ex.failed} failed</span>}
                    {ex.passed === 0 && ex.failed === 0 && <span className="text-[11px] px-2.5 py-1 rounded-sm border border-border bg-muted text-muted-foreground">No tests detected</span>}
                  </>
                )}
                <span className="text-[11px] px-2.5 py-1 rounded-sm border border-border bg-muted text-muted-foreground uppercase tracking-wider">{lang}</span>
                {duration && <span className="text-[11px] text-muted-foreground">{duration}</span>}
              </div>
            )
          })()}

          <ProofSafetyLabels status={report.status} />
        </div>
      </section>

      {/* ── RUBRIC RESULTS ── */}
      <section className="bg-background border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <ScoreErrorBoundary>
            <ScoreOverview
              scores={report.scores}
              repositoryName={report.repositoryName}
              commitSha={report.commitSha}
            />
          </ScoreErrorBoundary>
        </div>
      </section>

      {/* ── STRENGTHS & IMPROVEMENTS ── */}
      <section className="bg-muted border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="Analysis" />
          <StrengthsImprovementsSection
            strengths={report.strengths}
            improvements={report.improvements}
            derived={report.derivedStrengthsAndImprovements}
            categories={report.scores.map((s) => s.category)}
          />
        </div>
      </section>

      {/* ── METADATA ── */}
      <section className="bg-background border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <SectionLabel text="Report Details" />
          <div className="border-t border-border mt-2">
            {[
              {
                label: 'Repository',
                value: (
                  <a
                    href={`https://github.com/${report.repositoryName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[15px] hover:underline inline-flex items-center gap-1.5"
                  >
                    {report.repositoryName}
                    <IconExternalLink size={12} />
                  </a>
                ),
              },
              ...(shortSha ? [{
                label: 'Commit',
                value: commitUrl ? (
                  <a href={commitUrl} target="_blank" rel="noreferrer" className="font-mono text-[15px] hover:underline">
                    {shortSha}
                  </a>
                ) : (
                  <span className="font-mono text-[15px]">{shortSha}</span>
                ),
              }] : []),
              {
                label: 'Generated',
                value: <span className="text-[15px]" suppressHydrationWarning>{formatDate(report.generatedAt)}</span>,
              },
              {
                label: 'Analyzer',
                value: <span className="font-mono text-[15px]">{report.modelVersion}</span>,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center h-14 border-b border-border gap-8">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground w-32 shrink-0">{label}</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA for visitors ── */}
      {!viewingUser && (
        <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border bg-foreground">
          <div className="max-w-4xl mx-auto w-full">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-white/40" />
              <span className="text-[13px] uppercase tracking-widest text-white/40">Your turn</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl text-background">
              Verify your own project.
              <br />
              Earn your place.
            </h2>
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none bg-background text-foreground hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
              <Link
                href="/challenges"
                className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-white/30 text-background hover:bg-white/10 transition-colors"
              >
                Browse challenges
              </Link>
            </div>
            <p className="text-sm text-white/50">
              Free to start. No credit card required.
            </p>
          </div>
        </section>
      )}

      {/* ── Attribution ── */}
      <div className="py-8 border-t border-border">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Verified by{' '}
          <Link href="/" className="hover:text-muted-foreground transition-colors underline underline-offset-2">
            Praxis
          </Link>
          {' '}— deterministic repository analysis, not self-reported.
        </p>
      </div>

    </div>
  )
}
