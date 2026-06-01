import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type {
  DashboardStats,
  GitHubAccount,
  ProjectChallenge,
  ProjectSubmission,
  User,
  VerificationReport,
} from '@praxis/shared'
import { formatDate, isTerminalSubmission, repoName, statusLabel } from '@/lib/praxis-format'

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

export default async function StudioPage() {
  const [user, githubAccount, challenges, submissions, submissionStats, dashboard] = await Promise.all([
    serverApiFetch<User>('/users/me'),
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
  const activeSubmission = submissions.find((submission) => !isTerminalSubmission(submission)) ?? submissions[0] ?? null
  const latestTerminalSubmission = submissions.find(isTerminalSubmission) ?? null
  const latestReport = latestTerminalSubmission
    ? await serverApiFetch<VerificationReport>(`/submissions/${latestTerminalSubmission.id}/report`).catch(() => null)
    : null
  const displayName = user.username ?? user.email.split('@')[0]
  const progress = challenges.length > 0
    ? Math.min(100, Math.round((submissionStats.verifiedCount / challenges.length) * 100))
    : 0
  const proofReady = Boolean(user.username && dashboard.verifiedSkills.length > 0)
  const proofHref = latestReport?.isPublic && latestReport.publicToken
    ? `/proof/${latestReport.publicToken}`
    : null

  return (
    <div className="px-10 py-8 max-w-6xl">
      <section className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <Badge variant={githubAccount?.connected ? 'default' : 'outline'}>
            {githubAccount?.connected ? 'GitHub connected' : 'GitHub not connected'}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{getGreeting(displayName)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {githubAccount?.connected
              ? 'Your GitHub is connected and ready.'
              : 'Connect GitHub before submitting a repository for verification.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/studio/challenges">Browse Challenges</Link>
            </Button>
            {challenge && (
              <Button variant="outline" asChild>
                <Link href={`/studio/submit?challengeId=${challenge.id}`}>Submit Repository</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-semibold tabular-nums">{submissionStats.verifiedCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Challenges Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-semibold tabular-nums">{dashboard.verifiedSkills.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Verified Skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-semibold tabular-nums">{submissionStats.reportsGenerated}</p>
            <p className="mt-1 text-xs text-muted-foreground">Reports Generated</p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm tabular-nums text-muted-foreground">{progress}%</span>
          </div>
        </CardContent>
      </Card>

      <section className="mt-6 grid grid-cols-[1.2fr_0.8fr] gap-5">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Active Submission</p>
            {activeSubmission ? (
              <div className="mt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{repoName(activeSubmission.githubRepoFullName)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {challenge?.title ?? 'Build a Production REST API'}
                    </p>
                  </div>
                  <Badge variant="outline">{statusLabel(activeSubmission.status)}</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Submitted {formatDate(activeSubmission.submittedAt)}
                </p>
                <Button className="mt-5" variant="outline" asChild>
                  <Link href={`/studio/submissions/${activeSubmission.id}`}>View Submission</Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No repository submitted yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest Report</p>
            {latestReport && latestTerminalSubmission ? (
              <div className="mt-4">
                <p className="font-medium">{repoName(latestTerminalSubmission.githubRepoFullName)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{latestReport.verdict}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(latestReport.generatedAt)}</span>
                </div>
                <Button className="mt-5" variant="outline" asChild>
                  <Link href={`/studio/submissions/${latestReport.submissionId}/report`}>View Report</Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No report generated yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-[1fr_360px] gap-5">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Verified Skills</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dashboard.verifiedSkills.length > 0 ? dashboard.verifiedSkills.map((userSkill) => (
                <Badge key={userSkill.id} variant="secondary">{userSkill.skill.name}</Badge>
              )) : (
                <p className="text-sm text-muted-foreground">No verified skills yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Proof Profile</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Username</span>
                <span>{user.username ? `@${user.username}` : 'Not set'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reports</span>
                <span>{submissionStats.reportsGenerated}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Skills</span>
                <span>{dashboard.verifiedSkills.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span>{proofReady ? 'Ready' : 'Incomplete'}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" variant="outline" asChild>
              {proofHref ? (
                <Link href={proofHref}>View Proof Page</Link>
              ) : (
                <Link href="/settings">Set Username</Link>
              )}
            </Button>
          </CardContent>
        </Card>
      </section>
      </div>
  )
}
