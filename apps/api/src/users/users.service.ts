import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { users, userSkills, skills, userTasks, tasks } from '../database/schema'

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
        skill: { id: skills.id, name: skills.name, category: skills.category },
        verifiedAt: userSkills.verifiedAt,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId))
  }

  async getDashboardStats(userId: string) {
    const verifiedSkills = await this.getUserSkills(userId)

    const recentUserTasks = await this.db.db
      .select({
        id: userTasks.id,
        userId: userTasks.userId,
        taskId: userTasks.taskId,
        status: userTasks.status,
        latestCode: userTasks.latestCode,
        attempts: userTasks.attempts,
        feedback: userTasks.feedback,
        verifiedAt: userTasks.verifiedAt,
        updatedAt: userTasks.updatedAt,
        title: tasks.title,
        description: tasks.description,
        language: tasks.language,
        difficulty: tasks.difficulty,
        starterCode: tasks.starterCode,
        skillTags: tasks.skillTags,
        createdAt: tasks.createdAt,
      })
      .from(userTasks)
      .innerJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .orderBy(userTasks.updatedAt)
      .limit(10)

    const totalVerified = recentUserTasks.filter(t => t.status === 'VERIFIED').length
    const totalAttempts = recentUserTasks.reduce((sum, t) => sum + t.attempts, 0)

    return { totalVerified, totalAttempts, verifiedSkills, recentTasks: recentUserTasks }
  }
}
