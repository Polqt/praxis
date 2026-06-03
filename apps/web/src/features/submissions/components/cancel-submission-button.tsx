'use client'

import { useRouter } from 'next/navigation'
import { IconX } from '@tabler/icons-react'
import { SubmissionActionButton } from './submission-action-button'
import { useCancelSubmission } from '@/features/submissions/hooks/use-cancel-submission'

export function CancelSubmissionButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const { execute, loading, error } = useCancelSubmission(submissionId)

  async function handleCancel() {
    const result = await execute()
    if (result) router.refresh()
  }

  return (
    <SubmissionActionButton
      label="Cancel submission"
      icon={<IconX size={13} />}
      onAction={handleCancel}
      loading={loading}
      error={error}
    />
  )
}
