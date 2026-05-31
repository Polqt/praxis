'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GitHubConnection } from '@/components/github/github-connection'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { apiClient, ApiError } from '@/lib/api'
import { useSetUsername } from '@/contexts/user-context'
import type { GitHubAccount, User } from '@praxis/shared'

const USERNAME_RE = /^[a-z0-9_-]{3,24}$/

interface Props {
  user: User
  initialGithub: GitHubAccount | null
}

export function SettingsForm({ user, initialGithub }: Props) {
  const setContextUsername = useSetUsername()
  const [username, setUsername] = useState(user.username ?? '')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [github, setGithub] = useState<GitHubAccount | null>(initialGithub)

  const isValid = USERNAME_RE.test(username)
  const inlineError = (() => {
    if (!username) return ''
    if (username.length < 3) return 'At least 3 characters'
    if (username.length > 24) return 'Max 24 characters'
    if (!/^[a-z0-9_-]+$/.test(username)) return 'Only lowercase letters, numbers, - and _'
    return ''
  })()

  async function saveUsername() {
    if (!isValid || usernameLoading) return
    setUsernameLoading(true)
    setUsernameError('')
    setUsernameSaved(false)
    try {
      const updated = await apiClient.patchMe({ username })
      setContextUsername(updated.username!)
      setUsernameSaved(true)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setUsernameError('That username is already taken.')
      } else {
        setUsernameError('Something went wrong. Please try again.')
      }
    } finally {
      setUsernameLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-12">

      {/* Account */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">Account</h2>

        <div className="space-y-6">
          {/* Email — read only */}
          <div>
            <label className="block text-[12px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5">
              Email address
            </label>
            <Input
              value={user.email}
              readOnly
              className="h-11 rounded-none border-border bg-muted text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Email cannot be changed here. Manage it through your auth provider.
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[12px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5">
              Username
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase())
                    setUsernameSaved(false)
                  }}
                  placeholder="your-username"
                  maxLength={24}
                  className="h-11 rounded-none border-border font-mono focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && saveUsername()}
                />
                <div className="flex items-center justify-between mt-1">
                  <div>
                    {inlineError && (
                      <p className="text-[11px] text-destructive">{inlineError}</p>
                    )}
                    {usernameError && (
                      <p className="text-[11px] text-destructive">{usernameError}</p>
                    )}
                    {usernameSaved && (
                      <p className="text-[11px] text-green-600">Saved</p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{username.length}/24</p>
                </div>
              </div>
              <button
                type="button"
                onClick={saveUsername}
                disabled={!isValid || usernameLoading || username === (user.username ?? '')}
                className="h-11 px-5 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                {usernameLoading ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
              </button>
            </div>
            {username && isValid && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Your proof page: <span className="font-mono text-foreground">praxis.dev/p/{username}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* GitHub Connection */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">GitHub Verification Access</h2>
        <p className="text-[12px] text-muted-foreground mb-4">
          This connection is used to analyze repositories for project verification — it is separate from your sign-in method.
        </p>
        <GitHubConnection github={github} onRefresh={setGithub} />
      </section>

      <div className="border-t border-border" />

      {/* Danger zone */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">Danger Zone</h2>
        <div className="border border-border p-5">
          <p className="text-[13px] text-foreground font-medium mb-1">Sign out</p>
          <p className="text-[12px] text-muted-foreground mb-4">You will be redirected to the sign-in page.</p>
          <SignOutButton />
        </div>
      </section>
    </div>
  )
}
