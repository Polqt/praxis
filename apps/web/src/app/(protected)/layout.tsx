import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserProvider } from '@/contexts/user-context'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { serverApiFetch } from '@/lib/api.server'
import type { User } from '@praxis/shared'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/sign-in')

  let localUser: User
  try {
    localUser = await serverApiFetch<User>('/users/me')
  } catch {
    redirect('/sign-in')
  }

  return (
    <UserProvider user={localUser!}>
      <div className="min-h-screen flex bg-background">
        <aside className="w-52 shrink-0 border-r border-border flex flex-col bg-background">
          <div className="px-5 py-5 border-b border-border">
            <Link href="/studio" className="text-[15px] font-semibold tracking-tight text-foreground">
              Praxis
            </Link>
          </div>
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            <Link
              href="/studio"
              className="px-3 py-2 text-[13px] text-muted-foreground rounded-sm hover:bg-muted hover:text-foreground transition-colors"
            >
              Studio
            </Link>
            <Link
              href="/challenges"
              className="px-3 py-2 text-[13px] text-muted-foreground rounded-sm hover:bg-muted hover:text-foreground transition-colors"
            >
              Challenges
            </Link>
          </nav>
          <div className="px-3 py-3 border-t border-border flex flex-col gap-1">
            <p className="px-3 text-[11px] text-muted-foreground truncate">{localUser!.email}</p>
            <SignOutButton />
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </UserProvider>
  )
}
