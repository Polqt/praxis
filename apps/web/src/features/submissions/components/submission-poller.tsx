'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const BASE_INTERVAL_MS = 3_000
const MAX_INTERVAL_MS = 60_000
// Submissions older than this start at a longer polling interval
const OLD_SUBMISSION_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

type Props = {
  isInProgress: boolean
  submittedAt?: string
}

export function SubmissionPoller({ isInProgress, submittedAt }: Props) {
  const router = useRouter()
  const intervalRef = useRef(BASE_INTERVAL_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isInProgress) return

    // Start at a longer interval for submissions that have been in-progress a while
    const age = submittedAt ? Date.now() - new Date(submittedAt).getTime() : 0
    intervalRef.current = age > OLD_SUBMISSION_THRESHOLD_MS
      ? Math.min(age / 10, MAX_INTERVAL_MS) // proportional to age, max 60s
      : BASE_INTERVAL_MS

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        router.refresh()
        intervalRef.current = Math.min(intervalRef.current * 2, MAX_INTERVAL_MS)
        scheduleNext()
      }, intervalRef.current)
    }

    scheduleNext()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isInProgress, submittedAt, router])

  return null
}
