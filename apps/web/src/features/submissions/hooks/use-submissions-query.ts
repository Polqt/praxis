'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const submissionKeys = {
  all: ['submissions'] as const,
  detail: (id: string) => ['submissions', id] as const,
  events: (id: string) => ['submissions', id, 'events'] as const,
}

export function useSubmissions() {
  return useQuery({
    queryKey: submissionKeys.all,
    queryFn: () => apiClient.getSubmissions(),
  })
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: () => apiClient.getSubmission(id),
  })
}

export function useSubmissionEvents(id: string) {
  return useQuery({
    queryKey: submissionKeys.events(id),
    queryFn: () => apiClient.getSubmissionEvents(id),
  })
}

export function useSubmissionPolling(id: string, isInProgress: boolean) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: () => apiClient.getSubmission(id),
    refetchInterval: isInProgress ? 3000 : false,
  })
}
