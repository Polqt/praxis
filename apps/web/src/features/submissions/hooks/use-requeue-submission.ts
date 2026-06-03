'use client'

import { useState } from 'react'
import { apiClient, ApiError } from '@/lib/api'
import type { ProjectSubmission } from '@praxis/shared'

interface UseRequeueSubmissionResult {
  requeue: () => Promise<ProjectSubmission | null>
  loading: boolean
  error: string | null
}

export function useRequeueSubmission(submissionId: string): UseRequeueSubmissionResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requeue(): Promise<ProjectSubmission | null> {
    if (loading) return null
    setLoading(true)
    setError(null)
    try {
      return await apiClient.requeueSubmission(submissionId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to requeue submission'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { requeue, loading, error }
}
