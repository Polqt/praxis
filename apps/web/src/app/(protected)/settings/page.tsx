import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { SettingsForm } from './settings-form'
import type { GitHubAccount, User } from '@praxis/shared'

export const metadata: Metadata = { title: 'Settings — Praxis' }

export default async function SettingsPage() {
  const [user, github] = await Promise.all([
    serverApiFetch<User>('/users/me'),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => null),
  ])

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and connections.</p>
      </div>
      <SettingsForm user={user} initialGithub={github} />
    </div>
  )
}
