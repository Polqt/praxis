import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserProvider } from '@/features/user/hooks/use-user-context'
import { Sidebar } from '@/shared/components/sidebar'
import { serverApiFetch } from '@/lib/api.server'
import type { GitHubAccount, User } from '@praxis/shared'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/sign-in?next=/studio')

  let localUser: User
  try {
    localUser = await serverApiFetch<User>('/users/me')
  } catch {
    redirect('/sign-in?next=/studio')
  }

  const githubAccount = await serverApiFetch<GitHubAccount>('/github/account').catch(
    () => ({ connected: false } as GitHubAccount),
  )

  return (
    <UserProvider user={localUser!}>
      <div className="h-screen flex bg-background overflow-hidden">
        <Sidebar user={localUser!} githubAccount={githubAccount} />
        {/* pt-14 on mobile offsets the fixed top bar; removed on md+ where sidebar is visible */}
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">{children}</main>
      </div>
    </UserProvider>
  )
}
