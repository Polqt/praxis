import { createClient } from '@/lib/supabase/client'
import type {
  DashboardStats,
  GitHubAccount,
  ProjectChallenge,
  ProjectSubmission,
  ProjectSubmissionEvent,
  User,
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
  getMe: () => apiFetch<User>('/users/me'),
  patchMe: (data: { username: string }) =>
    apiFetch<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getDashboard: () => apiFetch<DashboardStats>('/users/me/dashboard'),
  getChallenges: () => apiFetch<ProjectChallenge[]>('/challenges'),
  getChallenge: (id: string) => apiFetch<ProjectChallenge>(`/challenges/${id}`),
  createSubmission: (data: { challengeId: string; githubRepoFullName: string; commitSha?: string }) =>
    apiFetch<ProjectSubmission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubmissions: () => apiFetch<ProjectSubmission[]>('/submissions'),
  getSubmission: (id: string) => apiFetch<ProjectSubmission>(`/submissions/${id}`),
  getSubmissionEvents: (id: string) => apiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`),
  getSubmissionReport: (id: string) => apiFetch<VerificationReport>(`/submissions/${id}/report`),
  setReportVisibility: (submissionId: string, isPublic: boolean) =>
    apiFetch<VerificationReport>(`/reports/submissions/${submissionId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),
  getGitHubAccount: () => apiFetch<GitHubAccount>('/github/account'),
  syncGitHub: (accessToken: string) =>
    apiFetch<void>('/github/sync', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),
  disconnectGitHub: () => apiFetch<void>('/github/account', { method: 'DELETE' }),
}
