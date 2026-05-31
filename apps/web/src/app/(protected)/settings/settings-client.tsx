'use client'

import { useState } from 'react'
import { IconUser, IconBrandGithub, IconAlertTriangle, IconLogout } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UsernameField } from '@/components/username-field'
import { GitHubConnection } from '@/components/github/github-connection'
import { createClient } from '@/lib/supabase/client'
import { useUser, useSetUsername } from '@/contexts/user-context'
import type { GitHubAccount } from '@praxis/shared'

type Section = 'account' | 'github' | 'danger'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'account', label: 'Account', icon: <IconUser size={16} /> },
  { id: 'github', label: 'GitHub', icon: <IconBrandGithub size={16} /> },
  { id: 'danger', label: 'Danger Zone', icon: <IconAlertTriangle size={16} /> },
]

const SECTION_HEADER: Record<Section, { title: string; subtitle: string }> = {
  account: {
    title: 'Account',
    subtitle: 'Manage your email address and public username.',
  },
  github: {
    title: 'GitHub verification access',
    subtitle: 'This connection is used to analyze repositories for project verification — it is separate from your sign-in method.',
  },
  danger: {
    title: 'Danger zone',
    subtitle: 'Irreversible actions. Proceed carefully.',
  },
}

type Props = {
  initialGithub: GitHubAccount
}

export function SettingsClient({ initialGithub }: Props) {
  const user = useUser()
  const setContextUsername = useSetUsername()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('account')
  const [github, setGithub] = useState<GitHubAccount>(initialGithub)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    if (signOutLoading) return
    setSignOutLoading(true)
    setSignOutError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/sign-in')
      router.refresh()
    } catch {
      setSignOutError('Sign out failed. Please try again.')
      setSignOutLoading(false)
    }
  }

  const { title, subtitle } = SECTION_HEADER[activeSection]

  return (
    <div className="flex h-full">
      <aside className="w-55 shrink-0 border-r border-border flex flex-col pt-4">
        <p className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Settings
        </p>
        <nav className="hidden md:flex flex-col gap-1 px-2">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={[
                'flex items-center gap-2.5 py-2 px-3 text-[14px] rounded-r-md border-l-2 transition-colors text-left w-full',
                activeSection === id
                  ? 'border-foreground bg-muted text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              ].join(' ')}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex md:hidden sticky top-0 z-10 bg-background border-b border-border">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 transition-colors',
                activeSection === id
                  ? 'border-foreground text-foreground font-medium'
                  : 'border-transparent text-muted-foreground',
              ].join(' ')}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="px-8 pt-6 pb-4 shrink-0">
          <h1 className="text-[20px] font-medium text-foreground">{title}</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">{subtitle}</p>
          <Separator className="mt-4" />
        </div>

        <div className="px-8 py-2 overflow-y-auto">
          {activeSection === 'account' && (
            <div className="space-y-6 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} disabled className="opacity-70 cursor-not-allowed" />
                <p className="text-[13px] text-muted-foreground">
                  Email cannot be changed here. Manage it through your auth provider.
                </p>
              </div>
              <UsernameField
                initialValue={user.username ?? (initialGithub.connected ? initialGithub.githubUsername : '')}
                onSaveSuccess={setContextUsername}
              />
            </div>
          )}

          {activeSection === 'github' && (
            <div className="rounded-lg border bg-card p-5 max-w-md">
              <GitHubConnection github={github} onRefresh={setGithub} />
            </div>
          )}

          {activeSection === 'danger' && (
            <div className="rounded-lg border bg-card p-5 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Sign out</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    You will be redirected to the sign-in page.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signOutLoading} className="shrink-0">
                  {signOutLoading ? <Loader2 size={13} className="animate-spin" /> : <><IconLogout size={13} />Sign out</>}
                </Button>
              </div>
              {signOutError && <p className="text-[12px] text-destructive mt-3">{signOutError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
