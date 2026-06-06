'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsernameField } from '@/features/user/hooks/use-username-field'
import { USERNAME_CHANGE_COOLDOWN_MS } from '@/features/user/constants'

type Props = {
  initialValue: string
  hasExistingUsername?: boolean
  usernameUpdatedAt?: string | null
  onSaveSuccess: (username: string) => void
}

function nextChangeDate(usernameUpdatedAt?: string | null): Date | null {
  if (!usernameUpdatedAt) return null
  const date = new Date(new Date(usernameUpdatedAt).getTime() + USERNAME_CHANGE_COOLDOWN_MS)
  return date > new Date() ? date : null
}

export function UsernameField({
  initialValue,
  hasExistingUsername = false,
  usernameUpdatedAt,
  onSaveSuccess,
}: Props) {
  const [lockedUntil, setLockedUntil] = useState<Date | null>(() => nextChangeDate(usernameUpdatedAt))
  const { value, status, validationError, showProofUrl, showUrlChangeWarning, handleChange } = useUsernameField(
    initialValue,
    (username) => {
      onSaveSuccess(username)
      if (hasExistingUsername) {
        setLockedUntil(new Date(Date.now() + USERNAME_CHANGE_COOLDOWN_MS))
      }
    },
  )

  const statusText = (() => {
    if (status.type === 'idle') return null
    if (status.type === 'unsaved') return <span className="text-muted-foreground">· Unsaved changes</span>
    if (status.type === 'saving') return <span className="text-muted-foreground">Saving…</span>
    if (status.type === 'saved') return <span className="text-green-600">Saved</span>
    if (status.type === 'error') return <span className="text-destructive">{status.message}</span>
  })()

  return (
    <div className="space-y-1.5">
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="your-username"
        maxLength={24}
        disabled={lockedUntil !== null}
        className="font-mono w-full"
      />
      {lockedUntil && (
        <p className="text-[13px] text-muted-foreground">
          Username changes are available every 30 days. Next change: {lockedUntil.toLocaleDateString()}.
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[13px] min-h-5">
          {validationError && status.type !== 'idle' ? (
            <span className="text-amber-600">{validationError}</span>
          ) : statusText}
        </span>
        <span className="text-[13px] text-muted-foreground">{value.length}/24</span>
      </div>
      {showProofUrl && (
        <p className="text-[13px] text-muted-foreground">
          Your proof page:{' '}
          <span className="font-mono text-primary">praxis.dev/p/{value}</span>
        </p>
      )}
      {showUrlChangeWarning && (
        <p className="text-[13px] text-amber-600">
          Changing your username will update your public profile URL. Anyone with your old link won&apos;t be able to find you.
        </p>
      )}
    </div>
  )
}
