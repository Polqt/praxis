import { useState } from 'react'
import { apiClient, ApiError } from '@/lib/api'

const USERNAME_RE = /^[a-z0-9_-]{3,24}$/

export function usePatchUsername(onSuccess: (username: string) => void) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = USERNAME_RE.test(value)

  const inlineError = (() => {
    if (!value) return ''
    if (value.length < 3) return 'At least 3 characters'
    if (value.length > 24) return 'Max 24 characters'
    if (!/^[a-z0-9_-]+$/.test(value)) return 'Only lowercase letters, numbers, - and _'
    return ''
  })()

  async function submit() {
    if (!isValid || loading) return
    setLoading(true)
    setError('')
    try {
      const user = await apiClient.patchMe({ username: value })
      onSuccess(user.username!)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('That username is already taken.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return { value, setValue, loading, error, inlineError, isValid, submit }
}
