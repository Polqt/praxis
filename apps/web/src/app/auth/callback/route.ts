import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safeInternalPath } from '@/lib/redirects'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const nextPath = safeInternalPath(searchParams.get('next'))

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&next=${encodeURIComponent(nextPath)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code&next=${encodeURIComponent(nextPath)}`)
  }

  const response = NextResponse.redirect(`${origin}${nextPath}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !session) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&next=${encodeURIComponent(nextPath)}`)
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? ''
  const bearer = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }

  try {
    await fetch(`${apiBase}/api/users/me`, { headers: bearer })
  } catch {
    // Non-fatal
  }

  const provider = session.user.app_metadata?.provider
  const providerToken = session.provider_token

  if (provider === 'github' && providerToken) {
    try {
      await fetch(`${apiBase}/api/github/sync`, {
        method: 'POST',
        headers: bearer,
        body: JSON.stringify({ accessToken: providerToken }),
      })
    } catch {
      // Non-fatal
    }
  }

  return response
}
