import { createClient } from '@/lib/supabase/client'
import type { DashboardStats, GitHubAccount, User } from '@praxis/shared'

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
  getGitHubAccount: () =>
    apiFetch<GitHubAccount>('/github/account').catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }),
  syncGitHub: (accessToken: string) =>
    apiFetch<GitHubAccount>('/github/sync', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),
  disconnectGitHub: () =>
    apiFetch<GitHubAccount>('/github/account', { method: 'DELETE' }),
}
