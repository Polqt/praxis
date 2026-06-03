import { Injectable, NotFoundException } from '@nestjs/common'
import { asc, eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { projectChallenges } from '../database/schema'

type CachedChallenge = typeof projectChallenges.$inferSelect

const CACHE_TTL_MS = 60_000

@Injectable()
export class ChallengesService {
  private listCache: { data: CachedChallenge[]; expiresAt: number } | null = null
  private byIdCache = new Map<string, { data: CachedChallenge; expiresAt: number }>()

  constructor(private readonly db: DatabaseService) {}

  async listActive(limit = 50, offset = 0) {
    const now = Date.now()
    if (!this.listCache || this.listCache.expiresAt < now) {
      const rows = await this.db.db
        .select()
        .from(projectChallenges)
        .where(eq(projectChallenges.isActive, true))
        .orderBy(asc(projectChallenges.createdAt))
      this.listCache = { data: rows, expiresAt: now + CACHE_TTL_MS }
    }
    return this.listCache.data.slice(offset, offset + limit)
  }

  async getActive(id: string) {
    const now = Date.now()
    const cached = this.byIdCache.get(id)
    if (cached && cached.expiresAt >= now) return cached.data

    const rows = await this.db.db
      .select()
      .from(projectChallenges)
      .where(eq(projectChallenges.id, id))
      .limit(1)

    if (!rows[0] || !rows[0].isActive) {
      throw new NotFoundException('Project challenge not found')
    }

    this.byIdCache.set(id, { data: rows[0], expiresAt: now + CACHE_TTL_MS })
    return rows[0]
  }
}
