import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserProvider } from '@/features/user/hooks/use-user-context'
import { Sidebar } from '@/shared/components/sidebar'
import { serverApiFetch } from '@/lib/api.server'
import type { GitHubAccount, User } from '@praxis/shared'

const FALLBACK_USER: User = {
  id: '',
  email: '',
  username: null,
  supabaseUid: '',
  createdAt: new Date().toISOString(),
}

async function fetchUserWithRetry(): Promise<User | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await serverApiFetch<User>('/users/me')
    } catch {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
    }
  }
  return null
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/sign-in?next=/studio')

  // Fetch local user — retry up to 3 times with backoff.
  // If the API is unavailable, fall back to a minimal user object so the app
  // still renders (studio page will handle the missing username redirect).
  const localUser = (await fetchUserWithRetry()) ?? { ...FALLBACK_USER, email: user.email ?? '' }

  const githubAccount = await serverApiFetch<GitHubAccount>('/github/account').catch(
    () => ({ connected: false } as GitHubAccount),
  )

  return (
    <UserProvider user={localUser}>
      <div className="h-screen flex bg-background overflow-hidden">
        <Sidebar user={localUser} githubAccount={githubAccount} />
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">{children}</main>
      </div>
    </UserProvider>
  )
}
