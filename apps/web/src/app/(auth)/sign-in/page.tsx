'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { safeInternalPath } from '@/lib/redirects'
import { GITHUB_AUTH_SCOPES, REQUIRED_SCOPES } from '@/features/github/constants/github.constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Authentication callback failed. Please try signing in again.',
  missing_code: 'The authentication callback was missing a required code. Please try again.',
  session_expired: 'Your session expired. Please sign in again.',
  api_user_failed: 'You signed in, but Praxis could not load your account. Please try again.',
  github_sync_failed: 'You signed in, but Praxis could not sync your GitHub account. Please try again.',
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function HalftoneArt() {
  const W = 320
  const H = 420
  const spacing = 10
  const maxR = 3.8
  const color = 'oklch(0.488 0.243 264.376)'

  const shieldPath =
    'M160,8 C220,8 290,40 290,110 L290,210 C290,310 160,400 160,400 C160,400 30,310 30,210 L30,110 C30,40 100,8 160,8 Z'

  function insideShield(px: number, py: number): number {
    const cx = 160, topY = 8, midY = 240, botY = 400
    const topRx = 130, topRy = 202
    // Upper dome: ellipse test
    if (py <= midY) {
      const dx = (px - cx) / topRx
      const dy = (py - topY) / topRy
      if (dx * dx + dy * dy > 1) return 0
      // Feather the edge
      const dist = Math.sqrt(dx * dx + dy * dy)
      return dist > 0.82 ? Math.max(0, (1 - dist) / 0.18) : 1
    }
    // Lower triangle: linear taper to point at botY
    const t = (py - midY) / (botY - midY)
    const halfW = topRx * (1 - t)
    if (Math.abs(px - cx) > halfW) return 0
    const edgeDist = (halfW - Math.abs(px - cx)) / halfW
    return edgeDist < 0.15 ? edgeDist / 0.15 : 1
  }

  const dots: { cx: number; cy: number; r: number }[] = []
  for (let y = spacing / 2; y < H; y += spacing) {
    for (let x = spacing / 2; x < W; x += spacing) {
      const alpha = insideShield(x, y)
      if (alpha < 0.05) continue
      // Checkmark highlight: dots near the checkmark get a slight radius boost
      const ckDist = Math.min(
        Math.hypot(x - 100, y - 200),
        Math.hypot(x - 140, y - 245),
        Math.hypot(x - 220, y - 155),
      )
      const ckBoost = ckDist < 30 ? (30 - ckDist) / 30 * 0.3 : 0
      const jitter = ((x * 13 + y * 7) % 17) / 17 * 0.08
      const r = Math.min(maxR, maxR * alpha * (0.7 + ckBoost + jitter))
      dots.push({ cx: x, cy: y, r })
    }
  }

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="absolute"
      style={{ bottom: '60px', left: '50%', transform: 'translateX(-50%)' }}
      aria-hidden
    >
      <defs>
        <clipPath id="shield-clip">
          <path d={shieldPath} />
        </clipPath>
      </defs>
      {dots.map(({ cx, cy, r }, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.92} />
      ))}
      {/* Checkmark stroke rendered as wider dots along its path for emphasis */}
      {[
        [100,200],[110,212],[120,224],[130,235],[140,245],
        [155,230],[170,215],[185,200],[200,185],[210,172],[220,155],
      ].map(([cx, cy], i) => (
        <circle key={`ck-${i}`} cx={cx} cy={cy} r={maxR * 0.9} fill={color} fillOpacity={0.5} />
      ))}
    </svg>
  )
}


