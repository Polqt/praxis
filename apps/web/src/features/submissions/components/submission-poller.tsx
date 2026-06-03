'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const INITIAL_INTERVAL_MS = 3_000
const MAX_INTERVAL_MS = 60_000

type Props = {
  isInProgress: boolean
}

export function SubmissionPoller({ isInProgress }: Props) {
  const router = useRouter()
  const intervalRef = useRef(INITIAL_INTERVAL_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isInProgress) return

    intervalRef.current = INITIAL_INTERVAL_MS

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
  }, [isInProgress, router])

  return null
}
