'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { REQUIRED_SCOPES } from '@/features/github/constants/github.constants'
import { Button } from '@/components/ui/button'

type Props = {
  nextPath: string
  label?: string
}

export function ConnectGitHubButton({ nextPath, label = 'Connect GitHub' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function connect() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', nextPath)
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: REQUIRED_SCOPES.join(' '),
        },
      })
      if (oauthError) setError(oauthError.message)
    } catch {
      setError('Unable to connect GitHub. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button type="button" onClick={connect} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : label}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
