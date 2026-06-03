'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  IconLayoutSidebar,
  IconTrophy,
  IconSend,
  IconSettings,
  IconMenu2,
  IconX,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { GitHubAccount, User } from '@praxis/shared'

const NAV_ITEMS = [
  { href: '/studio', label: 'Studio', icon: IconLayoutSidebar },
  { href: '/challenges', label: 'Challenges', icon: IconTrophy },
  { href: '/submissions', label: 'Submissions', icon: IconSend },
  { href: '/settings', label: 'Settings', icon: IconSettings },
]

type Props = {
  user: User
  githubAccount: GitHubAccount
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
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
  )
}

function UserMenu({ user, githubAccount }: { user: User; githubAccount: GitHubAccount }) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    await createClient().auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 text-left truncate">
          <span className="truncate text-xs">{user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <div className="px-2 py-1.5 flex items-center gap-2">
          <span className={`size-1.5 rounded-full inline-block shrink-0 ${githubAccount.connected ? 'bg-green-500' : 'bg-muted-foreground'}`} />
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
  )
}

export function Sidebar({ user, githubAccount }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="px-5 py-5">
        <Link href="/studio" className="text-base font-semibold tracking-tight text-foreground">
          Praxis
        </Link>
      </div>
      <Separator />
      <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      <Separator />
      <div className="px-3 py-3">
        <UserMenu user={user} githubAccount={githubAccount} />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen flex-col border-r border-border bg-background shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-background">
        <Link href="/studio" className="text-base font-semibold tracking-tight text-foreground">
          Praxis
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
