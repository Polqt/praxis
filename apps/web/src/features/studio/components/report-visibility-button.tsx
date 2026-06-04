'use client'

import { useRef, useState } from 'react'
import { IconCheck, IconCopy, IconShare } from '@tabler/icons-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
    try {
      const report = await apiClient.setReportVisibility(submissionId, true)
      setPublicState(report.isPublic)
      setPublicToken(report.publicToken ?? null)
    } catch {
      setError('Failed to update visibility. Please try again.')
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
      setError('Failed to update visibility. Please try again.')
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

  if (!publicState) {
    return (
      <div className="flex flex-col gap-2">
        <Button onClick={publish} disabled={pending} size="sm" className="w-full">
          {pending ? 'Publishing...' : 'Publish proof'}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  if (confirmingUnpublish) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Making this report private will break any existing shared links.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmingUnpublish(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={unpublish} disabled={pending}>
            {pending ? 'Updating...' : 'Confirm'}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" className="w-full" onClick={() => setConfirmingUnpublish(true)} disabled={pending}>
        {pending ? 'Updating...' : 'Unpublish proof'}
      </Button>
      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleCopy}>
        {copied ? <IconCheck size={13} /> : <IconShare size={13} />}
        {copied ? 'Copied!' : 'Copy proof link'}
      </Button>
      {proofUrl && (
        <>
          <Separator />
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs font-mono text-muted-foreground truncate flex-1">{proofUrl}</span>
            <button type="button" onClick={handleCopy} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy proof URL">
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
