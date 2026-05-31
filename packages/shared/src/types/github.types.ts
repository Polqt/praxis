export interface GitHubAccount {
  id: string
  userId: string
  githubUserId: number
  githubUsername: string
  githubEmail: string | null
  tokenScope: string
  isActive: boolean
  connectedAt: string
  lastSyncedAt: string | null
  // access_token is intentionally omitted — never exposed outside the API
}
