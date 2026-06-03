'use client'

import { useEffect, useState } from 'react'

type Props = {
  since: string | Date
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function ElapsedTime({ since }: Props) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(since).getTime())

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(since).getTime())
    }, 5_000)
    return () => clearInterval(id)
  }, [since])

  return <span suppressHydrationWarning>{formatElapsed(elapsed)}</span>
}
