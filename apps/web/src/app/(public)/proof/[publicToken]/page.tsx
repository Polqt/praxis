import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { ReportClient } from '@/features/reports/components/report-client'
import { toReport } from '@/features/reports/utils/to-report'
import type { VerificationReport } from '@praxis/shared'

type Props = {
  params: Promise<{ publicToken: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicToken } = await params
  const raw = await serverApiFetch<VerificationReport>(`/proof/${publicToken}`).catch(() => null)
  if (!raw) return { title: 'Proof not found' }

  const repoName = raw.repositoryName ?? 'Unknown repo'
  const verdict = raw.verdict === 'verified' ? 'Verified' : 'Insufficient'
  const score = raw.compositeScore
  const title = `${repoName} — ${verdict} · ${score}/100 | Praxis`
  const description = raw.publicSummary ?? `${repoName} was evaluated by Praxis and scored ${score}/100.`

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
    />
  )
}
