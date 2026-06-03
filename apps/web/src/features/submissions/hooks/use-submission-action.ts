'use client'

import { useState } from 'react'
import { ApiError } from '@/lib/api'

interface UseSubmissionActionResult<T> {
  execute: () => Promise<T | null>
  loading: boolean
  error: string | null
}

export function useSubmissionAction<T>(
  action: () => Promise<T>,
  fallbackError: string,
): UseSubmissionActionResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function execute(): Promise<T | null> {
    if (loading) return null
    setLoading(true)
    setError(null)
    try {
      return await action()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : fallbackError)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}
