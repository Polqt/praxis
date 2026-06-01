'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { REQUIRED_SCOPES } from '@/features/github/constants/github.constants'
import type { GitHubAccount } from '@praxis/shared'

type UseGitHubConnectionReturn = {
  disconnecting: boolean
  confirmDisconnect: boolean
  error: string
  handleDisconnect: () => Promise<void>
  handleCancelDisconnect: () => void
  handleConnectGitHub: () => void
}

export function useGitHubConnection(
  onRefresh: (account: GitHubAccount) => void,
): UseGitHubConnectionReturn {
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [error, setError] = useState('')

  async function handleDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true)
      return
    }
    setDisconnecting(true)
    setError('')
    try {
      await apiClient.disconnectGitHub()
      onRefresh({ connected: false })
      setConfirmDisconnect(false)
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  function handleCancelDisconnect() {
    setConfirmDisconnect(false)
  }

  function handleConnectGitHub() {
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', '/settings')
    void createClient().auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: REQUIRED_SCOPES.join(' '),
      },
    })
  }

  return {
    disconnecting,
    confirmDisconnect,
    error,
    handleDisconnect,
    handleCancelDisconnect,
    handleConnectGitHub,
  }
}
