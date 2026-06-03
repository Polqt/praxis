import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { toReport } from '@/features/reports/utils/to-report'
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
    serverApiFetch<{ id: string }>('/users/me').catch(() => null),
  ])

  if (!raw) notFound()

  return (
    <ReportClient
      report={toReport(raw, { isPublic: true })}
      backHref={viewingUser ? '/studio' : '/'}
      backLabel={viewingUser ? 'Back to studio' : 'Back to Praxis'}
      viewCount={raw.viewCount ?? 0}
    />
  )
}
