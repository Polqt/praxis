'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useGitHubRepos(enabled: boolean) {
  const [repos, setRepos] = useState<string[] | null>(null)

  useEffect(() => {
    if (!enabled || repos !== null) return
    apiClient.getGitHubRepos()
      .then(setRepos)
      .catch(() => setRepos([]))
  }, [enabled, repos])

  return { repos: repos ?? [], loading: enabled && repos === null }
}
