import { Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { ANALYZER_VERSION, SCORING_VERSION } from '../scoring/versions'
import { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'
import { DatabaseService } from '../database/database.service'
import {
  projectChallenges,
  projectSubmissions,
  projectVerificationReports,
  repositoryAnalyses,
  repositoryIngestions,
  skills,
  userSkills,
} from '../database/schema'
import { scoreReport } from './report-scoring'

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async generateForSubmission(submissionId: string, repositoryAnalysisId: string) {
    const submission = await this.getSubmission(submissionId)
    const challenge = await this.getChallenge(submission.challengeId)
    const analysis = await this.getAnalysis(repositoryAnalysisId)
    const ingestion = await this.getIngestion(analysis.repositoryIngestionId)
    const scored = scoreReport(
      challenge.rubric as { categories: { name: string; weight: number; floor: number }[] },
      ingestion.ingestedData as RepositoryIngestionData,
      challenge.passingThreshold,
    )

    const inserted = await this.db.db.insert(projectVerificationReports).values({
      submissionId,
      compositeScore: scored.compositeScore,
      verdict: scored.verdict,
      categoryScores: scored.categoryScores,
      publicSummary: scored.publicSummary,
      aiModelVersion: ANALYZER_VERSION,
      analyzerVersion: ANALYZER_VERSION,
      scoringVersion: SCORING_VERSION,
      rubricVersion: submission.rubricVersion,
      isPublic: false,
    }).onConflictDoUpdate({
      target: projectVerificationReports.submissionId,
      set: {
        compositeScore: scored.compositeScore,
        verdict: scored.verdict,
        categoryScores: scored.categoryScores,
        publicSummary: scored.publicSummary,
        aiModelVersion: ANALYZER_VERSION,
        analyzerVersion: ANALYZER_VERSION,
        scoringVersion: SCORING_VERSION,
        rubricVersion: submission.rubricVersion,
      },
    }).returning()

    return inserted[0]
  }

  async getPrivateReport(userId: string, submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')
    const report = await this.getReportBySubmission(submissionId)
    return this.toSafeReport(report, submission)
  }

  async setVisibility(userId: string, submissionId: string, isPublic: boolean) {
    const submission = await this.getSubmission(submissionId)
    if (submission.userId !== userId) throw new NotFoundException('Report not found')
    const token = isPublic ? randomBytes(24).toString('base64url') : null
    const rows = await this.db.db.update(projectVerificationReports)
      .set({ isPublic, publicToken: token })
      .where(eq(projectVerificationReports.submissionId, submissionId))
      .returning()
    if (!rows[0]) throw new NotFoundException('Report not found')
    return this.toSafeReport(rows[0], submission)
  }

  async getPublicProof(publicToken: string) {
    const reports = await this.db.db.select().from(projectVerificationReports)
      .where(eq(projectVerificationReports.publicToken, publicToken))
      .limit(1)
    if (!reports[0] || !reports[0].isPublic) throw new NotFoundException('Proof not found')
    const submission = await this.getSubmission(reports[0].submissionId)
    return this.toSafeReport(reports[0], submission)
  }

  async awardSkillsForSubmission(submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    const challenge = await this.getChallenge(submission.challengeId)
    const report = await this.getReportBySubmission(submissionId)
    if (report.verdict !== 'verified') return []

    const rubric = challenge.rubric as { categories: { name: string; floor: number }[] }
    const categoryScores = report.categoryScores as Record<string, { score: number }>
    const awarded = []

    for (const category of rubric.categories) {
      const score = categoryScores[category.name]?.score ?? 0
      if (score < category.floor) continue

      const skillRows = await this.db.db
        .select()
        .from(skills)
        .where(eq(skills.name, category.name))
        .limit(1)

      if (!skillRows[0]) continue

      const inserted = await this.db.db
        .insert(userSkills)
        .values({
          userId: submission.userId,
          skillId: skillRows[0].id,
          sourceType: 'project',
        })
        .onConflictDoNothing()
        .returning()

      if (inserted[0]) awarded.push(inserted[0])
    }

    return awarded
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

  private toSafeReport(report: typeof projectVerificationReports.$inferSelect, submission: typeof projectSubmissions.$inferSelect) {
    return {
      id: report.id,
      submissionId: report.submissionId,
      githubRepoFullName: submission.githubRepoFullName,
      commitSha: submission.commitSha,
      compositeScore: report.compositeScore,
      verdict: report.verdict,
      categoryScores: report.categoryScores,
      publicSummary: report.publicSummary,
      aiModelVersion: report.aiModelVersion,
      analyzerVersion: report.analyzerVersion,
      scoringVersion: report.scoringVersion,
      rubricVersion: report.rubricVersion,
      generatedAt: report.generatedAt,
      isPublic: report.isPublic,
      publicToken: report.publicToken,
    }
  }
}
