import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { SettingsClient } from '@/features/settings/components/settings-client'
import type { GitHubAccount, User } from '@praxis/shared'

export const metadata: Metadata = { title: 'Settings — Praxis' }

export default async function SettingsPage() {
  const [, github] = await Promise.all([
    serverApiFetch<User>('/users/me'),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
  ])

  return (
    <div className="h-full flex flex-col">
      <SettingsClient initialGithub={github} />
    </div>
  )
}
