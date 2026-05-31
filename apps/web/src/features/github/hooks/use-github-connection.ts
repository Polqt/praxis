'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'
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
    window.location.href = '/studio/connect-github'
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
