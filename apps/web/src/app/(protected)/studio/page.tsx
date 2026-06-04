import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { ApiAccountError } from '@/features/auth/components/api-account-error'
import { StudioClient } from '@/features/studio/components/studio-client'
import { isTerminalSubmission } from '@/lib/praxis-format'
import type {
  DashboardStats,
  GitHubAccount,
  ProjectChallenge,
  ProjectSubmission,
  User,
  VerificationReport,
} from '@praxis/shared'
import type { ScoreHistoryEntry } from '@/lib/api'

type SubmissionStats = {
  totalSubmissions: number
  verifiedCount: number
  inProgressCount: number
  reportsGenerated: number
}

export default async function StudioPage() {
  let user: User | null = null
  let userError: unknown = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      user = await serverApiFetch<User>('/users/me')
      userError = null
      break
    } catch (err) {
      userError = err
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
    }
  }
  if (!user) return <ApiAccountError error={userError} />
  if (!user.username) redirect('/onboarding/username')

  const [githubAccount, challenges, submissions, submissionStats, dashboard, scoreHistory] = await Promise.all([
    serverApiFetch<GitHubAccount>('/github/account').catch(() => null),
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => []),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => []),
    serverApiFetch<SubmissionStats>('/submissions/stats').catch(() => ({
      totalSubmissions: 0, verifiedCount: 0, inProgressCount: 0, reportsGenerated: 0,
    })),
    serverApiFetch<DashboardStats>('/users/me/dashboard').catch(() => ({
      totalVerified: 0, totalAttempts: 0, verifiedSkills: [], recentSubmissions: [],
    })),
    serverApiFetch<ScoreHistoryEntry[]>('/users/me/score-history').catch(() => [] as ScoreHistoryEntry[]),
  ])

  const challenge = challenges[0] ?? null
  const activeSubmission = submissions.find((s) => !isTerminalSubmission(s)) ?? null
  const activeChallenge = activeSubmission
    ? (challenges.find((c) => c.id === activeSubmission.challengeId) ?? challenge)
    : challenge
  const latestTerminalSubmission = submissions.find(isTerminalSubmission) ?? null
  const latestReport = latestTerminalSubmission
    ? await serverApiFetch<VerificationReport>(`/reports/submissions/${latestTerminalSubmission.id}`).catch(() => null)
    : null

  // Separate standard (threshold ≥ 70) from easy (threshold < 70) so easy challenges
  // don't inflate the progress bar shown to the user
  const standardChallenges = challenges.filter((c) => (c.passingThreshold ?? 70) >= 70)
  const total = standardChallenges.length
  const completed = submissionStats.verifiedCount
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  const proofReady = Boolean(user.username && dashboard.verifiedSkills.length > 0)

  return (
    <StudioClient
      displayName={user.username ?? user.email.split('@')[0]}
      githubAccount={githubAccount}
      activeSubmission={activeSubmission}
      activeChallenge={activeChallenge}
      latestTerminalSubmission={latestTerminalSubmission}
      latestReport={latestReport}
      submissionStats={submissionStats}
      dashboard={dashboard}
      username={user.username}
      progress={progress}
      completed={completed}
      total={total}
      proofReady={proofReady}
      scoreHistory={scoreHistory}
      challenges={challenges}
      verifiedSubmissions={submissions.filter((s) => s.status === 'verified')}
    />
  )
}
