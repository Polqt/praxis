'use client'

import { useState, useEffect } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function GreetingHeading({ name }: { name: string }) {
  const [period, setPeriod] = useState<string | null>(null)

  useEffect(() => {
    setPeriod(getGreeting())
  }, [])

  return (
    <h1 className="text-3xl font-semibold tracking-tight">
      {period ? `Good ${period}, ${name}.` : `Hello, ${name}.`}
    </h1>
  )
}
