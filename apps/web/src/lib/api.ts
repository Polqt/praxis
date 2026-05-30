import { createClient } from './supabase'
import type { VerifyRequest, VerifyResponse, TaskWithStatus, DashboardStats } from '@praxis/shared'

async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message ?? 'Request failed')
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  getTasks: () => request<TaskWithStatus[]>('/tasks'),
  getTask: (id: string) => request<TaskWithStatus>(`/tasks/${id}`),
  getDashboard: () => request<DashboardStats>('/users/me/dashboard'),
  verify: (body: VerifyRequest) =>
    request<VerifyResponse>('/verification/run', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
