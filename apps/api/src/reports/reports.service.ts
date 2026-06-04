import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { ANALYZER_VERSION, REPORT_GENERATOR_VERSION, SCORING_VERSION } from '../scoring/versions'
import { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'
import type { RepositoryAnalysisData } from '../verification/analysis/repository-analysis.types'
import { DatabaseService } from '../database/database.service'
import {
  projectChallenges,
  projectSubmissions,
  projectVerificationReports,
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
import { ReportEnrichmentService } from './report-enrichment.service'
import { AiEvidenceReviewService } from './ai-evidence-review.service'
import { deriveStrengths, deriveImprovements } from '../scoring/derive-report-highlights'

type StoredCategoryScore = {
  score: number
  narrative: string
  citations: string[]
  status: string
  minimumScore: number
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
    const challenge = await this.getChallenge(submission.challengeId)
    const analysis = await this.getAnalysis(repositoryAnalysisId)
    const ingestion = await this.getIngestion(analysis.repositoryIngestionId)
    const executionRows = await this.db.db
      .select()
      .from(repositoryExecutions)
      .where(eq(repositoryExecutions.repositoryIngestionId, analysis.repositoryIngestionId))
      .limit(1)

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
      analyzerVersion: ANALYZER_VERSION,
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
        analyzerVersion: ANALYZER_VERSION,
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
    const report = await this.getReportBySubmission(submissionId)
    const challenge = await this.getChallenge(submission.challengeId)
    return this.toSafeReport(report, submission, challenge)
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

    await this.db.db
      .update(projectVerificationReports)
      .set({ viewCount: (reports[0].viewCount ?? 0) + 1 })
      .where(eq(projectVerificationReports.id, reports[0].id))

    const submission = await this.getSubmission(reports[0].submissionId)
    const challenge = await this.getChallenge(submission.challengeId)

    // Fetch execution summary for public display (test counts + language)
    const execRows = await this.db.db
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
      .limit(1)

    const executionSummary = execRows[0] ?? null

    return this.toPublicProof(
      { ...reports[0], viewCount: (reports[0].viewCount ?? 0) + 1 },
      submission,
      challenge,
      executionSummary,
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

  async awardSkillsForSubmission(submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    const challenge = await this.getChallenge(submission.challengeId)
    const report = await this.getReportBySubmission(submissionId)
    if (report.verdict !== 'verified') return []

    const rubric = challenge.rubric as { categories: { name: string; floor: number }[] }
    const categoryScores = report.categoryScores as Record<string, { score: number }>

    // Collect category names that passed their floor
    const eligibleNames = rubric.categories
      .filter((cat) => (categoryScores[cat.name]?.score ?? 0) >= cat.floor)
      .map((cat) => cat.name)

    if (eligibleNames.length === 0) return []

    // Fetch all skills and match case-insensitively so minor casing differences don't silently break awards
    const eligibleLower = new Set(eligibleNames.map((n) => n.toLowerCase()))
    const allSkills = await this.db.db.select().from(skills)
    const matchedSkills = allSkills.filter((s) => eligibleLower.has(s.name.toLowerCase()))

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
      })))
      .onConflictDoNothing()
      .returning()

    return inserted
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
      categoryScores: report.categoryScores,
      publicSummary: report.publicSummary,
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

  private toPublicProof(
    report: typeof projectVerificationReports.$inferSelect,
    submission: typeof projectSubmissions.$inferSelect,
    challenge: typeof projectChallenges.$inferSelect,
    executionSummary?: { passed: number; failed: number; skipped: number; language: string; framework: string | null; durationMs: number | null; timedOut: boolean } | null,
  ) {
    const scores = (report.categoryScores ?? {}) as Record<string, StoredCategoryScore>

    const safeScores: Record<string, { score: number; narrative: string; citations: string[]; minimumScore?: number; status?: string }> = {}
    for (const [name, v] of Object.entries(scores)) {
      safeScores[name] = { score: v.score, narrative: v.narrative, citations: v.citations, minimumScore: v.minimumScore, status: v.status }
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

  async getFeedbackAnalytics() {
    const rows = await this.db.db
      .select({
        accuracyRating: reportFeedback.accuracyRating,
        missedEvidence: reportFeedback.missedEvidence,
        notes: reportFeedback.notes,
        wouldShare: reportFeedback.wouldShare,
      })
      .from(reportFeedback)

    const categoryCounts = new Map<string, number>()
    const frameworkCounts = new Map<string, number>()
    let wouldShare = 0
    let wouldNotShare = 0

    const categories = ['API Design', 'Authentication', 'Database Design', 'Testing', 'Documentation', 'Deployment']
    const frameworks = ['Django', 'Expo', 'NestJS', 'Next.js', 'React Native', 'Express', 'Laravel', 'Rails', 'Spring', 'Go']

    for (const row of rows) {
      const text = `${row.missedEvidence ?? ''}\n${row.notes ?? ''}`.toLowerCase()
      for (const category of categories) {
        if (text.includes(category.toLowerCase())) {
          categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
        }
      }
      for (const framework of frameworks) {
        if (text.includes(framework.toLowerCase())) {
          frameworkCounts.set(framework, (frameworkCounts.get(framework) ?? 0) + 1)
        }
      }
      if (row.wouldShare === true) wouldShare += 1
      if (row.wouldShare === false) wouldNotShare += 1
    }

    const toSorted = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

    return {
      total: rows.length,
      averageAccuracyRating: rows.length
        ? Number((rows.reduce((sum, row) => sum + row.accuracyRating, 0) / rows.length).toFixed(2))
        : 0,
      categoriesMarkedInaccurate: toSorted(categoryCounts),
      frameworksMentioned: toSorted(frameworkCounts),
      shareIntent: { wouldShare, wouldNotShare },
      commonMissedEvidence: rows
        .map((row) => row.missedEvidence)
        .filter((value): value is string => Boolean(value))
        .slice(0, 25),
    }
  }
}
