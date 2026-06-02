import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { UserProvider } from '@/features/user/hooks/use-user-context'
import { Sidebar } from '@/shared/components/sidebar'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import type { GitHubAccount, User } from '@praxis/shared'

export default async function ChallengesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    )
  }

  let localUser: User
  try {
    localUser = await serverApiFetch<User>('/users/me')
  } catch {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    )
  }

  const githubAccount = await serverApiFetch<GitHubAccount>('/github/account').catch(
    () => ({ connected: false } as GitHubAccount),
  )

  return (
    <UserProvider user={localUser}>
      <div className="h-screen flex bg-background overflow-hidden">
        <Sidebar user={localUser} githubAccount={githubAccount} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </UserProvider>
  )
}
