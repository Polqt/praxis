'use client'

import { GitBranch, Loader2 } from 'lucide-react'
import { REQUIRED_SCOPES } from '@/features/github/constants/github.constants'
import { useGitHubConnection } from '@/features/github/hooks/use-github-connection'
import type { GitHubAccount } from '@praxis/shared'
import { formatRelativeDate } from '../utils'

type Props = {
  github: GitHubAccount
  onRefresh: (account: GitHubAccount) => void
}

export function GitHubConnectionStatus({ github, onRefresh }: Props) {
  const {
    disconnecting,
    confirmDisconnect,
    error,
    handleDisconnect,
    handleCancelDisconnect,
    handleConnectGitHub,
  } = useGitHubConnection(onRefresh)

  if (!github.connected) {
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

  const scopesValid = REQUIRED_SCOPES.every((s) => github.scopes.includes(s))

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

  return (
    <div className="border border-border p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-[11px] uppercase tracking-widest text-green-600 font-medium">Connected</span>
      </div>
      <p className="text-[13px] font-medium text-foreground mb-0.5">@{github.githubUsername}</p>
      {github.githubEmail && <p className="text-[12px] text-muted-foreground mb-0.5">{github.githubEmail}</p>}
      <p className="text-[11px] text-muted-foreground mb-4">Last synced {formatRelativeDate(github.lastSyncedAt)}</p>
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
              onClick={handleCancelDisconnect}
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
