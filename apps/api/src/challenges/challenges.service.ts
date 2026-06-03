import { Injectable, NotFoundException } from '@nestjs/common'
import { asc, eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { projectChallenges } from '../database/schema'

@Injectable()
export class ChallengesService {
  constructor(private readonly db: DatabaseService) {}

  listActive(limit = 50, offset = 0) {
    return this.db.db
      .select()
      .from(projectChallenges)
      .where(eq(projectChallenges.isActive, true))
      .orderBy(asc(projectChallenges.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async getActive(id: string) {
    const rows = await this.db.db
      .select()
      .from(projectChallenges)
      .where(eq(projectChallenges.id, id))
      .limit(1)

    if (!rows[0] || !rows[0].isActive) {
      throw new NotFoundException('Project challenge not found')
    }

    return rows[0]
  }
}
