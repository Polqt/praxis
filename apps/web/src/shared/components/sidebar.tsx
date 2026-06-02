'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  IconLayoutSidebar,
  IconTrophy,
  IconSend,
  IconFileAnalytics,
  IconSettings,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { GitHubAccount, User } from '@praxis/shared'

const NAV_ITEMS = [
  { href: '/studio', label: 'Studio', icon: IconLayoutSidebar, activePrefix: undefined },
  { href: '/challenges', label: 'Challenges', icon: IconTrophy, activePrefix: undefined },
  { href: '/submissions', label: 'Submissions', icon: IconSend, activePrefix: undefined },
  { href: '/submissions', label: 'Reports', icon: IconFileAnalytics, activePrefix: '/reports' },
  { href: '/settings', label: 'Settings', icon: IconSettings, activePrefix: undefined },
]

type Props = {
  user: User
  githubAccount: GitHubAccount
}

export function Sidebar({ user, githubAccount }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen flex flex-col border-r border-border bg-background">
      <div className="px-5 py-5">
        <Link href="/studio" className="text-base font-semibold tracking-tight text-foreground">
          Praxis
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, activePrefix }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`) ||
            (activePrefix !== undefined && (pathname === activePrefix || pathname.startsWith(`${activePrefix}/`)))
          return (
            <Link
              key={label}
              href={href}
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              ].join(' ')}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 text-left truncate">
              <span className="truncate text-xs">{user.email}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <div className="px-2 py-1.5 flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full inline-block shrink-0 ${githubAccount.connected ? 'bg-green-500' : 'bg-muted-foreground'}`}
              />
              <span className="text-xs text-muted-foreground">
                {githubAccount.connected ? 'GitHub Connected' : 'Not connected'}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleSignOut}
              disabled={signingOut}
              className="text-xs text-muted-foreground focus:text-foreground cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
