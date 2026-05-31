'use client'

import { useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'

export type VerificationStatus = 'idle' | 'running' | 'verified' | 'failed'

export interface UseVerificationReturn {
  status: VerificationStatus
  feedback: string
  rawOutput: string
  attempts: number
  verify: (code: string) => Promise<void>
  reset: () => void
}

export function useVerification(taskId: string): UseVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [feedback, setFeedback] = useState('')
  const [rawOutput, setRawOutput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const typewrite = useCallback((text: string, onDone?: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFeedback('')
    let i = 0
    intervalRef.current = setInterval(() => {
      setFeedback(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(intervalRef.current!)
        onDone?.()
      }
    }, 25)
  }, [])

  const verify = useCallback(async (code: string) => {
    setStatus('running')
    setFeedback('')
    setRawOutput('')
    setAttempts((prev) => prev + 1)

    try {
      // Task-based verification is deprecated in v1.
      // This hook is retained for future project-based verification flows.
      void code
      typewrite('Task verification is no longer available.', () => setStatus('failed'))
    } catch {
      setFeedback('Something went wrong. Try again.')
      setStatus('failed')
    }
  }, [taskId, typewrite])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('idle')
    setFeedback('')
    setRawOutput('')
  }, [])

  return { status, feedback, rawOutput, attempts, verify, reset }
}
