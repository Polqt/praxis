import { Injectable, NotFoundException } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import {
  projectChallenges,
  projectSubmissions,
  projectVerificationReports,
  skills,
  userSkills,
  users,
} from '../database/schema'

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

  async findByUsername(username: string) {
    const result = await this.db.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    return result[0] ?? null
  }

  async updateUser(userId: string, data: { username: string }) {
    const updated = await this.db.db
      .update(users)
      .set({ username: data.username })
      .where(eq(users.id, userId))
      .returning()

    if (!updated[0]) throw new NotFoundException()
    return updated[0]
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
    const submissions = await this.db.db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.userId, userId))
      .orderBy(desc(projectSubmissions.submittedAt))
    return {
      totalVerified: verifiedSkills.length,
      totalAttempts: submissions.length,
      verifiedSkills,
      recentSubmissions: submissions.slice(0, 5),
    }
  }

  async findPublicProfile(username: string) {
    const userRows = await this.db.db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    const user = userRows[0]
    if (!user) return null

    const earnedSkills = await this.db.db
      .select({ name: skills.name })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, user.id))

    const verifiedSubmissions = await this.db.db
      .select({
        submissionId: projectSubmissions.id,
        challengeId: projectSubmissions.challengeId,
        githubRepoFullName: projectSubmissions.githubRepoFullName,
        completedAt: projectSubmissions.completedAt,
      })
      .from(projectSubmissions)
      .where(
        and(
          eq(projectSubmissions.userId, user.id),
          eq(projectSubmissions.status, 'verified'),
        ),
      )
      .orderBy(desc(projectSubmissions.completedAt))

    const reportsWithDetails = await Promise.all(
      verifiedSubmissions.slice(0, 6).map(async (sub) => {
        const [reportRow, challengeRow] = await Promise.all([
          this.db.db
            .select({
              id: projectVerificationReports.id,
              verdict: projectVerificationReports.verdict,
              generatedAt: projectVerificationReports.generatedAt,
            })
            .from(projectVerificationReports)
            .where(eq(projectVerificationReports.submissionId, sub.submissionId))
            .limit(1),
          this.db.db
            .select({
              title: projectChallenges.title,
              projectType: projectChallenges.projectType,
            })
            .from(projectChallenges)
            .where(eq(projectChallenges.id, sub.challengeId))
            .limit(1),
        ])

        const report = reportRow[0]
        const challenge = challengeRow[0]
        if (!report || !challenge) return null

        return {
          id: report.id,
          repositoryName: sub.githubRepoFullName,
          challengeTitle: challenge.title,
          challengeCategory: challenge.projectType,
          verdict: report.verdict,
          verifiedAt: (sub.completedAt ?? report.generatedAt).toISOString(),
        }
      }),
    )

    const latestReports = reportsWithDetails.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    )

    return {
      username: user.username as string,
      verifiedSkills: earnedSkills.map((s) => s.name),
      reportsCount: verifiedSubmissions.length,
      verificationsCount: verifiedSubmissions.length,
      challengesCompleted: verifiedSubmissions.length,
      latestReports,
    }
  }
}
