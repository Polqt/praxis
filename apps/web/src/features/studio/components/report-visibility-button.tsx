'use client'

import { useRef, useState } from 'react'
import { IconCheck, IconCopy, IconShare } from '@tabler/icons-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Props = {
  submissionId: string
  isPublic: boolean
  initialPublicToken?: string | null
}

export function ReportVisibilityButton({ submissionId, isPublic, initialPublicToken }: Props) {
  const [publicState, setPublicState] = useState(isPublic)
  const [publicToken, setPublicToken] = useState<string | null>(initialPublicToken ?? null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const proofUrl = publicToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/proof/${publicToken}` : null

  async function publish() {
    setPending(true)
    setError(null)
    // Optimistic: switch to "published" state immediately
    setPublicState(true)
    try {
      const report = await apiClient.setReportVisibility(submissionId, true)
      const token = report.publicToken ?? null
      setPublicToken(token)
      if (token) {
        window.open(`/proof/${token}`, '_blank', 'noopener,noreferrer')
      }
    } catch {
      setPublicState(false)
      setError('Failed to update visibility.')
    } finally {
      setPending(false)
    }
  }

  async function unpublish() {
    setPending(true)
    setError(null)
    setConfirmingUnpublish(false)
    try {
      const report = await apiClient.setReportVisibility(submissionId, false)
      setPublicState(report.isPublic)
      setPublicToken(null)
    } catch {
      setError('Failed to update visibility.')
    } finally {
      setPending(false)
    }
  }

  function handleCopy() {
    if (!proofUrl) return
    void navigator.clipboard.writeText(proofUrl)
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1500)
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive">{error}</span>
        <Button variant="outline" size="sm" onClick={() => setError(null)}>Retry</Button>
      </div>
    )
  }

  if (!publicState) {
    return (
      <Button onClick={publish} disabled={pending} size="sm" variant="outline">
        {pending ? 'Publishing…' : <><IconShare size={13} className="mr-1" />Publish proof</>}
      </Button>
    )
  }

  if (confirmingUnpublish) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:block">Break existing links?</span>
        <Button variant="outline" size="sm" onClick={() => setConfirmingUnpublish(false)} disabled={pending}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={unpublish} disabled={pending}>
          {pending ? 'Updating…' : 'Confirm'}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
        {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
        {copied ? 'Copied!' : 'Copy proof link'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirmingUnpublish(true)} disabled={pending}>
        Unpublish proof
      </Button>
    </>
  )
}
