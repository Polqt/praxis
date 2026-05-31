export type GitHubAccount =
  | { connected: true; githubUsername: string; githubEmail: string | null; lastSyncedAt: string | null; scopes: string[] }
  | { connected: false }
