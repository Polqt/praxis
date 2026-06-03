import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { IconArrowLeft, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { serverApiFetch } from '@/lib/api.server'
import { ShareProofButton } from '@/features/reports/components/share-proof-button'
import { ScoreOverview } from '@/features/reports/components/score-overview'
import { ScoreErrorBoundary } from '@/features/reports/components/score-error-boundary'
import { StrengthsImprovementsSection } from '@/features/reports/components/strengths-improvements-section'
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

  const backHref = viewingUser ? '/studio' : '/'
  const backLabel = viewingUser ? 'Back to studio' : 'Back to Praxis'

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar — just back button + share */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={14} />
            {backLabel}
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

      {/* Proof content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
              Verification Report
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono truncate">
              {report.repositoryName}
            </h1>
            {report.challengeTitle && (
              <p className="text-sm text-muted-foreground mt-1">{report.challengeTitle}</p>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${statusConfig.className}`}>
              {isVerified && <IconCheck size={13} strokeWidth={2.5} />}
              {statusConfig.label}
            </span>
            <p className="text-3xl font-semibold tabular-nums">
              {report.compositeScore ?? 0}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
        </div>

        <hr className="border-border mb-8" />

        {/* Summary */}
        {report.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            {report.summary}
          </p>
        )}

        {/* Score breakdown */}
        <ScoreErrorBoundary>
          <ScoreOverview
            scores={report.scores}
            repositoryName={report.repositoryName}
            commitSha={report.commitSha}
          />
        </ScoreErrorBoundary>

        {/* Strengths & improvements */}
        <div className="mt-10">
          <StrengthsImprovementsSection
            strengths={report.strengths}
            improvements={report.improvements}
            derived={report.derivedStrengthsAndImprovements}
          />
        </div>

        <hr className="border-border mt-12 mb-8" />

        {/* Metadata footer */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 mb-10">
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Repository</p>
            <a
              href={`https://github.com/${report.repositoryName}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono hover:underline inline-flex items-center gap-1"
            >
              {report.repositoryName}
              <IconExternalLink size={10} />
            </a>
          </div>
          {shortSha && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Commit</p>
              {commitUrl ? (
                <a href={commitUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono hover:underline">
                  {shortSha}
                </a>
              ) : (
                <p className="text-[11px] font-mono">{shortSha}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Generated</p>
            <p className="text-[11px]" suppressHydrationWarning>{formatDate(report.generatedAt)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Analyzer</p>
            <p className="text-[11px] font-mono">{report.modelVersion}</p>
          </div>
        </div>

        {/* CTA for visitors who aren't signed in */}
        {!viewingUser && (
          <div className="rounded-lg border border-border bg-muted/40 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Verify your own project</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submit a real GitHub repository and earn your own verified proof of work.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="shrink-0 inline-flex items-center justify-center h-9 px-5 text-[11px] font-medium uppercase tracking-widest bg-foreground text-background rounded-none hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        )}

        {/* Praxis attribution */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-8">
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
