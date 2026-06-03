'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  isInProgress: boolean
  intervalMs?: number
}

export function SubmissionPoller({ isInProgress, intervalMs = 3000 }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (!isInProgress) return
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [isInProgress, intervalMs, router])

  return null
}
