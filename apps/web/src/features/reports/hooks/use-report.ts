'use client'

import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import type { VerificationReport } from '@praxis/shared'

interface UseReportResult {
  report: VerificationReport | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Client-side hook for fetching a private verification report.
 * Use for scenarios where the report needs to refresh after a user action
 * (e.g. publishing changes isPublic and publicToken).
 */
export function useReport(submissionId: string, initial: VerificationReport | null = null): UseReportResult {
  const [report, setReport] = useState<VerificationReport | null>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<VerificationReport>(`/reports/submissions/${submissionId}`)
      setReport(data)
    } catch {
      setError('Failed to load report.')
    } finally {
      setLoading(false)
    }
  }, [submissionId])

  return { report, loading, error, refresh }
}
