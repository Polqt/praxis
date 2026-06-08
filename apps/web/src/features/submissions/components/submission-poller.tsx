'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  BASE_POLL_INTERVAL_MS,
  MAX_POLL_INTERVAL_MS,
  OLD_SUBMISSION_THRESHOLD_MS,
} from '@/features/submissions/constants'

type Props = {
  isInProgress: boolean
  submittedAt?: string
}

export function SubmissionPoller({ isInProgress, submittedAt }: Props) {
  const router = useRouter()
  const intervalRef = useRef(BASE_POLL_INTERVAL_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isInProgress) return

    // Start at a longer interval for submissions that have been in-progress a while
    const age = submittedAt ? Date.now() - new Date(submittedAt).getTime() : 0
    intervalRef.current = age > OLD_SUBMISSION_THRESHOLD_MS
      ? Math.min(age / 10, MAX_POLL_INTERVAL_MS)
      : BASE_POLL_INTERVAL_MS

    let cancelled = false

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        if (cancelled) return
        router.refresh()
        intervalRef.current = Math.min(intervalRef.current * 2, MAX_POLL_INTERVAL_MS)
        scheduleNext()
      }, intervalRef.current)
    }

    scheduleNext()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isInProgress, submittedAt, router])

  return null
}
