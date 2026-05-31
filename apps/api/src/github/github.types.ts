export interface GitHubViewer {
  id: number
  login: string
  email: string | null
}

export interface GitHubTokenMetadata {
  scopes: string[]
}

export interface SyncedGitHubAccount {
  id: string
  userId: string
  githubUserId: number
  githubUsername: string
  githubEmail: string | null
  tokenScope: string
  isActive: boolean
  connectedAt: Date
  lastSyncedAt: Date | null
}
