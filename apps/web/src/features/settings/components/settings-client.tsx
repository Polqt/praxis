'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconUser, IconBrandGithub, IconAlertTriangle, IconLogout, IconCopy, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UsernameField } from '@/features/user/components/username-field'
import { GitHubConnectionStatus } from '@/features/github/components/github-connection-status'
import { createClient } from '@/lib/supabase/client'
import { useUser, useSetUsername } from '@/features/user/hooks/use-user-context'
import { useSettingsNav } from '@/features/settings/hooks/use-settings-nav'
import {
  PROFILE_URL_COPY_RESET_MS,
  SETTINGS_NAV_ITEMS,
  SETTINGS_SECTION_HEADERS,
  SIGN_OUT_ERROR_MESSAGE,
} from '@/features/settings/constants'
import { fadeUp } from '@/lib/animations'
import type { GitHubAccount } from '@praxis/shared'
import type { SettingsSection } from '@/features/settings/types'

function SettingsNavIcon({ section }: { section: SettingsSection }) {
  if (section === 'github') return <IconBrandGithub size={16} />
  if (section === 'danger') return <IconAlertTriangle size={16} />
  return <IconUser size={16} />
}

type Props = {
  initialGithub: GitHubAccount
}

export function SettingsClient({ initialGithub }: Props) {
  const user = useUser()
  const setContextUsername = useSetUsername()
  const router = useRouter()
  const { activeSection, setActiveSection } = useSettingsNav()
  const [github, setGithub] = useState<GitHubAccount>(initialGithub)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [profileUrlCopied, setProfileUrlCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCopyProfileUrl() {
    if (!user.username) return
    void navigator.clipboard.writeText(`${window.location.origin}/p/${user.username}`)
    setProfileUrlCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(
      () => setProfileUrlCopied(false),
      PROFILE_URL_COPY_RESET_MS,
    )
  }

  async function handleSignOut() {
    if (signOutLoading) return
    setSignOutLoading(true)
    setSignOutError('') // clear any previous error before retrying
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/sign-in')
      router.refresh()
    } catch {
      setSignOutError(SIGN_OUT_ERROR_MESSAGE)
      setSignOutLoading(false)
    }
  }

  const { title, subtitle } = SETTINGS_SECTION_HEADERS[activeSection]

  return (
    <div className="flex flex-col sm:flex-row h-full">
      <aside className="w-full sm:w-55 shrink-0 border-b sm:border-b-0 sm:border-r border-border flex flex-col pt-4">
        <p className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Settings</p>
        <nav className="hidden md:flex flex-col gap-1 px-2">
          {SETTINGS_NAV_ITEMS.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setActiveSection(id)}
              className={['flex items-center gap-2.5 py-2 px-3 text-[14px] rounded-r-md border-l-2 transition-colors text-left w-full',
                activeSection === id ? 'border-foreground bg-muted text-foreground font-medium' : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              ].join(' ')}>
              <SettingsNavIcon section={id} />{label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex md:hidden sticky top-0 z-10 bg-background border-b border-border">
          {SETTINGS_NAV_ITEMS.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setActiveSection(id)}
              className={['flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 transition-colors',
                activeSection === id ? 'border-foreground text-foreground font-medium' : 'border-transparent text-muted-foreground',
              ].join(' ')}>
              <SettingsNavIcon section={id} />{label}
            </button>
          ))}
        </div>
        <div className="px-4 sm:px-8 pt-5 pb-4 shrink-0">
          <h1 className="text-[20px] font-medium text-foreground">{title}</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">{subtitle}</p>
          <Separator className="mt-4" />
        </div>
        <div className="px-4 sm:px-8 py-2 overflow-y-auto">
          <AnimatePresence mode="wait">
          {activeSection === 'account' && (
            <motion.div key="account" variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} disabled className="opacity-70 cursor-not-allowed" />
                <p className="text-[13px] text-muted-foreground">
                  Email cannot be changed here.{' '}
                  <a
                    href="https://supabase.com/dashboard/account"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Manage it in your Supabase account.
                  </a>
                </p>
              </div>
              <UsernameField
                initialValue={user.username ?? (initialGithub.connected ? initialGithub.githubUsername : '')}
                hasExistingUsername={Boolean(user.username)}
                usernameUpdatedAt={user.usernameUpdatedAt}
                onSaveSuccess={setContextUsername}
              />
              {user.username && (
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[12px] text-muted-foreground">Public profile</p>
                    <p className="text-[13px] font-mono truncate">{typeof window !== 'undefined' ? window.location.host : 'praxisdev.vercel.app'}/p/{user.username}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyProfileUrl} title="Copy link" aria-label="Copy profile URL">
                      {profileUrlCopied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Open profile" aria-label="Open public profile">
                      <a href={`/p/${user.username}`} target="_blank" rel="noreferrer">
                        <IconExternalLink size={13} />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {activeSection === 'github' && (
            <motion.div key="github" variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border bg-card p-5 max-w-md">
              <GitHubConnectionStatus github={github} onRefresh={setGithub} />
            </motion.div>
          )}
          {activeSection === 'danger' && (
            <motion.div key="danger" variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border bg-card p-5 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Sign out</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">You will be redirected to the sign-in page.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signOutLoading} className="shrink-0">
                  {signOutLoading ? <Loader2 size={13} className="animate-spin" /> : <><IconLogout size={13} />Sign out</>}
                </Button>
              </div>
              {signOutError && <p className="text-[12px] text-destructive mt-3">{signOutError}</p>}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
