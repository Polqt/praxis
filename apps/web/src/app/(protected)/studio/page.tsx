import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProofProfileSection } from '@/features/studio/components/proof-profile-section'
import {
  ONBOARDING_GUIDANCE_GITHUB_CONNECTED,
  ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED,
  CARD_LABEL_CLASS,
} from '@/features/studio/constants'
import { formatDate, isTerminalSubmission, repoName, statusLabel } from '@/lib/praxis-format'
import type {
  DashboardStats,
  GitHubAccount,
  ProjectChallenge,
  ProjectSubmission,
  User,
  VerificationReport,
} from '@praxis/shared'

type SubmissionStats = {
  totalSubmissions: number
  verifiedCount: number
  inProgressCount: number
  reportsGenerated: number
}

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `Good ${period}, ${name}.`
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status as Parameters<typeof statusLabel>[0])
  const isActive = !['verified', 'insufficient', 'failed', 'expired'].includes(status)

  if (status === 'verified') {
    return (
      <Badge className="rounded bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'insufficient') {
    return (
      <Badge className="rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (status === 'failed' || status === 'expired') {
    return (
      <Badge variant="destructive" className="rounded text-[11px] font-medium">
        {label}
      </Badge>
    )
  }
  if (isActive) {
    return (
      <Badge variant="secondary" className="rounded text-[11px] font-medium gap-1.5">
        <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="rounded text-[11px] font-medium">
      {label}
    </Badge>
  )
}

export default async function StudioPage() {
  const user = await serverApiFetch<User>('/users/me')
  if (!user.username) redirect('/onboarding/username')

  const [githubAccount, challenges, submissions, submissionStats, dashboard] = await Promise.all([
    serverApiFetch<GitHubAccount>('/github/account').catch(() => null),
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => []),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => []),
    serverApiFetch<SubmissionStats>('/submissions/stats').catch(() => ({
      totalSubmissions: 0,
      verifiedCount: 0,
      inProgressCount: 0,
      reportsGenerated: 0,
    })),
    serverApiFetch<DashboardStats>('/users/me/dashboard').catch(() => ({
      totalVerified: 0,
      totalAttempts: 0,
      verifiedSkills: [],
      recentSubmissions: [],
    })),
  ])

  const challenge = challenges[0]
  const activeSubmission = submissions.find((s) => !isTerminalSubmission(s)) ?? submissions[0] ?? null
  const latestTerminalSubmission = submissions.find(isTerminalSubmission) ?? null
  const latestReport = latestTerminalSubmission
    ? await serverApiFetch<VerificationReport>(`/reports/submissions/${latestTerminalSubmission.id}`).catch(() => null)
    : null
  const displayName = user.username ?? user.email.split('@')[0]
  const total = challenges.length
  const completed = submissionStats.verifiedCount
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  const proofReady = Boolean(user.username && dashboard.verifiedSkills.length > 0)

  return (
    <div className="px-10 py-10 max-w-5xl">
      <section className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{getGreeting(displayName)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {githubAccount?.connected
              ? 'Your GitHub is connected and ready.'
              : 'Connect GitHub before submitting a repository for verification.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/challenges">Browse Challenges</Link>
            </Button>
            {challenge && (
              <Button variant="outline" asChild>
                <Link href={`/submit?challengeId=${challenge.id}`}>Submit Repository</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mt-10 flex divide-x divide-border">
        <div className="pr-8">
          <p className="text-2xl font-semibold tabular-nums">{completed}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Challenges completed</p>
        </div>
        <div className="px-8">
          <p className="text-2xl font-semibold tabular-nums">{dashboard.verifiedSkills.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Verified skills</p>
        </div>
        <div className="pl-8">
          <p className="text-2xl font-semibold tabular-nums">{submissionStats.reportsGenerated}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Reports generated</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Progress value={progress} className="h-[2px] flex-1" />
        <span className="text-xs text-muted-foreground shrink-0">{completed} of {total} challenges</span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-0">
          <div className="rounded-lg border bg-card p-5 flex flex-col h-full">
            <p className={CARD_LABEL_CLASS}>Active submission</p>
            {activeSubmission ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium truncate">
                      {repoName(activeSubmission.githubRepoFullName)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {challenge?.title ?? 'Build a Production REST API'}
                    </p>
                  </div>
                  <StatusBadge status={activeSubmission.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Submitted {formatDate(activeSubmission.submittedAt)}
                </p>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href={`/submissions/${activeSubmission.id}`}>View submission</Link>
                </Button>
              </>
            ) : githubAccount?.connected ? (
              <div className="mt-3">
                <p className="text-sm font-medium">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.heading}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.note}</p>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium">{ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED.heading}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED.body}</p>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href="/settings">Go to Settings</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
          <div className="rounded-lg border bg-card p-5 flex flex-col h-full">
            <p className={CARD_LABEL_CLASS}>Latest report</p>
            {latestReport && latestTerminalSubmission ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium truncate">
                      {repoName(latestTerminalSubmission.githubRepoFullName)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(latestReport.generatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={latestReport.verdict} />
                </div>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href={`/reports/${latestReport.submissionId}`}>View report</Link>
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-3">No report generated yet.</p>
            )}
          </div>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-150">
          <div className="rounded-lg border bg-card p-5 h-full">
            <p className={CARD_LABEL_CLASS}>Verified skills</p>
            {dashboard.verifiedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dashboard.verifiedSkills.map((userSkill) => (
                  <Badge key={userSkill.id} variant="secondary" className="gap-1 text-xs rounded">
                    <span className="text-green-500 text-[10px]">✓</span>
                    {userSkill.skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Skills appear here after your first verified submission.
              </p>
            )}
          </div>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-[225ms]">
          <ProofProfileSection
            username={user.username ?? null}
            skillsCount={dashboard.verifiedSkills.length}
            reportsCount={submissionStats.reportsGenerated}
            proofReady={proofReady}
          />
        </div>
      </div>
    </div>
  )
}
