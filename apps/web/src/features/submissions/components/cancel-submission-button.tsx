'use client'

import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useCancelSubmission } from '@/features/submissions/hooks/use-cancel-submission'

type Props = {
  submissionId: string
}

export function CancelSubmissionButton({ submissionId }: Props) {
  const router = useRouter()
  const { cancel, loading, error } = useCancelSubmission(submissionId)

  async function handleCancel() {
    const result = await cancel()
    if (result) router.refresh()
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading} className="w-full">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <><IconX size={13} />Cancel submission</>}
      </Button>
      {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
