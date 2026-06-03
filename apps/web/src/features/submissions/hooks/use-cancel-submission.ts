'use client'

import { useState } from 'react'
import { apiClient, ApiError } from '@/lib/api'
import type { ProjectSubmission } from '@praxis/shared'

interface UseCancelSubmissionResult {
  cancel: () => Promise<ProjectSubmission | null>
  loading: boolean
  error: string | null
}

export function useCancelSubmission(submissionId: string): UseCancelSubmissionResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel(): Promise<ProjectSubmission | null> {
    if (loading) return null
    setLoading(true)
    setError(null)
    try {
      return await apiClient.cancelSubmission(submissionId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to cancel submission'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { cancel, loading, error }
}
