import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, count, desc, eq, gte } from 'drizzle-orm'
import { ChallengesService } from '../challenges/challenges.service'
import { DatabaseService } from '../database/database.service'
import { projectSubmissionEvents, projectSubmissions } from '../database/schema'
import { GitHubApiService } from '../github/github-api.service'
import { GitHubService } from '../github/github.service'
import { VerificationQueueService } from '../verification/queue/queue.service'
import { SubmissionStatusService } from './submission-status.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { parseRepoFullName } from './submissions.util'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly challengesService: ChallengesService,
    private readonly githubService: GitHubService,
    private readonly githubApi: GitHubApiService,
    private readonly verificationQueue: VerificationQueueService,
    private readonly statusService: SubmissionStatusService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, dto: CreateSubmissionDto) {
    const rateLimitPerHour = this.config.get<number>('submissions.rateLimitPerHour') ?? 5
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCountRows = await this.db.db
      .select({ value: count() })
      .from(projectSubmissions)
      .where(and(
        eq(projectSubmissions.userId, userId),
        gte(projectSubmissions.submittedAt, oneHourAgo),
      ))
    const recentCount = recentCountRows[0]?.value ?? 0
    if (recentCount >= rateLimitPerHour) {
      throw new HttpException(
        { message: 'You have reached the submission limit. Please wait before submitting again.' },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    const challenge = await this.challengesService.getActive(dto.challengeId)
    const { account, accessToken } = await this.githubService.getActiveToken(userId)
    const { owner, repo } = parseRepoFullName(dto.githubRepoFullName)

    const repository = await this.githubApi.getRepository(accessToken, owner, repo)
    if (!repository) throw new NotFoundException('GitHub repository not found')

    const canSubmit = repository.owner.id === account.githubUserId
      || Boolean(repository.permissions?.admin || repository.permissions?.maintain || repository.permissions?.push)
    if (!canSubmit) {
      throw new ForbiddenException('You must own or have write access to submit this repository')
    }

    const ref = dto.commitSha ?? repository.default_branch
    const commit = await this.githubApi.getCommit(accessToken, owner, repo, ref)
    if (!commit) throw new NotFoundException('GitHub commit not found')

    const inserted = await this.db.db
      .insert(projectSubmissions)
      .values({
        userId,
        challengeId: challenge.id,
        githubRepoFullName: repository.full_name,
        githubRepoId: repository.id,
        commitSha: commit.sha,
        status: 'created',
        rubricVersion: challenge.version,
      })
      .onConflictDoNothing()
      .returning()

    const submission = inserted[0] ?? await this.findDuplicate(userId, challenge.id, commit.sha)
    if (!submission) throw new BadRequestException('Unable to create submission')

    if (inserted[0]) {
      this.audit.log(userId, 'submission_created', {
        submissionId: submission.id,
        challengeId: challenge.id,
        repositoryUrl: `https://github.com/${repository.full_name}`,
      })

      const queued = await this.statusService.transition({
        submissionId: submission.id,
        toStatus: 'queued',
        reason: 'submission_queued',
        metadata: {
          githubRepoFullName: repository.full_name,
          commitSha: commit.sha,
        },
      })
      Object.assign(submission, queued)

      await this.verificationQueue.enqueueIngestRepo(submission.id)
    }

    return submission
  }

  listForUser(userId: string): Promise<(typeof projectSubmissions.$inferSelect)[]> {
    return this.db.db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.userId, userId))
      .orderBy(desc(projectSubmissions.submittedAt))
  }

  async getStats(userId: string) {
    const submissions = await this.listForUser(userId)
    return {
      totalSubmissions: submissions.length,
      verifiedCount: submissions.filter((submission) => submission.status === 'verified').length,
      inProgressCount: submissions.filter((submission) => (
        ['created', 'queued', 'ingesting', 'analyzing', 'generating_report'].includes(submission.status)
      )).length,
      reportsGenerated: submissions.filter((submission) => (
        ['verified', 'insufficient', 'failed'].includes(submission.status)
      )).length,
    }
  }

  async getForUser(userId: string, submissionId: string) {
    const rows = await this.db.db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, submissionId))
      .limit(1)

    if (!rows[0] || rows[0].userId !== userId) {
      throw new NotFoundException('Submission not found')
    }

    return rows[0]
  }

  listEventsForUser(userId: string, submissionId: string) {
    return this.getForUser(userId, submissionId).then(() => (
      this.db.db
        .select()
        .from(projectSubmissionEvents)
        .where(eq(projectSubmissionEvents.submissionId, submissionId))
        .orderBy(desc(projectSubmissionEvents.createdAt))
    ))
  }

  async getDashboardStats(userId: string, verifiedSkills: unknown[]) {
    const submissions = await this.listForUser(userId)
    return {
      totalVerified: verifiedSkills.length,
      totalAttempts: submissions.length,
      verifiedSkills,
      recentSubmissions: submissions.slice(0, 5),
    }
  }

  async requeueSubmission(userId: string, submissionId: string) {
    const submission = await this.getForUser(userId, submissionId)

    if (submission.status !== 'cancelled') {
      throw new ConflictException('Only cancelled submissions can be requeued')
    }

    const now = new Date()
    const updated = await this.db.db
      .update(projectSubmissions)
      .set({ status: 'queued', completedAt: null, submittedAt: now })
      .where(eq(projectSubmissions.id, submissionId))
      .returning()

    await this.db.db.insert(projectSubmissionEvents).values({
      submissionId,
      fromStatus: 'cancelled',
      toStatus: 'queued',
      reason: 'submission_requeued',
    })

    this.audit.log(userId, 'submission_requeued', { submissionId })
    await this.verificationQueue.enqueueIngestRepo(submissionId)

    return updated[0]
  }

  async cancelSubmission(userId: string, submissionId: string) {
    const submission = await this.getForUser(userId, submissionId)

    if (submission.status !== 'queued') {
      throw new ConflictException('Only queued submissions can be cancelled')
    }

    const updated = await this.statusService.transition({
      submissionId,
      toStatus: 'cancelled',
      reason: 'submission_cancelled',
    })

    this.audit.log(userId, 'submission_cancelled', { submissionId })

    return updated
  }

  private async findDuplicate(userId: string, challengeId: string, commitSha: string) {
    const rows = await this.db.db
      .select()
      .from(projectSubmissions)
      .where(and(
        eq(projectSubmissions.userId, userId),
        eq(projectSubmissions.challengeId, challengeId),
        eq(projectSubmissions.commitSha, commitSha),
      ))
      .limit(1)

    return rows[0]
  }
}
