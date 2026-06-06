'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/api'
import type { LeaderboardPeriod } from '@/features/profile/types'

interface UseLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useLeaderboard(
  initial: LeaderboardEntry[] = [],
  initialPeriod: LeaderboardPeriod = 'all',
): UseLeaderboardResult & {
  period: LeaderboardPeriod
  setPeriod: (period: LeaderboardPeriod) => void
} {
  const [period, setPeriodState] = useState<LeaderboardPeriod>(initialPeriod)
  const needsFetch = initial.length === 0
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initial)
  const [loading, setLoading] = useState(needsFetch)
  const [error, setError] = useState<string | null>(null)

  // Cache SSR initial data for the 'all' period — avoids re-fetching when user switches back
  const allTimeCache = useRef<LeaderboardEntry[]>(initial)

  const refresh = useCallback(async (selectedPeriod?: LeaderboardPeriod) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getLeaderboard(selectedPeriod ?? period)
      setEntries(data)
      if ((selectedPeriod ?? period) === 'all') allTimeCache.current = data
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [period])

  const setPeriod = useCallback((selectedPeriod: LeaderboardPeriod) => {
    setPeriodState(selectedPeriod)
    if (selectedPeriod === 'all' && allTimeCache.current.length > 0) {
      setEntries(allTimeCache.current)
      return
    }
    void refresh(selectedPeriod)
  }, [refresh])

  useEffect(() => {
    if (!needsFetch) return
    apiClient.getLeaderboard(period)
      .then((data) => { setEntries(data); allTimeCache.current = data })
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { entries, loading, error, refresh, period, setPeriod }
}
