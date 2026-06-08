import { createClient } from '@/lib/supabase/client'
import type {
  ProjectSubmission,
  VerificationReport,
} from '@praxis/shared'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  _retrying = false,
): Promise<T> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (response.status === 401 && !_retrying) {
    const { data, error } = await supabase.auth.refreshSession()
    if (!error && data.session) {
      return apiFetch<T>(path, options, true)
    }
    await supabase.auth.signOut()
    window.location.href = '/sign-in?error=session_expired'
    throw new ApiError('Session expired', 401)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(
      (body as { message?: string }).message ?? `API error ${response.status}`,
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  patchMe: (data: { username: string }) =>
    apiFetch<{ id: string; username: string }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  createSubmission: (data: { challengeId: string; githubRepoFullName: string; commitSha?: string }) =>
    apiFetch<ProjectSubmission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancelSubmission: (id: string) => apiFetch<ProjectSubmission>(`/submissions/${id}/cancel`, { method: 'PATCH' }),
  requeueSubmission: (id: string) => apiFetch<ProjectSubmission>(`/submissions/${id}/requeue`, { method: 'PATCH' }),
  retrySubmission: (id: string) => apiFetch<ProjectSubmission>(`/submissions/${id}/retry`, { method: 'PATCH' }),
  updateCommitAndRetry: (id: string, commitSha: string) =>
    apiFetch<ProjectSubmission>(`/submissions/${id}/commit`, {
      method: 'PATCH',
      body: JSON.stringify({ commitSha }),
    }),
  setReportVisibility: (submissionId: string, isPublic: boolean) =>
    apiFetch<VerificationReport>(`/reports/submissions/${submissionId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),
  getGitHubRepos: (): Promise<string[]> => apiFetch<string[]>('/github/repos'),
  disconnectGitHub: () => apiFetch<void>('/github/account', { method: 'DELETE' }),
  checkUsernameAvailability: (username: string) =>
    apiFetch<{ available: boolean }>(`/users/check-username?username=${encodeURIComponent(username)}`),
  getLeaderboard: (period: 'all' | 'month' | 'week' = 'all') =>
    apiFetch<LeaderboardEntry[]>(`/users/leaderboard?period=${period}`),
  updateBio: (bio: string) => apiFetch<void>('/users/me/bio', { method: 'PATCH', body: JSON.stringify({ bio }) }),
  getMyRank: () => apiFetch<{ rank: number | null; total: number }>('/users/me/rank'),
  submitReportFeedback: (
    submissionId: string,
    data: { accuracyRating: number; missedEvidence?: string; notes?: string; wouldShare?: boolean },
  ) => apiFetch<void>(`/reports/submissions/${submissionId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

export interface LeaderboardEntry {
  rank: number
  username: string
  verifiedCount: number
  bestScore: number
  lastVerifiedAt: string | null
  recentlyActive: boolean
}

export interface ScoreHistoryEntry {
  challengeId: string
  title: string
  scores: { score: number; completedAt: string }[]
}

export interface PublicProofEntry {
  publicToken: string
  repositoryName: string
  compositeScore: number
  verdict: string
  publicSummary: string | null
  challengeTitle: string
  generatedAt: string
  viewCount: number | null
  username: string | null
}
