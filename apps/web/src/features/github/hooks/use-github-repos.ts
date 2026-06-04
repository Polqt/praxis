'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useGitHubRepos(enabled: boolean) {
  const [repos, setRepos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setLoading(true)
    apiClient.getGitHubRepos()
      .then(setRepos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [enabled])

  return { repos, loading }
}
