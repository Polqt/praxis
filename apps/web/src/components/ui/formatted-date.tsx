'use client'

import { useSyncExternalStore } from 'react'
import { formatDate } from '@/lib/praxis-format'

type Props = {
  value: string | Date
  className?: string
}

const subscribe = () => () => {}

export function FormattedDate({ value, className }: Props) {
  const formatted = useSyncExternalStore(
    subscribe,
    () => formatDate(value),
    () => null,
  )

  if (!formatted) return null
  return <span className={className}>{formatted}</span>
}
