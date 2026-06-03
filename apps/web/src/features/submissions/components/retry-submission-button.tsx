'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { apiClient, ApiError } from '@/lib/api'

type Props = {
  submissionId: string
}

export function RetrySubmissionButton({ submissionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRetry() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await apiClient.retrySubmission(submissionId)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to retry submission')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleRetry} disabled={loading} className="w-full">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <><IconRefresh size={13} />Retry verification</>}
      </Button>
      {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
