'use client'

import { useRef, useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'

const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://praxis.dev'

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

  const proofUrl = publicToken ? `${APP_BASE_URL}/proof/${publicToken}` : null

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

  if (publicState) {
    if (confirmingUnpublish) {
      return (
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs text-muted-foreground text-right max-w-56">
            Making this report private will break any existing shared links.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmingUnpublish(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={unpublish} disabled={pending}>
              {pending ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )
    }

    return (
      <div className="flex flex-col items-end gap-2">
        <Button variant="outline" onClick={() => setConfirmingUnpublish(true)} disabled={pending} size="sm">
          {pending ? 'Updating...' : 'Unpublish proof'}
        </Button>
        {proofUrl && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-mono truncate max-w-48">{proofUrl}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy} title="Copy proof URL" aria-label="Copy proof URL">
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={publish} disabled={pending} size="sm">
        {pending ? 'Updating...' : 'Publish proof'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
