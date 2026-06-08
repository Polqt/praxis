import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { and, count, desc, eq, gte, inArray, max, sql } from 'drizzle-orm'
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
  private static readonly USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000

  static readonly RESERVED_USERNAMES = new Set([
    // Generic reserved words
    'admin', 'administrator', 'api', 'app', 'auth',
    'billing', 'blog', 'cdn', 'dashboard', 'dev',
    'docs', 'email', 'ftp', 'git', 'github',
    'help', 'home', 'hostname', 'legal', 'mail',
    'marketing', 'me', 'mobile', 'null', 'ops',
    'portal', 'praxis', 'privacy', 'root', 'sales',
    'security', 'server', 'settings', 'signup', 'signin',
    'status', 'support', 'system', 'team', 'terms',
    'undefined', 'user', 'username', 'www', 'www1', 'www2',
    // App route paths — claiming these creates /p/<route> which looks official
    'onboarding', 'challenges', 'studio', 'submissions', 'reports',
    'proof', 'leaderboard', 'submit', 'sign-in', 'sign-up',
    'example-report', 'account', 'profile',
  ])

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
    if (UsersService.RESERVED_USERNAMES.has(data.username.toLowerCase())) {
      throw new ConflictException('This username is not available.')
    }
    const current = await this.getMe(userId)
    if (current.username === data.username) return current

    if (current.username && current.usernameUpdatedAt) {
      const nextChangeAt = new Date(
        current.usernameUpdatedAt.getTime() + UsersService.USERNAME_CHANGE_COOLDOWN_MS,
      )
      if (nextChangeAt > new Date()) {
        throw new ConflictException(
          `Username can be changed again on ${nextChangeAt.toISOString().slice(0, 10)}.`,
        )
      }
    }

    try {
      const updated = await this.db.db
        .update(users)
        .set({
          username: data.username,
          ...(current.username ? { usernameUpdatedAt: new Date() } : {}),
        })
        .where(eq(users.id, userId))
        .returning()

      if (!updated[0]) throw new NotFoundException()
      return updated[0]
    } catch (err) {
      // PostgreSQL unique violation error code 23505 — belt-and-suspenders after the app-level check
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
        throw new ConflictException('This username is already taken.')
      }
      throw err
    }
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
    // Two parallel queries: skills join + submissions (count + recent in one query via window or two selects)
    const [skillRows, countResult, recentSubmissions] = await Promise.all([
      this.db.db
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
        .where(eq(userSkills.userId, userId)),
      this.db.db
        .select({ value: count() })
        .from(projectSubmissions)
        .where(eq(projectSubmissions.userId, userId)),
      this.db.db
        .select()
        .from(projectSubmissions)
        .where(eq(projectSubmissions.userId, userId))
        .orderBy(desc(projectSubmissions.submittedAt))
        .limit(5),
    ])
    return {
      totalVerified: skillRows.length,
      totalAttempts: countResult[0]?.value ?? 0,
      verifiedSkills: skillRows,
      recentSubmissions,
    }
  }

  async getLeaderboard(limit = 50, offset = 0, period: 'all' | 'month' | 'week' = 'all') {
    const periodStart = period === 'week'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : period === 'month'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : null

    const whereClause = periodStart
      ? and(eq(projectSubmissions.status, 'verified'), gte(projectSubmissions.completedAt, periodStart))
      : eq(projectSubmissions.status, 'verified')

    // totalPoints = sum of passingThreshold across verified submissions — advanced challenges
    // (threshold 70) outweigh beginner ones (threshold 50), giving a difficulty-weighted rank.
    const rows = await this.db.db
      .select({
        userId: projectSubmissions.userId,
        username: users.username,
        verifiedCount: count(projectSubmissions.id),
        bestScore: max(projectVerificationReports.compositeScore),
        lastVerifiedAt: max(projectSubmissions.completedAt),
        totalPoints: sql<number>`sum(${projectChallenges.passingThreshold})`,
      })
      .from(projectSubmissions)
      .innerJoin(users, eq(projectSubmissions.userId, users.id))
      .innerJoin(projectVerificationReports, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(whereClause)
      .groupBy(projectSubmissions.userId, users.username)
      .orderBy(
        desc(sql`sum(${projectChallenges.passingThreshold})`),
        desc(max(projectVerificationReports.compositeScore)),
      )
      .limit(limit)
      .offset(offset)

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return rows
      .filter((r) => r.username !== null)
      .map((r, i) => ({
        rank: offset + i + 1,
        username: r.username as string,
        verifiedCount: r.verifiedCount,
        bestScore: r.bestScore ?? 0,
        totalPoints: Number(r.totalPoints ?? 0),
        lastVerifiedAt: r.lastVerifiedAt?.toISOString() ?? null,
        recentlyActive: r.lastVerifiedAt ? r.lastVerifiedAt >= thirtyDaysAgo : false,
      }))
  }

  async getMyRank(userId: string) {
    // Fetch only the current user's stats (O(1) — no full scan)
    const myRows = await this.db.db
      .select({
        verifiedCount: count(projectSubmissions.id),
        bestScore: max(projectVerificationReports.compositeScore),
      })
      .from(projectSubmissions)
      .innerJoin(projectVerificationReports, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .where(and(eq(projectSubmissions.status, 'verified'), eq(projectSubmissions.userId, userId)))

    const my = myRows[0]
    if (!my || my.verifiedCount === 0) return { rank: null }

    const myCount = my.verifiedCount
    const myBest = my.bestScore ?? 0

    // Count distinct users whose stats beat the current user's: higher verifiedCount,
    // or same verifiedCount but higher bestScore. +1 gives 1-based rank.
    const aheadRows = await this.db.db.execute<{ ahead: string }>(
      sql`SELECT COUNT(*)::text AS ahead FROM (
            SELECT ps.user_id
            FROM project_submissions ps
            INNER JOIN project_verification_reports pvr ON pvr.submission_id = ps.id
            WHERE ps.status = 'verified'
            GROUP BY ps.user_id
            HAVING COUNT(ps.id) > ${myCount}
               OR (COUNT(ps.id) = ${myCount} AND MAX(pvr.composite_score) > ${myBest})
          ) ranked`,
    )

    return { rank: Number(aheadRows[0]?.ahead ?? 0) + 1 }
  }

  async updateBio(userId: string, bio: string | undefined) {
    const updated = await this.db.db
      .update(users)
      .set({ bio: bio?.trim() || null })
      .where(eq(users.id, userId))
      .returning()
    if (!updated[0]) throw new NotFoundException()
    return updated[0]
  }

  async getScoreHistory(userId: string) {
    const rows = await this.db.db
      .select({
        challengeId: projectSubmissions.challengeId,
        challengeTitle: projectChallenges.title,
        compositeScore: projectVerificationReports.compositeScore,
        completedAt: projectSubmissions.completedAt,
      })
      .from(projectSubmissions)
      .innerJoin(projectVerificationReports, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(and(
        eq(projectSubmissions.userId, userId),
        inArray(projectSubmissions.status, ['verified', 'insufficient']),
      ))
      .orderBy(desc(projectSubmissions.completedAt))
      .limit(50)

    // Group by challenge, ordered by date asc per challenge
    const byChallenge = new Map<string, { title: string; scores: { score: number; completedAt: string }[] }>()
    for (const row of rows.reverse()) {
      if (!byChallenge.has(row.challengeId)) {
        byChallenge.set(row.challengeId, { title: row.challengeTitle, scores: [] })
      }
      byChallenge.get(row.challengeId)!.scores.push({
        score: row.compositeScore ?? 0,
        completedAt: row.completedAt?.toISOString() ?? '',
      })
    }

    return Array.from(byChallenge.entries())
      .filter(([, v]) => v.scores.length > 1)
      .map(([challengeId, v]) => ({ challengeId, title: v.title, scores: v.scores }))
  }

  async findPublicProfile(username: string) {
    const userRows = await this.db.db
      .select({ id: users.id, username: users.username, bio: users.bio })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    const user = userRows[0]
    if (!user) return null

    const earnedSkills = await this.db.db
      .select({ name: skills.name, awardedAt: userSkills.awardedAt, sourceReportId: userSkills.sourceReportId })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, user.id))
      .orderBy(desc(userSkills.awardedAt))

    // Count submission stats in parallel — no dependency between these queries
    const [verifiedCountRows, insufficientCountRows, publishedCountRows] = await Promise.all([
      this.db.db
        .select({ value: count(projectSubmissions.id) })
        .from(projectSubmissions)
        .where(and(eq(projectSubmissions.userId, user.id), eq(projectSubmissions.status, 'verified'))),
      this.db.db
        .select({ value: count(projectSubmissions.id) })
        .from(projectSubmissions)
        .where(and(eq(projectSubmissions.userId, user.id), eq(projectSubmissions.status, 'insufficient'))),
      this.db.db
        .select({ value: count(projectVerificationReports.id) })
        .from(projectVerificationReports)
        .innerJoin(projectSubmissions, eq(projectVerificationReports.submissionId, projectSubmissions.id))
        .where(and(eq(projectSubmissions.userId, user.id), eq(projectVerificationReports.isPublic, true))),
    ])

    const verifiedCount = verifiedCountRows[0]?.value ?? 0
    const insufficientCount = insufficientCountRows[0]?.value ?? 0
    const publishedCount = publishedCountRows[0]?.value ?? 0

    const reportsWithDetails = await this.db.db
      .select({
        id: projectVerificationReports.id,
        submissionId: projectVerificationReports.submissionId,
        compositeScore: projectVerificationReports.compositeScore,
        verdict: projectVerificationReports.verdict,
        generatedAt: projectVerificationReports.generatedAt,
        publicToken: projectVerificationReports.publicToken,
        githubRepoFullName: projectSubmissions.githubRepoFullName,
        completedAt: projectSubmissions.completedAt,
        submissionStatus: projectSubmissions.status,
        challengeTitle: projectChallenges.title,
        challengeCategory: projectChallenges.projectType,
      })
      .from(projectSubmissions)
      .innerJoin(projectVerificationReports, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(
        and(
          eq(projectSubmissions.userId, user.id),
          inArray(projectSubmissions.status, ['verified', 'insufficient']),
        ),
      )
      .orderBy(desc(projectSubmissions.completedAt))
      .limit(6)

    const latestReports = reportsWithDetails.map((row) => ({
      id: row.id,
      submissionId: row.submissionId,
      repositoryName: row.githubRepoFullName,
      challengeTitle: row.challengeTitle,
      challengeCategory: row.challengeCategory,
      verdict: row.verdict,
      submissionStatus: row.submissionStatus,
      verifiedAt: (row.completedAt ?? row.generatedAt).toISOString(),
      publicToken: row.publicToken ?? null,
      compositeScore: row.compositeScore ?? null,
    }))

    const sourceReportIds = Array.from(new Set(
      earnedSkills
        .map((skill) => skill.sourceReportId)
        .filter((id): id is string => Boolean(id)),
    ))

    const sourceReports = sourceReportIds.length === 0 ? [] : await this.db.db
      .select({
        id: projectVerificationReports.id,
        submissionId: projectVerificationReports.submissionId,
        compositeScore: projectVerificationReports.compositeScore,
        verdict: projectVerificationReports.verdict,
        generatedAt: projectVerificationReports.generatedAt,
        publicToken: projectVerificationReports.publicToken,
        githubRepoFullName: projectSubmissions.githubRepoFullName,
        completedAt: projectSubmissions.completedAt,
        submissionStatus: projectSubmissions.status,
        challengeTitle: projectChallenges.title,
        challengeCategory: projectChallenges.projectType,
      })
      .from(projectVerificationReports)
      .innerJoin(projectSubmissions, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(inArray(projectVerificationReports.id, sourceReportIds))

    const sourceReportById = new Map(sourceReports.map((row) => [row.id, {
      id: row.id,
      submissionId: row.submissionId,
      repositoryName: row.githubRepoFullName,
      challengeTitle: row.challengeTitle,
      challengeCategory: row.challengeCategory,
      verdict: row.verdict,
      submissionStatus: row.submissionStatus,
      verifiedAt: (row.completedAt ?? row.generatedAt).toISOString(),
      publicToken: row.publicToken ?? null,
      compositeScore: row.compositeScore ?? null,
    }]))

    return {
      username: user.username as string,
      bio: user.bio ?? null,
      verifiedSkills: earnedSkills.map((s) => ({
        name: s.name,
        awardedAt: s.awardedAt.toISOString(),
        sourceReport: s.sourceReportId ? sourceReportById.get(s.sourceReportId) ?? null : null,
      })),
      reportsCount: verifiedCount,
      verifiedProjectsCount: verifiedCount,
      publishedReportsCount: publishedCount,
      needsImprovementCount: insufficientCount,
      challengesCompleted: verifiedCount,
      latestReports,
    }
  }
}
