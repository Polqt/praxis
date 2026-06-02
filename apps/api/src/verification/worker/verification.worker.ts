import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { Job, Worker } from 'bullmq'
import { RepositoryAnalysisService } from '../analysis/repository-analysis.service'
import { RepositoryIngestionService } from '../ingestion/repository-ingestion.service'
import {
  VERIFICATION_JOB_NAMES,
  VERIFICATION_QUEUE_NAME,
  VerificationJobPayload,
} from '../queue/queue.constants'
import { redisConnectionOptions } from '../queue/redis-connection'
import { VerificationQueueService } from '../queue/queue.service'
import { ReportsService } from '../../reports/reports.service'
import { SubmissionStatusService } from '../../submissions/submission-status.service'
import { StaleSubmissionService } from '../../submissions/stale-submission.service'
import { AuditService } from '../../audit/audit.service'
import { NotificationsService } from '../../notifications/notifications.service'
import { DatabaseService } from '../../database/database.service'
import { users, projectSubmissions, projectVerificationReports, projectChallenges } from '../../database/schema'

@Injectable()
export class VerificationWorker implements OnModuleDestroy {
  private readonly logger = new Logger(VerificationWorker.name)
  private worker?: Worker<VerificationJobPayload>

  constructor(
    private readonly config: ConfigService,
    private readonly queue: VerificationQueueService,
    private readonly ingestion: RepositoryIngestionService,
    private readonly analysis: RepositoryAnalysisService,
    private readonly reports: ReportsService,
    private readonly statuses: SubmissionStatusService,
    private readonly staleSubmissions: StaleSubmissionService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly db: DatabaseService,
  ) {}

  start() {
    const redisUrl = this.config.get<string>('redis.url')
    if (!redisUrl) throw new Error('REDIS_URL is required')

    this.worker = new Worker<VerificationJobPayload>(
      VERIFICATION_QUEUE_NAME,
      (job) => this.process(job),
      {
        connection: redisConnectionOptions(redisUrl),
        concurrency: 2,
      },
    )

    this.worker.on('failed', (job, error) => {
      this.logger.error('verification job failed', {
        id: job?.id,
        name: job?.name,
        submissionId: job?.data.submissionId,
        message: error.message,
      })
      if (job && job.attemptsMade >= ((job.opts.attempts as number | undefined) ?? 1)) {
        void this.markFinalFailure(job, error)
      }
    })
  }

  async onModuleDestroy() {
    await this.worker?.close()
  }

  private async process(job: Job<VerificationJobPayload>) {
    if (job.name === VERIFICATION_JOB_NAMES.expireStaleSubmission) {
      await this.staleSubmissions.expireStale()
      return
    }

    const { submissionId } = job.data
    if (!submissionId || Object.keys(job.data).length !== 1) {
      throw new Error('Verification jobs must contain only submissionId')
    }

    switch (job.name) {
      case VERIFICATION_JOB_NAMES.ingestRepo:
        await this.statuses.transition({ submissionId, toStatus: 'ingesting', reason: 'job_started' })
        await this.ingestion.ingestSubmission(submissionId)
        await this.statuses.transition({ submissionId, toStatus: 'analyzing', reason: 'ingestion_complete' })
        await this.queue.enqueueAnalyzeProject(submissionId)
        return
      case VERIFICATION_JOB_NAMES.analyzeProject: {
        const analysis = await this.analysis.analyzeSubmission(submissionId)
        await this.statuses.transition({ submissionId, toStatus: 'generating_report', reason: 'analysis_complete' })
        await this.queue.enqueueGenerateReport(submissionId)
        return analysis
      }
      case VERIFICATION_JOB_NAMES.generateReport: {
        const analysis = await this.analysis.analyzeSubmission(submissionId)
        const report = await this.reports.generateForSubmission(submissionId, analysis.id)
        await this.statuses.transition({
          submissionId,
          toStatus: report.verdict === 'verified' ? 'verified' : 'insufficient',
          reason: 'report_generated',
          metadata: { reportId: report.id, verdict: report.verdict },
        })
        await this.queue.enqueueAwardSkills(submissionId)
        await this.queue.enqueueSendReportEmail(submissionId)
        return
      }
      case VERIFICATION_JOB_NAMES.awardSkills:
        await this.reports.awardSkillsForSubmission(submissionId)
        return
      case VERIFICATION_JOB_NAMES.sendReportEmail:
        await this.sendReportEmail(submissionId)
        return

      default:
        throw new Error(`Unknown verification job: ${job.name}`)
    }
  }

  private async sendReportEmail(submissionId: string): Promise<void> {
    const submissionRows = await this.db.db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, submissionId))
      .limit(1)
    const submission = submissionRows[0]
    if (!submission) return

    const userRows = await this.db.db
      .select({ email: users.email, username: users.username })
      .from(users)
      .where(eq(users.id, submission.userId))
      .limit(1)
    const user = userRows[0]
    if (!user?.email) return

    const reportRows = await this.db.db
      .select()
      .from(projectVerificationReports)
      .where(eq(projectVerificationReports.submissionId, submissionId))
      .limit(1)
    const report = reportRows[0]
    if (!report) return

    const challengeRows = await this.db.db
      .select({ title: projectChallenges.title })
      .from(projectChallenges)
      .where(eq(projectChallenges.id, submission.challengeId))
      .limit(1)
    const challengeTitle = challengeRows[0]?.title ?? 'Verification Challenge'

    const categoryScores = report.categoryScores as Record<string, { score: number; minimumScore: number }>
    const floorFailures = Object.entries(categoryScores)
      .filter(([, v]) => v.score < v.minimumScore)
      .map(([category, v]) => ({ category, score: v.score, minimumScore: v.minimumScore }))

    const webBaseUrl = this.config.get<string>('webBaseUrl') ?? 'https://praxisdev.vercel.app'
    const reportUrl = `${webBaseUrl}/submissions/${submissionId}`

    await this.notifications.sendReportReady({
      toEmail: user.email,
      username: user.username ?? user.email.split('@')[0],
      repositoryName: submission.githubRepoFullName,
      challengeTitle,
      compositeScore: report.compositeScore,
      verdict: report.verdict as 'verified' | 'insufficient' | 'failed',
      reportUrl,
      floorFailures,
    })
  }

  private async markFinalFailure(job: Job<VerificationJobPayload>, error: Error) {
    const toStatus = job.name === VERIFICATION_JOB_NAMES.ingestRepo
      ? 'ingestion_failed'
      : job.name === VERIFICATION_JOB_NAMES.analyzeProject
        ? 'analysis_failed'
        : job.name === VERIFICATION_JOB_NAMES.generateReport
          ? 'report_generation_failed'
          : 'failed'

    try {
      await this.statuses.transition({
        submissionId: job.data.submissionId,
        toStatus,
        reason: 'job_failed_final_attempt',
        failureReason: error.message.slice(0, 500),
        metadata: { jobName: job.name, attemptsMade: job.attemptsMade },
      })
    } catch (transitionError) {
      this.logger.error('failed to mark final job failure', {
        submissionId: job.data.submissionId,
        jobName: job.name,
        message: transitionError instanceof Error ? transitionError.message : String(transitionError),
      })
    }
  }
}
