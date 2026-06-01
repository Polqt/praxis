import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { ChallengesService } from '../challenges/challenges.service'
import { DatabaseService } from '../database/database.service'
import { projectSubmissionEvents, projectSubmissions } from '../database/schema'
import { GitHubApiService } from '../github/github-api.service'
import { GitHubService } from '../github/github.service'
import { VerificationQueueService } from '../verification/queue/queue.service'
import { SubmissionStatusService } from './submission-status.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { parseRepoFullName } from './submissions.util'

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly challengesService: ChallengesService,
    private readonly githubService: GitHubService,
    private readonly githubApi: GitHubApiService,
    private readonly verificationQueue: VerificationQueueService,
    private readonly statusService: SubmissionStatusService,
  ) {}

  async create(userId: string, dto: CreateSubmissionDto) {
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
    }

    await this.verificationQueue.enqueueIngestRepo(submission.id)
    return submission
  }

  listForUser(userId: string) {
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
        ['queued', 'ingesting', 'analyzing', 'generating_report'].includes(submission.status)
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
