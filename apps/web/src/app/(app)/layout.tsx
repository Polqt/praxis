import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/sign-in')

  return (
    <div className="min-h-screen flex bg-background">
      <nav className="w-56 shrink-0 border-r flex flex-col p-4 gap-1 bg-card">
        <span className="text-xl font-bold mb-6 px-2 text-foreground">
          Praxis
        </span>
        <Link
          href="/dashboard"
          className="px-3 py-2 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/tasks"
          className="px-3 py-2 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Tasks
        </Link>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
