import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safeInternalPath } from '@/lib/redirects'

function signInRedirect(origin: string, error: string, nextPath: string) {
  return NextResponse.redirect(`${origin}/sign-in?error=${error}&next=${encodeURIComponent(nextPath)}`)
}

function getJwtHeader(token: string) {
  try {
    const encodedHeader = token.split('.')[0]
    if (!encodedHeader) return null
    const json = Buffer.from(encodedHeader, 'base64url').toString('utf8')
    const header = JSON.parse(json) as { alg?: string; kid?: string }
    return { alg: header.alg ?? 'missing', kid: header.kid ? 'present' : 'missing' }
  } catch {
    return null
  }
}

function compactBody(body: string) {
  return body.replace(/\s+/g, ' ').slice(0, 500)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const nextPath = safeInternalPath(searchParams.get('next'))

  if (error) {
    console.warn('[auth/callback] Supabase provider returned an OAuth error', { error, nextPath })
    return signInRedirect(origin, 'auth_failed', nextPath)
  }

  if (!code && !tokenHash) {
    console.warn('[auth/callback] Missing OAuth code and token_hash', { nextPath })
    return signInRedirect(origin, 'missing_code', nextPath)
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

  let session: Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>['data']['session'] = null
  let exchangeError: { message: string } | null = null

  if (tokenHash) {
    // Email magic link / OTP — uses verifyOtp with token_hash
    const { data, error: err } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type as 'email' | 'magiclink' | 'email_change' | 'recovery') ?? 'magiclink',
    })
    session = data.session
    exchangeError = err
  } else {
    // GitHub OAuth / PKCE — uses code exchange
    const { data, error: err } = await supabase.auth.exchangeCodeForSession(code!)
    session = data.session
    exchangeError = err
  }

  if (exchangeError || !session) {
    console.warn('[auth/callback] Session exchange failed', { message: exchangeError?.message, nextPath, hasTokenHash: Boolean(tokenHash) })
    return signInRedirect(origin, 'auth_failed', nextPath)
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? ''
  const bearer = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
  const provider = session.user.app_metadata?.provider
  const providerToken = session.provider_token
  const jwtHeader = getJwtHeader(session.access_token)

  console.info('[auth/callback] Session exchanged', {
    provider,
    hasProviderToken: Boolean(providerToken),
    apiHost: apiBase ? new URL(apiBase).host : 'missing',
    accessTokenHeader: jwtHeader,
    nextPath,
  })

  let apiUserReady = false
  try {
    const userResponse = await fetch(`${apiBase}/api/users/me`, { headers: bearer })
    const body = userResponse.ok ? '' : compactBody(await userResponse.text().catch(() => ''))
    console.info('[auth/callback] /api/users/me provisioning result', {
      status: userResponse.status,
      ok: userResponse.ok,
      body,
    })
    apiUserReady = userResponse.ok
  } catch (err) {
    console.warn('[auth/callback] /api/users/me provisioning request failed', {
      message: err instanceof Error ? err.message : 'unknown',
    })
  }

  if (provider === 'github' && providerToken && apiUserReady) {
    try {
      const githubResponse = await fetch(`${apiBase}/api/github/sync`, {
        method: 'POST',
        headers: bearer,
        body: JSON.stringify({ accessToken: providerToken }),
      })
      const body = githubResponse.ok ? '' : compactBody(await githubResponse.text().catch(() => ''))
      console.info('[auth/callback] /api/github/sync result', {
        status: githubResponse.status,
        ok: githubResponse.ok,
        body,
      })
    } catch (err) {
      console.warn('[auth/callback] /api/github/sync request failed', {
        message: err instanceof Error ? err.message : 'unknown',
      })
    }
  } else if (provider === 'github' && providerToken && !apiUserReady) {
    console.warn('[auth/callback] Skipping GitHub sync because /api/users/me did not provision successfully')
  }

  return response
}
