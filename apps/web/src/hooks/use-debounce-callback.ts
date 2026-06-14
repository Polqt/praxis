'use client'

import { useEffect, useRef } from 'react'

export function useDebounceCallback(fn: (value: string) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (value: string) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(value), delay)
  }
}
