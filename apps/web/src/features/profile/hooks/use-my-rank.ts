'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useMyRank() {
  const [rank, setRank] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    apiClient.getMyRank()
      .then((r) => { setRank(r.rank); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return { rank, total, loaded }
}
