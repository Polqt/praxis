import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

  const requestCookieNames = request.cookies.getAll().map((cookie) => cookie.name)
  const supabaseCookieNames = requestCookieNames.filter((name) =>
    name.toLowerCase().includes('supabase') ||
    name.toLowerCase().includes('sb-')
  )

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !session) {
    console.error('Supabase auth code exchange failed', {
      message: exchangeError?.message,
      code: exchangeError?.code,
      status: exchangeError?.status,
      hasCode: Boolean(code),
      origin,
      nextPath,
      supabaseUrlHost: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
        : 'missing',
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseCookieNames,
    })

    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&next=${encodeURIComponent(nextPath)}`)
  }

  // Build the redirect response AFTER cookies are set
  const response = NextResponse.redirect(`${origin}${nextPath}`)

  // Copy all cookies from the cookie store to the response
  cookieStore.getAll().forEach(({ name, value }) => {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
  })

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
