'use client'

import { useState } from 'react'
import { GitBranch, Loader2 } from 'lucide-react'
import { apiClient, ApiError } from '@/lib/api'
import type { GitHubAccount } from '@praxis/shared'

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const REQUIRED_SCOPES = ['repo', 'read:user']

function hasRequiredScopes(tokenScope: string): boolean {
  const scopes = tokenScope.split(',').map((s) => s.trim())
  return REQUIRED_SCOPES.every((s) => scopes.includes(s))
}

interface Props {
  github: GitHubAccount | null
  onRefresh: (account: GitHubAccount | null) => void
}

export function GitHubConnection({ github, onRefresh }: Props) {
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
      onRefresh(null)
      setConfirmDisconnect(false)
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  function handleConnectGitHub() {
    window.location.href = '/studio/connect-github'
  }

  // State 1: Not connected
  if (!github || !github.isActive) {
    return (
      <div className="border border-border p-6">
        <div className="flex items-start gap-3 mb-4">
          <GitBranch size={18} className="text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-foreground mb-1">GitHub not connected</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Praxis needs GitHub access to read your repository structure and verify projects.
              This is separate from using GitHub to sign in — sign-in requests minimal scopes
              while verification needs repository read access.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleConnectGitHub}
          className="h-9 px-5 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
        >
          Connect GitHub for Verification
        </button>
        {error && <p className="text-[11px] text-destructive mt-2">{error}</p>}
      </div>
    )
  }

  const scopesValid = hasRequiredScopes(github.tokenScope)

  // State 2: Connected but scopes insufficient
  if (!scopesValid) {
    return (
      <div className="border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-[11px] uppercase tracking-widest text-amber-600 font-medium">Needs refresh</span>
        </div>
        <p className="text-[13px] font-medium text-foreground mb-1">@{github.githubUsername}</p>
        <p className="text-[12px] text-muted-foreground mb-4">
          Your GitHub connection is missing required scopes for repository verification. Reconnect to restore access.
        </p>
        <button
          type="button"
          onClick={handleConnectGitHub}
          className="h-9 px-5 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
        >
          Reconnect GitHub
        </button>
        {error && <p className="text-[11px] text-destructive mt-2">{error}</p>}
      </div>
    )
  }

  // State 3: Connected and valid
  return (
    <div className="border border-border p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-[11px] uppercase tracking-widest text-green-600 font-medium">Connected</span>
      </div>
      <p className="text-[13px] font-medium text-foreground mb-0.5">@{github.githubUsername}</p>
      {github.githubEmail && (
        <p className="text-[12px] text-muted-foreground mb-0.5">{github.githubEmail}</p>
      )}
      <p className="text-[11px] text-muted-foreground mb-4">
        Last synced {formatRelativeDate(github.lastSyncedAt)}
      </p>

      {confirmDisconnect ? (
        <div className="border border-destructive/30 bg-destructive/5 p-4 mb-3">
          <p className="text-[12px] text-foreground mb-3">
            Disconnecting GitHub will prevent you from submitting projects for verification until you reconnect. Continue?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="h-8 px-4 bg-destructive text-white text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {disconnecting ? <Loader2 size={12} className="animate-spin" /> : 'Yes, disconnect'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDisconnect(false)}
              className="h-8 px-4 border border-border text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDisconnect}
          className="h-8 px-4 border border-border text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-muted transition-colors text-muted-foreground"
        >
          Disconnect
        </button>
      )}
      {error && <p className="text-[11px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
