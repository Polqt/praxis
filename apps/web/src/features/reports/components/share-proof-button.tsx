'use client'

import { useRef, useState } from 'react'
import { IconCheck, IconShare } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

type Props = {
  publicToken: string
}

export function ShareProofButton({ publicToken }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCopy() {
    const url = `${window.location.origin}/proof/${publicToken}`
    void navigator.clipboard.writeText(url)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <IconCheck size={13} /> : <IconShare size={13} />}
      {copied ? 'Copied!' : 'Copy proof link'}
    </Button>
  )
}
