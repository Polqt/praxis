'use client'

import { useRouter } from 'next/navigation'
import { IconRefresh } from '@tabler/icons-react'
import { SubmissionActionButton } from './submission-action-button'
import { useRequeueSubmission } from '@/features/submissions/hooks/use-requeue-submission'

export function RequeueSubmissionButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const { execute, loading, error } = useRequeueSubmission(submissionId)

  async function handleRequeue() {
    const result = await execute()
    if (result) router.refresh()
  }

  return (
    <SubmissionActionButton
      label="Re-submit same commit"
      icon={<IconRefresh size={13} />}
      onAction={handleRequeue}
      loading={loading}
      error={error}
    />
  )
}
