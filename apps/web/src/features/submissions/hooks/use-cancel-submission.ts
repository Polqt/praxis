'use client'

import { apiClient } from '@/lib/api'
import { useSubmissionAction } from './use-submission-action'

export function useCancelSubmission(submissionId: string) {
  return useSubmissionAction(
    () => apiClient.cancelSubmission(submissionId),
    'Failed to cancel submission',
  )
}
