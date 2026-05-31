import { serverApiFetch } from '@/lib/api.server'
import { StudioClient } from './studio-client'
import type { GitHubAccount, User } from '@praxis/shared'

export default async function StudioPage() {
  const [user, githubAccount] = await Promise.all([
    serverApiFetch<User>('/users/me'),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
  ])

  return <StudioClient user={user} githubAccount={githubAccount} />
}
