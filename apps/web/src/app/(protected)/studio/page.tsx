import { serverApiFetch } from '@/lib/api.server'
import { StudioClient } from '@/features/studio/components/studio-client'
import type { GitHubAccount, User } from '@praxis/shared'
import type { StudioStats, ProjectSubmission } from '@/features/studio/types'
import { DEFAULT_STATS } from '@/features/studio/constants/studio.constants'

export default async function StudioPage() {
  const [user, githubAccount, latestSubmission, stats] = await Promise.all([
    serverApiFetch<User>('/users/me'),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
    serverApiFetch<ProjectSubmission>('/submissions?limit=1&sort=desc').catch(() => null),
    serverApiFetch<StudioStats>('/submissions/stats').catch(() => DEFAULT_STATS),
  ])

  return (
    <StudioClient
      user={user}
      githubAccount={githubAccount}
      latestSubmission={latestSubmission}
      stats={stats}
    />
  )
}
