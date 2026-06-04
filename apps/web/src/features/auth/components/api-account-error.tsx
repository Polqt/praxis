import Link from 'next/link'
import { ServerApiError } from '@/lib/api.server'

type Props = {
  error: unknown
  retryHref?: string
}

export function ApiAccountError({ error, retryHref = '/studio' }: Props) {
  const apiError = error instanceof ServerApiError ? error : null

  return (
    <main className="min-h-[70vh] px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Account loading failed
        </p>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          We signed you in, but could not load your Praxis account.
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          Your Supabase session exists, but the Praxis API did not return your local user record.
          This usually means the API URL, JWT validation, or user provisioning is misconfigured.
        </p>

        {apiError && (
          <div className="mb-5 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div>Status: <span className="font-medium text-foreground">{apiError.status}</span></div>
            <div>Path: <span className="font-medium text-foreground">{apiError.path}</span></div>
            {apiError.requestId && (
              <div>Request ID: <span className="font-medium text-foreground">{apiError.requestId}</span></div>
            )}
            <div>Message: <span className="font-medium text-foreground">{apiError.message}</span></div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href={retryHref} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Retry
          </Link>
          <Link href={`/sign-in?next=${encodeURIComponent(retryHref)}`} className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium">
            Sign in again
          </Link>
        </div>
      </div>
    </main>
  )
}
