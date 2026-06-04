import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { UserProvider } from '@/features/user/hooks/use-user-context'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import type { User } from '@praxis/shared'

export default async function ChallengesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Challenges is a public marketing page — always uses site header/footer, never sidebar.
  // UserProvider is populated when authenticated so client components can read the user.
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    )
  }

  const localUser = await serverApiFetch<User>('/users/me').catch(() => null)

  if (!localUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <UserProvider user={localUser}>
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </UserProvider>
  )
}
