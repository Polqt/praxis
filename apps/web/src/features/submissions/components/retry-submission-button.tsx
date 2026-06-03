'use client'

import { useRouter } from 'next/navigation'
import { IconRefresh } from '@tabler/icons-react'
import { SubmissionActionButton } from './submission-action-button'
import { useSubmissionAction } from '@/features/submissions/hooks/use-submission-action'
import { apiClient } from '@/lib/api'

export function RetrySubmissionButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const { execute, loading, error } = useSubmissionAction(
    () => apiClient.retrySubmission(submissionId),
    'Failed to retry submission',
  )

  async function handleRetry() {
    const result = await execute()
    if (result) router.refresh()
  }

  return (
    <SubmissionActionButton
      label="Retry verification"
      icon={<IconRefresh size={13} />}
      onAction={handleRetry}
      loading={loading}
      error={error}
    />
  )
}
