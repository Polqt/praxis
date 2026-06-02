import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safeInternalPath } from '@/lib/redirects'

const PROTECTED_PREFIXES = ['/studio', '/submit', '/submissions', '/reports', '/settings', '/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathWithSearch = `${pathname}${request.nextUrl.search}`

  if (pathname === '/auth/callback') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Supabase SSR on Vercel
  const { data: { user } } = await supabase.auth.getUser()

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/dashboard/, '/studio')
    return NextResponse.redirect(url)
  }

  if (pathname === '/studio/challenges' || pathname.startsWith('/studio/challenges/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/studio\/challenges/, '/challenges')
    return NextResponse.redirect(url)
  }

  if (pathname === '/studio/submissions' || pathname.startsWith('/studio/submissions/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/studio\/submissions/, '/submissions')
    return NextResponse.redirect(url)
  }

  if (pathname === '/studio/submit') {
    const url = request.nextUrl.clone()
    url.pathname = '/submit'
    return NextResponse.redirect(url)
  }

  if (!user && (pathname === '/sign-up' || pathname === '/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', pathWithSearch)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
