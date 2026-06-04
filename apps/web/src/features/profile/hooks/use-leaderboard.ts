'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/api'

interface UseLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useLeaderboard(initial: LeaderboardEntry[] = [], initialPeriod: 'all' | 'month' | 'week' = 'all'): UseLeaderboardResult & { period: 'all' | 'month' | 'week'; setPeriod: (p: 'all' | 'month' | 'week') => void } {
  const [period, setPeriodState] = useState<'all' | 'month' | 'week'>(initialPeriod)
  const needsFetch = initial.length === 0
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initial)
  const [loading, setLoading] = useState(needsFetch)
  const [error, setError] = useState<string | null>(null)

  // Cache SSR initial data for the 'all' period — avoids re-fetching when user switches back
  const allTimeCache = useRef<LeaderboardEntry[]>(initial)

  const refresh = useCallback(async (p?: 'all' | 'month' | 'week') => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getLeaderboard(p ?? period)
      setEntries(data)
      if ((p ?? period) === 'all') allTimeCache.current = data
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [period])

  const setPeriod = useCallback((p: 'all' | 'month' | 'week') => {
    setPeriodState(p)
    if (p === 'all' && allTimeCache.current.length > 0) {
      setEntries(allTimeCache.current)
      return
    }
    refresh(p)
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
