'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignOut() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      router.push('/sign-in')
      router.refresh()
    } catch {
      setError('Sign out failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-[12px] text-muted-foreground rounded-sm hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 w-full text-left"
      >
        {loading
          ? <Loader2 size={12} className="animate-spin shrink-0" />
          : <LogOut size={12} className="shrink-0" />
        }
        Sign out
      </button>
      {error && (
        <p className="px-3 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  )
}
