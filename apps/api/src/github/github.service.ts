import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { githubAccounts, users } from '../database/schema'
import { GitHubApiService } from './github-api.service'
import { GitHubTokenService } from './github-token.service'
import { SyncedGitHubAccount } from './github.types'

@Injectable()
export class GitHubService {
  private readonly tokenService: GitHubTokenService

  constructor(
    private readonly db: DatabaseService,
    private readonly githubApi: GitHubApiService,
    config: ConfigService,
  ) {
    const key = config.get<string>('github.tokenEncryptionKey')
    if (!key) throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY is required')
    this.tokenService = new GitHubTokenService(key)
  }

  async syncAccount(userId: string, accessToken: string) {
    const viewer = await this.githubApi.getViewer(accessToken)
    const scopes = viewer.scopes.length > 0 ? viewer.scopes : ['read:user', 'repo']
    const tokenScope = scopes.join(',')
    const encryptedToken = this.tokenService.encrypt(accessToken)
    const now = new Date()

    await this.db.db
      .insert(githubAccounts)
      .values({
        userId,
        githubUserId: viewer.id,
        githubUsername: viewer.login,
        githubEmail: viewer.email,
        accessToken: encryptedToken,
        tokenScope,
        isActive: true,
        lastSyncedAt: now,
      })
      .onConflictDoUpdate({
        target: githubAccounts.userId,
        set: {
          githubUserId: viewer.id,
          githubUsername: viewer.login,
          githubEmail: viewer.email,
          accessToken: encryptedToken,
          tokenScope,
          isActive: true,
          lastSyncedAt: now,
        },
      })

    const currentUser = await this.db.db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (currentUser[0] && currentUser[0].username === null) {
      await this.db.db
        .update(users)
        .set({ username: viewer.login })
        .where(eq(users.id, userId))
    }
  }

  async getAccount(userId: string): Promise<
    | { connected: true; githubUsername: string; githubEmail: string | null; lastSyncedAt: Date | null; scopes: string[] }
    | { connected: false }
  > {
    const rows = await this.db.db
      .select()
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, userId))
      .limit(1)

    const account = rows[0]
    if (!account || !account.isActive) {
      return { connected: false }
    }

    return {
      connected: true,
      githubUsername: account.githubUsername,
      githubEmail: account.githubEmail,
      lastSyncedAt: account.lastSyncedAt,
      scopes: account.tokenScope ? account.tokenScope.split(',') : [],
    }
  }

  async disconnect(userId: string) {
    await this.db.db
      .update(githubAccounts)
      .set({ isActive: false, lastSyncedAt: new Date() })
      .where(eq(githubAccounts.userId, userId))
  }

  async getActiveToken(userId: string) {
    const rows = await this.db.db
      .select()
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, userId))
      .limit(1)

    if (!rows[0] || !rows[0].isActive) {
      throw new BadRequestException('Connect GitHub before submitting a project')
    }

    return {
      account: rows[0],
      accessToken: this.tokenService.decrypt(rows[0].accessToken),
    }
  }

  toPublicAccount(account: SyncedGitHubAccount) {
    return {
      id: account.id,
      userId: account.userId,
      githubUserId: account.githubUserId,
      githubUsername: account.githubUsername,
      githubEmail: account.githubEmail,
      tokenScope: account.tokenScope,
      isActive: account.isActive,
      connectedAt: account.connectedAt,
      lastSyncedAt: account.lastSyncedAt,
    }
  }
}
