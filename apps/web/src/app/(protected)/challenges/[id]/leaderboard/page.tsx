import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft, IconTrophy, IconMedal, IconAward, IconExternalLink } from '@tabler/icons-react'
import { serverApiFetch } from '@/lib/api.server'
import type { ProjectChallenge } from '@praxis/shared'
import type { ChallengeLeaderboardEntry } from '@/lib/api'

type Props = {
  params: Promise<{ id: string }>
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <IconTrophy size={16} className="text-amber-400 shrink-0" />
  if (rank === 2) return <IconMedal size={16} className="text-slate-400 shrink-0" />
  if (rank === 3) return <IconAward size={16} className="text-amber-700 shrink-0" />
  return <span className="text-sm font-mono text-muted-foreground w-5 text-center shrink-0">{rank}</span>
}

export default async function ChallengeLeaderboardPage({ params }: Props) {
  const { id } = await params

  const [challenge, entries] = await Promise.all([
    serverApiFetch<ProjectChallenge>(`/challenges/${id}`).catch(() => null),
    serverApiFetch<ChallengeLeaderboardEntry[]>(`/challenges/${id}/leaderboard?limit=50`).catch(() => []),
  ])

  if (!challenge) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href={`/challenges/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={14} />
            Back to challenge
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-primary" />
          <span className="text-[13px] uppercase tracking-widest text-muted-foreground">Leaderboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{challenge.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Top verified submissions, ranked by composite score.
        </p>

        {entries.length === 0 ? (
          <div className="border border-border rounded-none py-20 text-center">
            <p className="text-sm text-muted-foreground">No verified submissions yet.</p>
            <Link
              href={`/challenges/${id}`}
              className="inline-flex items-center justify-center mt-4 h-9 px-6 text-[11px] font-medium uppercase tracking-widest bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Be the first
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 px-4 sm:px-6 py-3 border border-b-0 border-border bg-muted/50">
              <div className="w-8 shrink-0" />
              <div className="flex-1">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Developer</span>
              </div>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium text-right w-24">Score</span>
            </div>

            <div className="border border-border">
              {entries.map((entry) => (
                <div
                  key={entry.username}
                  className={[
                    'flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 border-b border-border last:border-b-0',
                    entry.rank <= 3 ? 'bg-muted/20' : '',
                  ].join(' ')}
                >
                  <div className="w-8 flex justify-center shrink-0">
                    <RankIcon rank={entry.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/p/${entry.username}`}
                      className="text-[15px] font-medium hover:underline underline-offset-2"
                    >
                      @{entry.username}
                    </Link>
                    {entry.verifiedAt && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(entry.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right w-24">
                      <p className="text-[15px] font-semibold tabular-nums">
                        {entry.compositeScore}
                        <span className="text-xs font-normal text-muted-foreground">/100</span>
                      </p>
                    </div>
                    {entry.publicToken && (
                      <Link
                        href={`/proof/${entry.publicToken}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="View proof"
                      >
                        <IconExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
