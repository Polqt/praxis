import Link from 'next/link'
import {
  IconLayoutDashboard,
  IconTrophy,
  IconSend,
  IconFileAnalytics,
  IconSettings,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import type { GitHubAccount, User } from '@praxis/shared'

const NAV_ITEMS = [
  { href: '/studio', label: 'Studio', icon: IconLayoutDashboard },
  { href: '/challenges', label: 'Challenges', icon: IconTrophy },
  { href: '/submissions', label: 'Submissions', icon: IconSend },
  { href: '/reports', label: 'Reports', icon: IconFileAnalytics },
  { href: '/settings', label: 'Settings', icon: IconSettings },
]

type Props = {
  user: User
  githubAccount: GitHubAccount
}

export function Sidebar({ user, githubAccount }: Props) {
  return (
    <aside className="w-52 shrink-0 border-r border-border flex flex-col bg-background h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/studio" className="text-[15px] font-semibold tracking-tight text-foreground">
          Praxis
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground rounded-sm hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <Separator />
      </div>

      <div className="px-5 py-3 flex items-center gap-2">
        {githubAccount.connected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">GitHub Connected</p>
              <p className="text-[12px] text-muted-foreground truncate">@{githubAccount.githubUsername}</p>
            </div>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full border border-muted-foreground shrink-0" />
            <p className="text-[12px] text-muted-foreground">GitHub not connected</p>
          </>
        )}
      </div>

      <div className="px-3 pb-3 flex flex-col gap-1">
        <p className="px-3 text-[11px] text-muted-foreground truncate">{user.email}</p>
        <SignOutButton />
      </div>
    </aside>
  )
}
