import { createClient } from '@/lib/supabase/server'

export class ServerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly requestId: string | null = null,
  ) {
    super(message)
    this.name = 'ServerApiError'
  }
}

export async function serverApiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    // 10s covers all current server component fetches. E2B execution (up to 120s)
    // runs in the worker queue, never via a server component fetch.
    signal: options?.signal ?? AbortSignal.timeout(10_000),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = (body as { message?: string }).message ?? `API error ${response.status}`
    const requestId = response.headers.get('x-request-id')
    throw new ServerApiError(message, response.status, path, requestId)
  }

  return response.json() as Promise<T>
}
