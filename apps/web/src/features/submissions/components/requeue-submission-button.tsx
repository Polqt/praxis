'use client'

import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useRequeueSubmission } from '@/features/submissions/hooks/use-requeue-submission'

type Props = {
  submissionId: string
}

export function RequeueSubmissionButton({ submissionId }: Props) {
  const router = useRouter()
  const { requeue, loading, error } = useRequeueSubmission(submissionId)

  async function handleRequeue() {
    const result = await requeue()
    if (result) router.refresh()
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleRequeue} disabled={loading} className="w-full">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <><IconRefresh size={13} />Re-submit same commit</>}
      </Button>
      {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
