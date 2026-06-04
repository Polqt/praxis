'use client'

import { useState } from 'react'
import { IconLink, IconCheck } from '@tabler/icons-react'

export function CopyProfileUrlButton() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy profile URL"
    >
      {copied ? <IconCheck size={13} className="text-green-500" /> : <IconLink size={13} />}
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}
