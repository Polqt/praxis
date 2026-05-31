'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, GitBranch, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useUser } from '@/contexts/user-context'
import type { DashboardStats, GitHubAccount } from '@praxis/shared'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{text}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    verified: { label: 'Verified', color: 'text-green-600 bg-green-50 border-green-200' },
    analyzing: { label: 'Analyzing', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    queued: { label: 'Queued', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ingesting: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    failed: { label: 'Failed', color: 'text-red-600 bg-red-50 border-red-200' },
    insufficient: { label: 'Insufficient', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    created: { label: 'Created', color: 'text-muted-foreground bg-muted border-border' },
  }
  const s = map[status] ?? { label: status, color: 'text-muted-foreground bg-muted border-border' }
  return (
    <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border ${s.color}`}>
      {s.label}
    </span>
  )
}

export default function StudioPage() {
  const user = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [github, setGithub] = useState<GitHubAccount | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.getDashboard(),
      apiClient.getGitHubAccount().catch(() => null),
    ]).then(([s, g]) => {
      setStats(s)
      setGithub(g)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const githubConnected = !!github
  const hasSubmissions = (stats?.recentSubmissions?.length ?? 0) > 0
  const hasVerifiedSkills = (stats?.verifiedSkills?.length ?? 0) > 0

  if (loading) {
    return (
      <div className="p-10 max-w-4xl">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-10" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="p-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {user.username ? `${user.username}'s Studio` : 'Praxis Studio'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {!githubConnected
            ? "Connect GitHub to start verifying your projects."
            : !hasSubmissions
              ? "You're one verified project away from making your GitHub speak for itself."
              : "Your proof-of-work command center."}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
            Verified Projects
          </p>
          <p className="text-4xl font-bold text-foreground tabular-nums">
            {stats?.totalVerified ?? 0}
          </p>
        </div>
        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
            Total Submissions
          </p>
          <p className="text-4xl font-bold text-foreground tabular-nums">
            {stats?.totalAttempts ?? 0}
          </p>
        </div>
        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
            GitHub
          </p>
          {githubConnected ? (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                @{github!.githubUsername}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <AlertCircle size={16} className="text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Not connected</span>
            </div>
          )}
        </div>
      </div>

      {/* GitHub CTA — only shown when not connected */}
      {!githubConnected && (
        <div className="border border-border p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <SectionLabel text="Action required" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Connect GitHub to start verifying your projects.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Praxis reads your commit history, code structure, and architecture. You
              choose which repository to submit. We request read-only access scoped to
              that repository only.
            </p>
          </div>
          <Link
            href="/studio/connect-github"
            className="inline-flex items-center gap-2 h-11 px-8 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity shrink-0"
          >
            <GitBranch size={14} />
            Connect GitHub
          </Link>
        </div>
      )}

      {/* Primary CTAs — shown when GitHub is connected */}
      {githubConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border border-border p-6 flex flex-col justify-between">
            <div>
              <SectionLabel text="Primary action" />
              <h3 className="text-lg font-bold text-foreground mb-2">Verify a project</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit a GitHub repository for independent verification. Receive a
                permanent proof page.
              </p>
            </div>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 mt-6 text-[11px] font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Choose a challenge <ArrowRight size={13} />
            </Link>
          </div>

          <div className="border border-border p-6 flex flex-col justify-between bg-muted">
            <div>
              <SectionLabel text="Browse" />
              <h3 className="text-lg font-bold text-foreground mb-2">Verification challenges</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full-stack, backend, frontend. Each challenge defines exactly what will
                be evaluated.
              </p>
            </div>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 mt-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse challenges <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent submissions */}
      <div className="mb-8">
        <SectionLabel text="Recent submissions" />
        {!hasSubmissions ? (
          <div className="border border-border p-8 text-center">
            <Clock size={20} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {githubConnected
                ? 'Choose a challenge and submit a repository for verification.'
                : 'Connect GitHub first, then submit a project.'}
            </p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {stats!.recentSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground font-mono truncate">
                    {sub.githubRepoFullName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={sub.status} />
                  {sub.status === 'verified' && (
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="text-[11px] uppercase tracking-widest text-primary hover:underline"
                    >
                      View report
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified skills */}
      {hasVerifiedSkills && (
        <div>
          <SectionLabel text="Verified skills" />
          <div className="flex flex-wrap gap-2">
            {stats!.verifiedSkills.map((us) => (
              <Badge
                key={us.id}
                variant="secondary"
                className="text-xs rounded-none px-3 py-1 uppercase tracking-wide"
              >
                {us.skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
