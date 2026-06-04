'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconGitCommit } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'

type Props = {
  submissionId: string
}

export function UpdateCommitButton({ submissionId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sha, setSha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const trimmed = sha.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      await apiClient.updateCommitAndRetry(submissionId, trimmed)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update commit.')
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setOpen(true)}>
        <IconGitCommit size={13} className="mr-1" />
        Retry with a different commit
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Paste a commit SHA from the same repository:</p>
      <div className="flex gap-2">
        <input
          value={sha}
          onChange={(e) => setSha(e.target.value)}
          placeholder="e.g. a1b2c3d"
          className="flex-1 text-xs font-mono bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <Button size="sm" onClick={handleSubmit} disabled={!sha.trim() || loading}>
          {loading ? '…' : 'Retry'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="button"
        onClick={() => { setOpen(false); setError(null); setSha('') }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
