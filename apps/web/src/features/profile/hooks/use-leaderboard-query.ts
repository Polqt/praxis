'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
}

export function useLeaderboard() {
  return useQuery({
    queryKey: leaderboardKeys.all,
    queryFn: () => apiClient.getLeaderboard(),
    staleTime: 60_000,
  })
}
