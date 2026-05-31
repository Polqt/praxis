'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SessionDebug() {
  const [info, setInfo] = useState<{ userId: string; email: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setInfo({ userId: user.id, email: user.email ?? '' })
    })
  }, [])

  if (process.env.NODE_ENV !== 'development') return null
  if (!info) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        background: 'rgba(0,0,0,0.75)',
        color: '#9ca3af',
        fontSize: 10,
        padding: '4px 8px',
        borderRadius: 4,
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      uid: {info.userId.slice(0, 8)}… · {info.email}
    </div>
  )
}
