  'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

export function UnreadBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    apiFetch<number>('/submissions/unread')
      .then((n) => setCount(typeof n === 'number' ? n : 0))
      .catch(() => {})
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-auto flex items-center justify-center min-w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1 tabular-nums">
      {count > 9 ? '9+' : count}
    </span>
  )
}
