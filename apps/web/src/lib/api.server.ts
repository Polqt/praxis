import { createClient } from '@/lib/supabase/server'
import type { User } from '@praxis/shared'

export async function serverApiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const supabase = await createClient()
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

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `API error ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getLocalUser(): Promise<User> {
  return serverApiFetch<User>('/users/me')
}
