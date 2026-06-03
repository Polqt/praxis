'use client'

import { apiClient } from '@/lib/api'
import { useSubmissionAction } from './use-submission-action'

export function useRequeueSubmission(submissionId: string) {
  return useSubmissionAction(
    () => apiClient.requeueSubmission(submissionId),
    'Failed to requeue submission',
  )
}
