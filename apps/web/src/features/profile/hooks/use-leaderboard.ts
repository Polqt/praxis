'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/api'

interface UseLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Client-side hook for leaderboard data.
 * Fetches on mount and exposes a refresh() for live updates.
 */
export function useLeaderboard(initial: LeaderboardEntry[] = []): UseLeaderboardResult {
  const needsFetch = initial.length === 0
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initial)
  const [loading, setLoading] = useState(needsFetch)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getLeaderboard()
      setEntries(data)
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!needsFetch) return
    apiClient.getLeaderboard()
      .then(setEntries)
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { entries, loading, error, refresh }
}