function SignInPage() {
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')
  const authErrorMessage = authError ? AUTH_ERROR_MESSAGES[authError] : null
  const nextPath = safeInternalPath(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState('')

  const emailValid = EMAIL_RE.test(email)

  async function handleGithub() {
    if (githubLoading) return
    setGithubLoading(true)
    setGithubError('')
    try {
      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', nextPath)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: (nextPath.startsWith('/submit') ? REQUIRED_SCOPES : GITHUB_AUTH_SCOPES).join(' '),
        },
      })
      if (error) setGithubError(error.message)
    } catch {
      setGithubError('Something went wrong. Please try again.')
    } finally {
      setGithubLoading(false)
    }
  }

  async function handleEmail() {
    if (!emailValid || emailLoading) return
    setEmailLoading(true)
    setEmailError('')
    try {
      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', nextPath)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: true,
        },
      })
      if (error) {
        setEmailError(error.message)
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Something went wrong. Please try again.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:flex md:w-1/2 flex-col px-16 py-12 relative overflow-hidden"
        style={{ background: 'var(--foreground)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          aria-hidden
          style={{ opacity: 0.06 }}
        >
          <defs>
            <pattern id="bg-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-dots)" />
        </svg>

        <HalftoneArt />

        <div className="relative z-10 flex flex-col h-full">
          <Link
            href="/"
            className="text-[20px] font-semibold tracking-tight block"
            style={{ color: 'var(--background)' }}
          >
            Praxis
          </Link>

          <div className="mt-auto mb-12">
            <div className="mb-8">
              {['Your work,', 'your proof,', 'on the record.'].map((line) => (
                <p
                  key={line}
                  className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
                  style={{ color: 'var(--background)' }}
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-4 mb-12">
              <div className="flex items-start gap-3">
                <div
                  className="mt-1.25 shrink-0 rounded-[1px]"
                  style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
                />
                <span className="text-[14px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Connect once. Verify any project.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="mt-1.25 shrink-0 rounded-[1px]"
                  style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
                />
                <span className="text-[14px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Your proof page lives at praxis.dev/p/username.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="mt-1.25 shrink-0 rounded-[1px]"
                  style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
                />
                <span className="text-[14px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Share it anywhere. No login required to view.
                </span>
              </div>
            </div>

            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Already verified?{' '}
              <Link
                href="/example-report"
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                View a sample proof page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 md:w-1/2 bg-background flex flex-col relative">
        <div className="flex-1 flex flex-col justify-center px-6 md:px-16 py-24">
          <div className="w-full max-w-90 mx-auto">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div
                className="rounded-[1px] shrink-0"
                style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
              />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                GET VERIFIED
              </span>
            </div>

            <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-2">
              Start your proof.
            </h1>
            <p className="text-[14px] text-muted-foreground mb-8">
              Sign in to connect your GitHub and submit your first project for verification.
            </p>

            {authErrorMessage && (
              <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-amber-800 text-[12px]">
                {authErrorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleGithub}
              disabled={githubLoading}
              className="w-full h-11 flex items-center justify-center gap-3 bg-foreground text-background text-[12px] font-medium uppercase tracking-widest rounded-none transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {githubLoading ? <Loader2 size={15} className="animate-spin" /> : <GithubIcon />}
              Continue with GitHub
            </button>

            {githubError && (
              <div className="mt-2 px-3 py-2 bg-destructive/10 rounded-sm text-destructive text-sm">
                {githubError}
              </div>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-border" />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">OR</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-1.5 mb-2">
              <label className="block text-[12px] uppercase tracking-widest font-medium text-muted-foreground">
                Email address
              </label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-none border-border focus-visible:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleEmail}
              disabled={!emailValid || emailLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-foreground text-background text-[12px] font-medium uppercase tracking-widest rounded-none transition-opacity hover:opacity-90 disabled:opacity-50 mb-2"
            >
              {emailLoading ? <Loader2 size={14} className="animate-spin" /> : 'Continue with Email'}
            </button>

            {emailSent && (
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-[13px] text-muted-foreground">
                  Check your inbox for a sign-in link.
                </span>
              </div>
            )}

            {emailError && (
              <div className="mt-1 px-3 py-2 bg-destructive/10 rounded-sm text-destructive text-sm">
                {emailError}
              </div>
            )}

            <p className="text-center text-[11px] text-muted-foreground mt-6">
              By continuing you agree to the{' '}
              <Link href="/terms" className="underline underline-offset-2 text-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-2 text-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPageWrapper() {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  )
}
