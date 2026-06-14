'use client'

import { useRef, useState } from 'react'
import { apiClient, ApiError } from '@/lib/api'
import { validateUsername, USERNAME_RE } from '@/features/user/utils/validate-username'
import { useDebounceCallback } from '@/hooks/use-debounce-callback'

type SaveStatus =
  | { type: 'idle' }
  | { type: 'unsaved' }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'error'; message: string }

type UseUsernameFieldReturn = {
  value: string
  status: SaveStatus
  validationError: string | null
  showProofUrl: boolean
  showUrlChangeWarning: boolean
  handleChange: (raw: string) => void
}

export function useUsernameField(
  initialValue: string,
  onSaveSuccess: (username: string) => void,
): UseUsernameFieldReturn {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<SaveStatus>({ type: 'idle' })

  const savedUsername = useRef(initialValue)
  const savedClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleSave = useDebounceCallback((next) => save(next), 600)

  function handleChange(raw: string) {
    const next = raw.toLowerCase()
    setValue(next)
    if (savedClearTimer.current) clearTimeout(savedClearTimer.current)
    if (next === savedUsername.current) {
      setStatus({ type: 'idle' })
      return
    }
    setStatus({ type: 'unsaved' })
    if (!USERNAME_RE.test(next)) return
    scheduleSave(next)
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
            ? e.message
            : 'Invalid username format.'
          : 'Something went wrong. Please try again.'
      setStatus({ type: 'error', message })
    }
  }

  const validationError = validateUsername(value)
  const showProofUrl = value.length > 0 && validationError === null
  const showUrlChangeWarning = initialValue.length > 0 && value !== initialValue && value.length > 0 && validationError === null

  return { value, status, validationError, showProofUrl, showUrlChangeWarning, handleChange }
}
