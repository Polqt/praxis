import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { users, userSkills, skills } from '../database/schema'

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async getOrCreateUser(supabaseUid: string, email: string) {
    const existing = await this.db.db
      .select()
      .from(users)
      .where(eq(users.supabaseUid, supabaseUid))
      .limit(1)

    if (existing.length > 0) return existing[0]

    const created = await this.db.db
      .insert(users)
      .values({ supabaseUid, email })
      .returning()

    return created[0]
  }

  async getMe(userId: string) {
    const result = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!result[0]) throw new NotFoundException()
    return result[0]
  }

  async getUserSkills(userId: string) {
    return this.db.db
      .select({
        id: userSkills.id,
        userId: userSkills.userId,
        skill: {
          id: skills.id,
          trackId: skills.trackId,
          name: skills.name,
          category: skills.category,
          createdAt: skills.createdAt,
        },
        sourceType: userSkills.sourceType,
        awardedAt: userSkills.awardedAt,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId))
  }

  async getDashboardStats(userId: string) {
    const verifiedSkills = await this.getUserSkills(userId)

    return {
      totalVerified: verifiedSkills.length,
      totalAttempts: 0,
      verifiedSkills,
      recentSubmissions: [],
    }
  }
}
