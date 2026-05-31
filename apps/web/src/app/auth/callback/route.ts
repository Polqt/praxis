import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`)
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(`${origin}/studio`)

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
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !session) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const bearer = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }

  try {
    await fetch(`${apiBase}/users/me`, { headers: bearer })
  } catch {
    // Non-fatal — protected layout will retry.
  }

  const provider = session.user.app_metadata?.provider
  const providerToken = session.provider_token

  console.log('[callback] provider:', provider, '| provider_token present:', !!providerToken)

  if (provider === 'github') {
    if (!providerToken) {
      console.error('[callback] GitHub provider but no provider_token — skipping sync')
    } else {
      try {
        const syncRes = await fetch(`${apiBase}/github/sync`, {
          method: 'POST',
          headers: bearer,
          body: JSON.stringify({ accessToken: providerToken }),
        })
        if (!syncRes.ok) {
          const body = await syncRes.text()
          console.error('[callback] GitHub sync returned', syncRes.status, body)
        } else {
          console.log('[callback] GitHub sync succeeded')
        }
      } catch (e) {
        console.error('[callback] GitHub sync threw:', e)
      }
    }
  }

  return response
}
