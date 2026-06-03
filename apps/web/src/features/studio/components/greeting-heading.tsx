'use client'

import { useSyncExternalStore } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

const subscribe = () => () => {}

export function GreetingHeading({ name }: { name: string }) {
  const period = useSyncExternalStore(subscribe, getGreeting, () => null)

  return (
    <h1 className="text-3xl font-semibold tracking-tight">
      {period ? `Good ${period}, ${name}.` : `Hello, ${name}.`}
    </h1>
  )
}
