'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const reportKeys = {
  bySubmission: (submissionId: string) => ['reports', submissionId] as const,
}

export function useReport(submissionId: string) {
  return useQuery({
    queryKey: reportKeys.bySubmission(submissionId),
    queryFn: () => apiClient.getReportBySubmissionId(submissionId),
  })
}

export function useReportVisibility(submissionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isPublic: boolean) => apiClient.setReportVisibility(submissionId, isPublic),
    onSuccess: (data) => {
      queryClient.setQueryData(reportKeys.bySubmission(submissionId), data)
    },
  })
}
