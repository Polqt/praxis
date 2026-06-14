'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiError } from '@/lib/api'
import { validateUsername } from '@/features/user/utils/validate-username'
import { useDebounceCallback } from '@/hooks/use-debounce-callback'
import type { UsernameCheckResult } from '@/features/onboarding/types'

type CheckState =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available' }
  | { type: 'taken' }

export type UseUsernameOnboardingReturn = {
  value: string
  validationError: string | null
  checkState: CheckState
  saving: boolean
  saveError: string | null
  handleChange: (raw: string) => void
  handleSubmit: () => Promise<void>
}

export function useUsernameOnboarding(): UseUsernameOnboardingReturn {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [checkState, setCheckState] = useState<CheckState>({ type: 'idle' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const scheduleCheck = useDebounceCallback((next) => void checkAvailability(next), 500)

  function handleChange(raw: string) {
    const next = raw.toLowerCase()
    setValue(next)
    setSaveError(null)

    if (!next || validateUsername(next) !== null) {
      setCheckState({ type: 'idle' })
      return
    }

    setCheckState({ type: 'checking' })
    scheduleCheck(next)
  }

  async function checkAvailability(username: string) {
    try {
      const result: UsernameCheckResult = await apiClient.checkUsernameAvailability(username)
      setCheckState(result.available ? { type: 'available' } : { type: 'taken' })
    } catch {
      setCheckState({ type: 'idle' })
    }
  }

  async function handleSubmit() {
    setSaveError(null)
    setSaving(true)
    try {
      await apiClient.patchMe({ username: value })
      router.push('/onboarding/challenge')
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 409
          ? 'That username is already taken.'
          : 'Something went wrong. Please try again.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  return {
    value,
    validationError: value ? validateUsername(value) : null,
    checkState,
    saving,
    saveError,
    handleChange,
    handleSubmit,
  }
}
