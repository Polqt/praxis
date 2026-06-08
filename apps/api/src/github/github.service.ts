import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { githubAccounts, users } from '../database/schema'
import { GitHubApiService } from './github-api.service'
import { GitHubTokenService } from './github-token.service'
import { SyncedGitHubAccount } from './github.types'
import { AuditService } from '../audit/audit.service'
import { UsersService } from '../users/users.service'

@Injectable()
export class GitHubService {
  private readonly tokenService: GitHubTokenService

  constructor(
    private readonly db: DatabaseService,
    private readonly githubApi: GitHubApiService,
    config: ConfigService,
    private readonly audit: AuditService,
  ) {
    const key = config.get<string>('github.tokenEncryptionKey')
    if (!key) throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY is required')
    this.tokenService = new GitHubTokenService(key)
  }

  async syncAccount(userId: string, accessToken: string) {
    const viewer = await this.githubApi.getViewer(accessToken)
    const scopes = viewer.scopes
    const tokenScope = scopes.join(',')
    const encryptedToken = this.tokenService.encrypt(accessToken)
    const now = new Date()

    const existing = await this.db.db
      .select({ id: githubAccounts.id })
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, userId))
      .limit(1)
    const isUpdate = existing.length > 0

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

    this.audit.log(userId, 'github_sync_completed', {
      githubUsername: viewer.login,
      action: isUpdate ? 'update' : 'create',
    })

    const currentUser = await this.db.db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const githubLogin = viewer.login.toLowerCase()
    if (currentUser[0] && currentUser[0].username === null && !UsersService.RESERVED_USERNAMES.has(githubLogin)) {
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

  async getUserRepos(userId: string): Promise<string[]> {
    const rows = await this.db.db
      .select({ accessToken: githubAccounts.accessToken, isActive: githubAccounts.isActive })
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, userId))
      .limit(1)
    if (!rows[0] || !rows[0].isActive) return []
    const token = this.tokenService.decrypt(rows[0].accessToken)
    return this.githubApi.listUserRepos(token)
  }

  async disconnect(userId: string) {
    const rows = await this.db.db
      .select({ githubUsername: githubAccounts.githubUsername })
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, userId))
      .limit(1)

    await this.db.db
      .update(githubAccounts)
      .set({ isActive: false, lastSyncedAt: new Date() })
      .where(eq(githubAccounts.userId, userId))

    if (rows[0]) {
      this.audit.log(userId, 'github_account_disconnected', {
        githubUsername: rows[0].githubUsername,
      })
    }
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
      connectedAt: account.connectedAt,
      lastSyncedAt: account.lastSyncedAt,
    }
  }
}
