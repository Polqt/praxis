export interface GitHubAccount {
    id: string;
    userId: string;
    githubUserId: number;
    githubUsername: string;
    githubEmail: string | null;
    tokenScope: string;
    isActive: boolean;
    connectedAt: string;
    lastSyncedAt: string | null;
}
