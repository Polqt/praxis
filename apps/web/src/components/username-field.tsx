'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient, ApiError } from '@/lib/api'
import { validateUsername, USERNAME_RE } from '@/lib/username'

type SaveStatus =
  | { type: 'idle' }
  | { type: 'unsaved' }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'error'; message: string }

type Props = {
  initialValue: string
  onSaveSuccess: (username: string) => void
}

export function UsernameField({ initialValue, onSaveSuccess }: Props) {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<SaveStatus>({ type: 'idle' })

  const savedUsername = useRef(initialValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      if (savedClearTimer.current) clearTimeout(savedClearTimer.current)
    }
  }, [])

  function handleChange(raw: string) {
    const next = raw.toLowerCase()
    setValue(next)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (savedClearTimer.current) clearTimeout(savedClearTimer.current)

    if (next === savedUsername.current) {
      setStatus({ type: 'idle' })
      return
    }

    setStatus({ type: 'unsaved' })

    if (!USERNAME_RE.test(next)) return

    debounceTimer.current = setTimeout(() => {
      save(next)
    }, 600)
  }

  async function save(username: string) {
    if (username === savedUsername.current) return
    setStatus({ type: 'saving' })
    try {
      const updated = await apiClient.patchMe({ username })
      const saved = updated.username ?? username
      savedUsername.current = saved
      onSaveSuccess(saved)
      setStatus({ type: 'saved' })
      savedClearTimer.current = setTimeout(() => {
        setStatus({ type: 'idle' })
      }, 2000)
    } catch (e) {
      const message =
        e instanceof ApiError && (e.status === 409 || e.status === 422)
          ? e.status === 409
            ? 'That username is already taken.'
            : 'Invalid username format.'
          : 'Something went wrong. Please try again.'
      setStatus({ type: 'error', message })
    }
  }

  const validationError = validateUsername(value)
  const showProofUrl = value.length > 0 && validationError === null

  const statusText = (() => {
    if (status.type === 'idle') return null
    if (status.type === 'unsaved') return (
      <span className="text-muted-foreground">· Unsaved changes</span>
    )
    if (status.type === 'saving') return (
      <span className="text-muted-foreground">Saving…</span>
    )
    if (status.type === 'saved') return (
      <span className="text-green-600">Saved</span>
    )
    if (status.type === 'error') return (
      <span className="text-destructive">{status.message}</span>
    )
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
        className="font-mono w-full"
      />
      <div className="flex items-center justify-between">
        <span className="text-[13px] min-h-[1.25rem]">
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
    </div>
  )
}
