import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { and, avg, count, desc, eq, gte, inArray, ne, sql } from 'drizzle-orm'
import { SCORING_ANALYZER_VERSION, REPORT_GENERATOR_VERSION, SCORING_VERSION } from '../scoring/versions'
import { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'
import type { RepositoryAnalysisData } from '../verification/analysis/repository-analysis.types'
import { DatabaseService } from '../database/database.service'
import {
  projectChallenges,
  projectSubmissions,
  projectVerificationReports,
  repositoryAiReviews,
  repositoryAnalyses,
  repositoryExecutions,
  repositoryIngestions,
  reportFeedback,
  skills,
  userSkills,
  users,
} from '../database/schema'
import { AuditService } from '../audit/audit.service'
import { scoreReport } from './report-scoring'
import {
  FALLBACK_SUMMARY_INSUFFICIENT,
  FALLBACK_SUMMARY_VERIFIED,
  ReportEnrichmentService,
} from './report-enrichment.service'
import { AiEvidenceReviewService } from './ai-evidence-review.service'
import { deriveStrengths, deriveImprovements } from '../scoring/derive-report-highlights'

type StoredCategoryScore = {
  score: number
  narrative: string
  citations: string[]
  status: string
  minimumScore: number
  weight?: number
  signals?: Record<string, unknown>
}

type SkillProgress = {
  name: string
  score: number
  minimumScore: number
  pointsNeeded: number
  eligible: boolean
  awarded: boolean
  matchedSkillId: string | null
}

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly enrichment: ReportEnrichmentService,
    private readonly evidenceReview: AiEvidenceReviewService,
  ) {}

  async onModuleInit() {
    // Verify every active rubric category has a matching skill row.
    // Mismatches mean verified users silently earn zero skills.
    try {
      const [challenges, skillRows] = await Promise.all([
        this.db.db.select({ rubric: projectChallenges.rubric, title: projectChallenges.title })
          .from(projectChallenges)
          .where(eq(projectChallenges.isActive, true)),
        this.db.db.select({ name: skills.name }).from(skills),
      ])
      const skillNames = new Set(skillRows.map((s) => s.name))
      for (const challenge of challenges) {
        const rubric = challenge.rubric as { categories: { name: string }[] }
        for (const cat of rubric.categories) {
          if (!skillNames.has(cat.name)) {
            this.logger.warn(
              `Rubric category "${cat.name}" in challenge "${challenge.title}" has no matching skill — run seed to fix`,
            )
          }
        }
      }
    } catch {
      // Non-fatal — don't block startup
    }
  }

  async generateForSubmission(submissionId: string, repositoryAnalysisId: string) {
    const submission = await this.getSubmission(submissionId)
    const [challenge, analysis] = await Promise.all([
      this.getChallenge(submission.challengeId),
      this.getAnalysis(repositoryAnalysisId),
    ])
    const [ingestion, executionRows] = await Promise.all([
      this.getIngestion(analysis.repositoryIngestionId),
      this.db.db
        .select()
        .from(repositoryExecutions)
        .where(eq(repositoryExecutions.repositoryIngestionId, analysis.repositoryIngestionId))
        .limit(1),
    ])

    const executionResult = executionRows[0]
      ? {
          passed: executionRows[0].passed,
          failed: executionRows[0].failed,
          skipped: executionRows[0].skipped,
          timedOut: executionRows[0].timedOut,
          language: executionRows[0].language,
        }
      : null

    await this.evidenceReview.review(
      analysis.id,
      analysis.repositoryIngestionId,
      analysis.analysisData as RepositoryAnalysisData,
    )

    const scored = scoreReport(
      challenge.rubric as { categories: { name: string; weight: number; floor: number }[] },
      ingestion.ingestedData as RepositoryIngestionData,
      challenge.passingThreshold,
      executionResult,
    )

    const enriched = await this.enrichment.enrich({
      categoryScores: scored.categoryScores,
      verdict: scored.verdict,
      compositeScore: scored.compositeScore,
      repositoryName: submission.githubRepoFullName,
      challengeTitle: challenge.title,
    })

    const inserted = await this.db.db.insert(projectVerificationReports).values({
      submissionId,
      compositeScore: scored.compositeScore,
      verdict: scored.verdict,
      categoryScores: enriched.categoryScores,
      publicSummary: enriched.publicSummary,
      analyzerVersion: SCORING_ANALYZER_VERSION,
      scoringVersion: SCORING_VERSION,
      reportGeneratorVersion: REPORT_GENERATOR_VERSION,
      rubricVersion: submission.rubricVersion,
      isPublic: false,
    }).onConflictDoUpdate({
      target: projectVerificationReports.submissionId,
      set: {
        compositeScore: scored.compositeScore,
        verdict: scored.verdict,
        categoryScores: enriched.categoryScores,
        publicSummary: enriched.publicSummary,
        analyzerVersion: SCORING_ANALYZER_VERSION,
        scoringVersion: SCORING_VERSION,
        reportGeneratorVersion: REPORT_GENERATOR_VERSION,
        rubricVersion: submission.rubricVersion,
      },
    }).returning()

    const result = inserted[0]
    if (result) {
      this.audit.log(null, 'report_generated', {
        reportId: result.id,
        submissionId,
      })
    }
    return result
  }

  async getPrivateReport(userId: string, submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')
    const [report, challenge] = await Promise.all([
      this.getReportBySubmission(submissionId),
      this.getChallenge(submission.challengeId),
    ])
    return {
      ...this.toSafeReport(report, submission, challenge),
      ...await this.buildReportExtras(userId, report, submission, challenge),
    }
  }

  async setVisibility(userId: string, submissionId: string, isPublic: boolean) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')
    const challenge = await this.getChallenge(submission.challengeId)
    const existing = await this.getReportBySubmission(submissionId)
    const token = isPublic
      ? (existing.publicToken ?? randomBytes(24).toString('base64url'))
      : null
    const rows = await this.db.db.update(projectVerificationReports)
      .set({ isPublic, publicToken: token })
      .where(eq(projectVerificationReports.submissionId, submissionId))
      .returning()
    if (!rows[0]) throw new NotFoundException('Report not found')
    this.audit.log(userId, isPublic ? 'report_published' : 'report_unpublished', {
      reportId: rows[0].id,
    })
    return this.toSafeReport(rows[0], submission, challenge)
  }

  async getPublicProofMeta(publicToken: string) {
    const reports = await this.db.db.select({
      repositoryName: projectSubmissions.githubRepoFullName,
      compositeScore: projectVerificationReports.compositeScore,
      verdict: projectVerificationReports.verdict,
      publicSummary: projectVerificationReports.publicSummary,
      isPublic: projectVerificationReports.isPublic,
      challengeTitle: projectChallenges.title,
    })
      .from(projectVerificationReports)
      .innerJoin(projectSubmissions, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(eq(projectVerificationReports.publicToken, publicToken))
      .limit(1)
    if (!reports[0] || !reports[0].isPublic) throw new NotFoundException('Proof not found')
    return reports[0]
  }

  async getPublicProof(publicToken: string) {
    const reports = await this.db.db.select().from(projectVerificationReports)
      .where(eq(projectVerificationReports.publicToken, publicToken))
      .limit(1)
    if (!reports[0] || !reports[0].isPublic) throw new NotFoundException('Proof not found')

    const [updated] = await this.db.db
      .update(projectVerificationReports)
      .set({ viewCount: sql`coalesce(${projectVerificationReports.viewCount}, 0) + 1` })
      .where(eq(projectVerificationReports.id, reports[0].id))
      .returning()

    const submission = await this.getSubmission(reports[0].submissionId)
    const reportRow = updated ?? reports[0]

    const [challenge, execRows, awardedSkillRows, userRows] = await Promise.all([
      this.getChallenge(submission.challengeId),
      // Fetch execution summary for public display (test counts + language)
      this.db.db
        .select({
          passed: repositoryExecutions.passed,
          failed: repositoryExecutions.failed,
          skipped: repositoryExecutions.skipped,
          language: repositoryExecutions.language,
          framework: repositoryExecutions.framework,
          durationMs: repositoryExecutions.durationMs,
          timedOut: repositoryExecutions.timedOut,
        })
        .from(repositoryExecutions)
        .innerJoin(repositoryIngestions, eq(repositoryExecutions.repositoryIngestionId, repositoryIngestions.id))
        .where(eq(repositoryIngestions.commitSha, submission.commitSha))
        .limit(1),
      // Fetch awarded skill names for this submission's report
      this.db.db
        .select({ name: skills.name })
        .from(userSkills)
        .innerJoin(skills, eq(skills.id, userSkills.skillId))
        .where(eq(userSkills.sourceReportId, reportRow.id)),
      this.db.db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, submission.userId))
        .limit(1),
    ])

    const executionSummary = execRows[0] ?? null
    const awardedSkills = awardedSkillRows.map((r) => r.name)
    const submitterUsername = userRows[0]?.username ?? null

    return this.toPublicProof(
      reportRow,
      submission,
      challenge,
      executionSummary,
      awardedSkills,
      submitterUsername,
    )
  }

  async listPublicProofs(limit = 50) {
    const rows = await this.db.db.select({
      publicToken: projectVerificationReports.publicToken,
      repositoryName: projectSubmissions.githubRepoFullName,
      compositeScore: projectVerificationReports.compositeScore,
      verdict: projectVerificationReports.verdict,
      publicSummary: projectVerificationReports.publicSummary,
      challengeTitle: projectChallenges.title,
      generatedAt: projectVerificationReports.generatedAt,
      viewCount: projectVerificationReports.viewCount,
      username: users.username,
    })
      .from(projectVerificationReports)
      .innerJoin(projectSubmissions, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .innerJoin(users, eq(users.id, projectSubmissions.userId))
      .where(eq(projectVerificationReports.isPublic, true))
      .orderBy(desc(projectVerificationReports.generatedAt))
      .limit(limit)

    return rows
  }

  async getChallengeLeaderboard(challengeId: string, limit = 25) {
    // DISTINCT ON deduplicates to the best score per user in SQL, avoiding a full table scan in JS
    const rows = await this.db.db.execute<{
      user_id: string
      username: string
      composite_score: number | null
      public_token: string | null
      is_public: boolean
      verified_at: string | null
    }>(sql`
      SELECT DISTINCT ON (${users.id})
        ${users.id}         AS user_id,
        ${users.username}   AS username,
        ${projectVerificationReports.compositeScore} AS composite_score,
        ${projectVerificationReports.publicToken}    AS public_token,
        ${projectVerificationReports.isPublic}       AS is_public,
        ${projectSubmissions.completedAt}            AS verified_at
      FROM ${projectVerificationReports}
      INNER JOIN ${projectSubmissions}
        ON ${projectVerificationReports.submissionId} = ${projectSubmissions.id}
      INNER JOIN ${users}
        ON ${users.id} = ${projectSubmissions.userId}
      WHERE ${projectSubmissions.challengeId} = ${challengeId}
        AND ${projectSubmissions.status} = 'verified'
        AND ${users.username} IS NOT NULL
      ORDER BY ${users.id}, ${projectVerificationReports.compositeScore} DESC
    `)

    return rows
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, limit)
      .map((r, i) => ({
        rank: i + 1,
        username: r.username as string,
        compositeScore: r.composite_score,
        publicToken: r.is_public ? r.public_token : null,
        verifiedAt: r.verified_at ?? null,
      }))
  }

  async awardSkillsForSubmission(submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    const challenge = await this.getChallenge(submission.challengeId)
    const report = await this.getReportBySubmission(submissionId)

    // Award skills for any category scoring ≥ 7, even on insufficient.
    // This keeps the skills table populated for beginners who don't yet pass overall.
    const PARTIAL_AWARD_THRESHOLD = 7
    const rubric = challenge.rubric as { categories: { name: string; floor: number }[] }
    const categoryScores = report.categoryScores as Record<string, { score: number }>

    const eligibleNames = rubric.categories
      .filter((cat) => {
        const score = categoryScores[cat.name]?.score ?? 0
        return report.verdict === 'verified'
          ? score >= cat.floor
          : score >= PARTIAL_AWARD_THRESHOLD
      })
      .map((cat) => cat.name)

    if (eligibleNames.length === 0) return []

    // Fetch only skills matching eligible category names (case-insensitive via lower())
    const eligibleLower = new Set(eligibleNames.map((n) => n.toLowerCase()))
    const matchedSkills = await this.db.db
      .select()
      .from(skills)
      .where(inArray(sql`lower(${skills.name})`, [...eligibleLower]))

    if (matchedSkills.length === 0) {
      this.logger.warn(`awardSkillsForSubmission: no skills matched for categories [${eligibleNames.join(', ')}]`)
      return []
    }

    // Bulk insert all awards, ignoring conflicts
    const inserted = await this.db.db
      .insert(userSkills)
      .values(matchedSkills.map((skill) => ({
        userId: submission.userId,
        skillId: skill.id,
        sourceType: 'project' as const,
        sourceReportId: report.id,
      })))
      .onConflictDoUpdate({
        target: [userSkills.userId, userSkills.skillId],
        set: { sourceReportId: report.id },
      })
      .returning()

    return inserted
  }

  async reEnrichReport(reportId: string) {
    if (!this.enrichment.enabled) {
      throw new Error('AI report enrichment is unavailable')
    }

    const reportRows = await this.db.db
      .select()
      .from(projectVerificationReports)
      .where(eq(projectVerificationReports.id, reportId))
      .limit(1)
    const report = reportRows[0]
    if (!report) return

    const submission = await this.getSubmission(report.submissionId)
    const challenge = await this.getChallenge(submission.challengeId)

    const enriched = await this.enrichment.enrich({
      categoryScores: report.categoryScores as Record<string, { score: number; narrative: string; citations: string[]; status: string; minimumScore: number; weight: number; signals: Record<string, unknown> }>,
      verdict: report.verdict,
      compositeScore: report.compositeScore,
      repositoryName: submission.githubRepoFullName,
      challengeTitle: challenge.title,
    })

    if (
      enriched.publicSummary === FALLBACK_SUMMARY_VERIFIED
      || enriched.publicSummary === FALLBACK_SUMMARY_INSUFFICIENT
    ) {
      throw new Error('AI report enrichment returned fallback content')
    }

    await this.db.db
      .update(projectVerificationReports)
      .set({
        categoryScores: enriched.categoryScores,
        publicSummary: enriched.publicSummary,
      })
      .where(eq(projectVerificationReports.id, reportId))

    this.logger.log(`Re-enriched report ${reportId} for ${submission.githubRepoFullName}`)
  }

  async getExecutionForSubmission(userId: string, submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')

    // Find the ingestion for this submission's commit SHA
    const ingestionRows = await this.db.db
      .select({ id: repositoryIngestions.id })
      .from(repositoryIngestions)
      .where(eq(repositoryIngestions.commitSha, submission.commitSha))
      .limit(1)

    if (!ingestionRows[0]) return null

    const execRows = await this.db.db
      .select({
        language: repositoryExecutions.language,
        framework: repositoryExecutions.framework,
        testCommand: repositoryExecutions.testCommand,
        commandSummary: repositoryExecutions.commandSummary,
        publicSummary: repositoryExecutions.publicSummary,
        exitCode: repositoryExecutions.exitCode,
        passed: repositoryExecutions.passed,
        failed: repositoryExecutions.failed,
        skipped: repositoryExecutions.skipped,
        durationMs: repositoryExecutions.durationMs,
        stdout: repositoryExecutions.stdout,
        stderr: repositoryExecutions.stderr,
        timedOut: repositoryExecutions.timedOut,
        installResult: repositoryExecutions.installResult,
        testResult: repositoryExecutions.testResult,
        buildResult: repositoryExecutions.buildResult,
        lintResult: repositoryExecutions.lintResult,
        typecheckResult: repositoryExecutions.typecheckResult,
        doctorResult: repositoryExecutions.doctorResult,
      })
      .from(repositoryExecutions)
      .where(eq(repositoryExecutions.repositoryIngestionId, ingestionRows[0].id))
      .limit(1)

    return execRows[0] ?? null
  }

  private async getSubmission(submissionId: string) {
    const rows = await this.db.db.select().from(projectSubmissions).where(eq(projectSubmissions.id, submissionId)).limit(1)
    if (!rows[0]) throw new NotFoundException('Submission not found')
    return rows[0]
  }

  private async getChallenge(challengeId: string) {
    const rows = await this.db.db.select().from(projectChallenges).where(eq(projectChallenges.id, challengeId)).limit(1)
    if (!rows[0]) throw new NotFoundException('Challenge not found')
    return rows[0]
  }

  private async getAnalysis(repositoryAnalysisId: string) {
    const rows = await this.db.db.select().from(repositoryAnalyses).where(eq(repositoryAnalyses.id, repositoryAnalysisId)).limit(1)
    if (!rows[0]) throw new NotFoundException('Repository analysis not found')
    return rows[0]
  }

  private async getIngestion(repositoryIngestionId: string) {
    const rows = await this.db.db.select().from(repositoryIngestions).where(eq(repositoryIngestions.id, repositoryIngestionId)).limit(1)
    if (!rows[0]) throw new NotFoundException('Repository ingestion not found')
    return rows[0]
  }

  private async getReportBySubmission(submissionId: string) {
    const rows = await this.db.db.select().from(projectVerificationReports).where(eq(projectVerificationReports.submissionId, submissionId)).limit(1)
    if (!rows[0]) throw new NotFoundException('Report not found')
    return rows[0]
  }

  private toSafeReport(
    report: typeof projectVerificationReports.$inferSelect,
    submission: typeof projectSubmissions.$inferSelect,
    challenge: typeof projectChallenges.$inferSelect,
  ) {
    const scores = (report.categoryScores ?? {}) as Record<string, StoredCategoryScore>
    const categoryScores = this.withRubricWeights(scores, challenge)
    const strengths = deriveStrengths(scores)
    const improvements = deriveImprovements(scores)

    return {
      id: report.id,
      submissionId: report.submissionId,
      repositoryName: submission.githubRepoFullName,
      githubRepoFullName: submission.githubRepoFullName,
      commitSha: submission.commitSha,
      challengeTitle: challenge.title,
      compositeScore: report.compositeScore,
      verdict: report.verdict,
      categoryScores,
      publicSummary: report.publicSummary,
      aiFallback: report.publicSummary === FALLBACK_SUMMARY_VERIFIED || report.publicSummary === FALLBACK_SUMMARY_INSUFFICIENT,
      strengths,
      improvements,
      analyzerVersion: report.analyzerVersion,
      scoringVersion: report.scoringVersion,
      reportGeneratorVersion: report.reportGeneratorVersion,
      rubricVersion: report.rubricVersion,
      generatedAt: report.generatedAt,
      isPublic: report.isPublic,
      publicToken: report.publicToken,
    }
  }

  private async buildReportExtras(
    userId: string,
    report: typeof projectVerificationReports.$inferSelect,
    submission: typeof projectSubmissions.$inferSelect,
    challenge: typeof projectChallenges.$inferSelect,
  ) {
    const [skillProgress, aiReview, previousSubmission] = await Promise.all([
      this.buildSkillProgress(report, challenge),
      this.getAiReviewForSubmission(submission),
      this.getPreviousSubmissionDelta(userId, report, submission),
    ])

    return { skillProgress, aiReview, previousSubmission }
  }

  private withRubricWeights(
    scores: Record<string, StoredCategoryScore>,
    challenge: typeof projectChallenges.$inferSelect,
  ): Record<string, StoredCategoryScore> {
    const rubric = challenge.rubric as { categories?: { name: string; weight: number }[] }
    const weights = new Map((rubric.categories ?? []).map((category) => [category.name, category.weight]))

    return Object.fromEntries(
      Object.entries(scores).map(([name, score]) => [
        name,
        { ...score, weight: score.weight ?? weights.get(name) },
      ]),
    )
  }

  private async buildSkillProgress(
    report: typeof projectVerificationReports.$inferSelect,
    challenge: typeof projectChallenges.$inferSelect,
  ): Promise<SkillProgress[]> {
    const rubric = challenge.rubric as { categories: { name: string; floor: number }[] }
    const scores = this.withRubricWeights(
      (report.categoryScores ?? {}) as Record<string, StoredCategoryScore>,
      challenge,
    )
    const categoryNames = new Set(rubric.categories.map((c) => c.name.toLowerCase()))
    const skillRows = await this.db.db
      .select()
      .from(skills)
      .where(inArray(sql`lower(${skills.name})`, [...categoryNames]))
    const skillsByName = new Map(skillRows.map((skill) => [skill.name.toLowerCase(), skill]))

    return rubric.categories.map((category) => {
      const score = scores[category.name]?.score ?? 0
      const minimumScore = scores[category.name]?.minimumScore ?? category.floor
      const matchedSkill = skillsByName.get(category.name.toLowerCase()) ?? null
      const eligible = score >= minimumScore
      return {
        name: category.name,
        score,
        minimumScore,
        pointsNeeded: Math.max(0, minimumScore - score),
        eligible,
        awarded: report.verdict === 'verified' && eligible && matchedSkill !== null,
        matchedSkillId: matchedSkill?.id ?? null,
      }
    })
  }

  private async getAiReviewForSubmission(submission: typeof projectSubmissions.$inferSelect) {
    const rows = await this.db.db
      .select({
        status: repositoryAiReviews.status,
        model: repositoryAiReviews.model,
        promptVersion: repositoryAiReviews.promptVersion,
        reviewData: repositoryAiReviews.reviewData,
        inputTokens: repositoryAiReviews.inputTokens,
        outputTokens: repositoryAiReviews.outputTokens,
        estimatedCostUsd: repositoryAiReviews.estimatedCostUsd,
        latencyMs: repositoryAiReviews.latencyMs,
        errorMessage: repositoryAiReviews.errorMessage,
        createdAt: repositoryAiReviews.createdAt,
      })
      .from(repositoryIngestions)
      .innerJoin(repositoryAnalyses, eq(repositoryAnalyses.repositoryIngestionId, repositoryIngestions.id))
      .innerJoin(repositoryAiReviews, eq(repositoryAiReviews.repositoryAnalysisId, repositoryAnalyses.id))
      .where(and(
        eq(repositoryIngestions.githubRepoId, submission.githubRepoId),
        eq(repositoryIngestions.commitSha, submission.commitSha),
      ))
      .orderBy(desc(repositoryAiReviews.createdAt))
      .limit(1)

    const row = rows[0]
    if (!row) return null
    return {
      status: row.status,
      model: row.model,
      promptVersion: row.promptVersion,
      possibleMissedEvidence: ((row.reviewData as { possibleMissedEvidence?: unknown[] })?.possibleMissedEvidence ?? []).slice(0, 10),
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      estimatedCostUsd: row.estimatedCostUsd,
      latencyMs: row.latencyMs,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt.toISOString(),
    }
  }

  private async getPreviousSubmissionDelta(
    userId: string,
    report: typeof projectVerificationReports.$inferSelect,
    submission: typeof projectSubmissions.$inferSelect,
  ) {
    const rows = await this.db.db
      .select({
        submission: projectSubmissions,
        report: projectVerificationReports,
      })
      .from(projectSubmissions)
      .innerJoin(projectVerificationReports, eq(projectVerificationReports.submissionId, projectSubmissions.id))
      .where(and(
        eq(projectSubmissions.userId, userId),
        eq(projectSubmissions.challengeId, submission.challengeId),
        eq(projectSubmissions.githubRepoFullName, submission.githubRepoFullName),
        ne(projectSubmissions.id, submission.id),
      ))
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(1)

    const previous = rows[0]
    if (!previous) return null

    const currentScores = report.categoryScores as Record<string, StoredCategoryScore>
    const previousScores = previous.report.categoryScores as Record<string, StoredCategoryScore>
    const categories = Array.from(new Set([...Object.keys(currentScores), ...Object.keys(previousScores)]))
      .map((category) => ({
        category,
        previousScore: previousScores[category]?.score ?? 0,
        currentScore: currentScores[category]?.score ?? 0,
        delta: (currentScores[category]?.score ?? 0) - (previousScores[category]?.score ?? 0),
      }))
      .filter((item) => item.delta !== 0)

    const changedFiles = await this.getChangedSelectedFiles(previous.submission, submission)
    return {
      previousSubmissionId: previous.submission.id,
      previousCommitSha: previous.submission.commitSha,
      currentCommitSha: submission.commitSha,
      previousCompositeScore: previous.report.compositeScore,
      currentCompositeScore: report.compositeScore,
      compositeDelta: report.compositeScore - previous.report.compositeScore,
      categories,
      changedFiles,
    }
  }

  private async getChangedSelectedFiles(
    previousSubmission: typeof projectSubmissions.$inferSelect,
    currentSubmission: typeof projectSubmissions.$inferSelect,
  ) {
    const ingestions = await this.db.db
      .select({
        commitSha: repositoryIngestions.commitSha,
        ingestedData: repositoryIngestions.ingestedData,
      })
      .from(repositoryIngestions)
      .where(and(
        eq(repositoryIngestions.githubRepoId, currentSubmission.githubRepoId),
        inArray(repositoryIngestions.commitSha, [previousSubmission.commitSha, currentSubmission.commitSha]),
      ))

    const byCommit = new Map(ingestions.map((row) => [row.commitSha, row.ingestedData as RepositoryIngestionData]))
    const previousFiles = new Map((byCommit.get(previousSubmission.commitSha)?.files ?? []).map((file) => [file.path, file.content ?? '']))
    const currentFiles = new Map((byCommit.get(currentSubmission.commitSha)?.files ?? []).map((file) => [file.path, file.content ?? '']))
    const paths = Array.from(new Set([...previousFiles.keys(), ...currentFiles.keys()])).sort()

    return paths
      .filter((path) => previousFiles.get(path) !== currentFiles.get(path))
      .slice(0, 20)
      .map((path) => ({
        path,
        status: !previousFiles.has(path) ? 'added' : !currentFiles.has(path) ? 'removed' : 'changed',
      }))
  }

  private toPublicProof(
    report: typeof projectVerificationReports.$inferSelect,
    submission: typeof projectSubmissions.$inferSelect,
    challenge: typeof projectChallenges.$inferSelect,
    executionSummary?: { passed: number; failed: number; skipped: number; language: string; framework: string | null; durationMs: number | null; timedOut: boolean } | null,
    awardedSkills?: string[],
    submitterUsername?: string | null,
  ) {
    const scores = this.withRubricWeights(
      (report.categoryScores ?? {}) as Record<string, StoredCategoryScore>,
      challenge,
    )

    const safeScores: Record<string, { score: number; narrative: string; citations: string[]; minimumScore?: number; weight?: number; status?: string }> = {}
    for (const [name, v] of Object.entries(scores)) {
      safeScores[name] = {
        score: v.score,
        narrative: v.narrative,
        citations: v.citations,
        minimumScore: v.minimumScore,
        weight: v.weight,
        status: v.status,
      }
    }

    return {
      id: report.id,
      submissionId: report.submissionId,
      repositoryName: submission.githubRepoFullName,
      commitSha: submission.commitSha,
      challengeTitle: challenge.title,
      compositeScore: report.compositeScore,
      verdict: report.verdict,
      categoryScores: safeScores,
      publicSummary: report.publicSummary,
      analyzerVersion: report.analyzerVersion,
      rubricVersion: report.rubricVersion,
      generatedAt: report.generatedAt,
      publicToken: report.publicToken,
      viewCount: report.viewCount ?? 0,
      executionSummary: executionSummary ?? null,
      awardedSkills: awardedSkills ?? [],
      submitterUsername: submitterUsername ?? null,
    }
  }

  async submitFeedback(
    userId: string,
    submissionId: string,
    dto: { accuracyRating: number; missedEvidence?: string; notes?: string; wouldShare?: boolean },
  ) {
    const report = await this.getReportBySubmission(submissionId)
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')

    const rows = await this.db.db
      .insert(reportFeedback)
      .values({
        reportId: report.id,
        userId,
        accuracyRating: dto.accuracyRating,
        missedEvidence: dto.missedEvidence ?? null,
        notes: dto.notes ?? null,
        wouldShare: dto.wouldShare ?? null,
      })
      .onConflictDoUpdate({
        target: [reportFeedback.reportId, reportFeedback.userId],
        set: {
          accuracyRating: dto.accuracyRating,
          missedEvidence: dto.missedEvidence ?? null,
          notes: dto.notes ?? null,
          wouldShare: dto.wouldShare ?? null,
        },
      })
      .returning()

    this.audit.log(userId, 'report_feedback_submitted', { reportId: report.id, rating: dto.accuracyRating })
    return rows[0]
  }

  async getFeedbackSummary(userId: string, submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')
    const report = await this.getReportBySubmission(submissionId)

    const [summary, highRows] = await Promise.all([
      this.db.db
        .select({
          total: count(),
          averageRating: avg(reportFeedback.accuracyRating),
        })
        .from(reportFeedback)
        .where(eq(reportFeedback.reportId, report.id)),
      this.db.db
        .select({ value: count() })
        .from(reportFeedback)
        .where(and(eq(reportFeedback.reportId, report.id), gte(reportFeedback.accuracyRating, 4))),
    ])

    const total = summary[0]?.total ?? 0
    if (total === 0) return null

    const rawAvg = Number(summary[0]?.averageRating ?? 0)
    return {
      count: total,
      averageRating: Math.round(rawAvg * 10) / 10,
      highAccuracyCount: highRows[0]?.value ?? 0,
    }
  }

}
