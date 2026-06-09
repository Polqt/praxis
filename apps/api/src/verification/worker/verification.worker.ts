import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { Job, Worker } from 'bullmq'
import { RepositoryAnalysisService } from '../analysis/repository-analysis.service'
import { RepositoryIngestionService } from '../ingestion/repository-ingestion.service'
import { RepositoryExecutionService } from '../execution/repository-execution.service'
import {
  VERIFICATION_JOB_NAMES,
  VERIFICATION_QUEUE_NAME,
  VerificationJobPayload,
} from '../queue/queue.constants'
import { redisConnectionOptions } from '../queue/redis-connection'
import { VerificationQueueService } from '../queue/queue.service'
import { ReportsService } from '../../reports/reports.service'
import { FALLBACK_SUMMARY_VERIFIED, FALLBACK_SUMMARY_INSUFFICIENT } from '../../reports/report-enrichment.service'
import { SubmissionStatusService } from '../../submissions/submission-status.service'
import { StaleSubmissionService } from '../../submissions/stale-submission.service'
import { AuditService } from '../../audit/audit.service'
import { NotificationsService } from '../../notifications/notifications.service'
import { DatabaseService } from '../../database/database.service'
import { GitHubService } from '../../github/github.service'
import { users, projectSubmissions, projectVerificationReports, projectChallenges, repositoryIngestions } from '../../database/schema'

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
    private readonly execution: RepositoryExecutionService,
    private readonly github: GitHubService,
  ) {}

  start() {
    const redisUrl = this.config.get<string>('redis.url')
    if (!redisUrl) throw new Error('REDIS_URL is required')

    this.worker = new Worker<VerificationJobPayload>(
      VERIFICATION_QUEUE_NAME,
      (job) => this.process(job),
      {
        connection: redisConnectionOptions(redisUrl),
        concurrency: this.config.get<number>('verificationPipeline.workerConcurrency') ?? 2,
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

    if (job.name === VERIFICATION_JOB_NAMES.reEnrichReport) {
      const { reportId } = job.data
      if (!reportId) throw new Error('reEnrichReport job missing reportId')
      await this.reports.reEnrichReport(reportId)
      return
    }

    const { submissionId } = job.data
    if (!submissionId) {
      throw new Error('Verification jobs must contain submissionId')
    }

    if (job.name === VERIFICATION_JOB_NAMES.ingestRepo) {
      const rows = await this.db.db
        .select({ status: projectSubmissions.status })
        .from(projectSubmissions)
        .where(eq(projectSubmissions.id, submissionId))
        .limit(1)
      if (rows[0]?.status === 'cancelled') {
        this.logger.log(`Skipping cancelled submission ${submissionId}`)
        return
      }
    }

    switch (job.name) {
      case VERIFICATION_JOB_NAMES.ingestRepo: {
        try {
          await this.statuses.transition({ submissionId, toStatus: 'ingesting', reason: 'job_started' })
        } catch {
          const rows = await this.db.db
            .select({ status: projectSubmissions.status })
            .from(projectSubmissions)
            .where(eq(projectSubmissions.id, submissionId))
            .limit(1)
          if (rows[0]?.status === 'cancelled') {
            this.logger.log(`Skipping cancelled submission ${submissionId} (race condition)`)
            return
          }
          throw new Error(`Failed to transition submission ${submissionId} to ingesting`)
        }
        await this.ingestion.ingestSubmission(submissionId)
        if (this.execution.enabled) {
          await this.queue.enqueueExecuteTests(submissionId)
        } else {
          await this.statuses.transition({ submissionId, toStatus: 'analyzing', reason: 'ingestion_complete' })
          await this.queue.enqueueAnalyzeProject(submissionId)
        }
        return
      }
      case VERIFICATION_JOB_NAMES.executeTests: {
        const submissionRows = await this.db.db
          .select({ commitSha: projectSubmissions.commitSha, userId: projectSubmissions.userId })
          .from(projectSubmissions)
          .where(eq(projectSubmissions.id, submissionId))
          .limit(1)
        const submission = submissionRows[0]
        if (submission) {
          const ingestionRows = await this.db.db
            .select({ id: repositoryIngestions.id })
            .from(repositoryIngestions)
            .where(eq(repositoryIngestions.commitSha, submission.commitSha))
            .limit(1)
          if (ingestionRows[0]) {
            // Resolve GitHub token so E2B can clone private repos
            const githubToken = await this.github.getActiveToken(submission.userId)
              .then((r) => r.accessToken)
              .catch(() => undefined)
            await this.execution.executeForIngestion(ingestionRows[0].id, githubToken)
          }
        }
        await this.statuses.transition({ submissionId, toStatus: 'analyzing', reason: 'ingestion_complete' })
        await this.queue.enqueueAnalyzeProject(submissionId)
        return
      }
      case VERIFICATION_JOB_NAMES.analyzeProject: {
        const analysis = await this.analysis.analyzeSubmission(submissionId)
        await this.statuses.transition({ submissionId, toStatus: 'generating_report', reason: 'analysis_complete' })
        await this.queue.enqueueGenerateReport(submissionId, analysis.id)
        return analysis
      }
      case VERIFICATION_JOB_NAMES.generateReport: {
        // analysisId is passed from the analyzeProject job to avoid re-running analysis
        const analysisId = job.data.analysisId ?? (await this.analysis.analyzeSubmission(submissionId)).id
        const report = await this.reports.generateForSubmission(submissionId, analysisId)
        await this.statuses.transition({
          submissionId,
          toStatus: report.verdict === 'verified' ? 'verified' : 'insufficient',
          reason: 'report_generated',
          metadata: { reportId: report.id, verdict: report.verdict },
        })
        await this.queue.enqueueAwardSkills(submissionId)
        await this.queue.enqueueSendReportEmail(submissionId)

        // If enrichment fell back (AI unavailable), schedule re-enrichment
        if (
          report.publicSummary === FALLBACK_SUMMARY_VERIFIED ||
          report.publicSummary === FALLBACK_SUMMARY_INSUFFICIENT
        ) {
          await this.queue.enqueueReEnrichReport(report.id)
        }
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
    const reportUrl = `${webBaseUrl}/reports/${submissionId}`

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
    const isPipelineJob =
      job.name === VERIFICATION_JOB_NAMES.ingestRepo
      || job.name === VERIFICATION_JOB_NAMES.executeTests
      || job.name === VERIFICATION_JOB_NAMES.analyzeProject
      || job.name === VERIFICATION_JOB_NAMES.generateReport

    if (!job.data.submissionId || !isPipelineJob) {
      return
    }

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
        failureReason: error.message,
        metadata: { jobName: job.name, attemptsMade: job.attemptsMade },
      })
    } catch (transitionError) {
      this.logger.error('failed to mark final job failure', {
        submissionId: job.data.submissionId,
        jobName: job.name,
        message: transitionError instanceof Error ? transitionError.message : String(transitionError),
      })
      return
    }

    try {
      await this.sendSubmissionFailedEmail(job.data.submissionId, job.name, error.message)
    } catch (notificationError) {
      this.logger.error('failed to send final job failure notification', {
        submissionId: job.data.submissionId,
        jobName: job.name,
        message: notificationError instanceof Error ? notificationError.message : String(notificationError),
      })
    }
  }

  private async sendSubmissionFailedEmail(
    submissionId: string,
    failureStage: string,
    failureReason: string,
  ): Promise<void> {
    const rows = await this.db.db
      .select({
        email: users.email,
        username: users.username,
        repositoryName: projectSubmissions.githubRepoFullName,
        challengeTitle: projectChallenges.title,
      })
      .from(projectSubmissions)
      .innerJoin(users, eq(users.id, projectSubmissions.userId))
      .innerJoin(projectChallenges, eq(projectChallenges.id, projectSubmissions.challengeId))
      .where(eq(projectSubmissions.id, submissionId))
      .limit(1)

    const details = rows[0]
    if (!details?.email) return

    const webBaseUrl = this.config.get<string>('webBaseUrl') ?? 'https://praxisdev.vercel.app'
    await this.notifications.sendSubmissionFailed({
      toEmail: details.email,
      username: details.username ?? details.email.split('@')[0],
      repositoryName: details.repositoryName,
      challengeTitle: details.challengeTitle,
      failureStage,
      failureReason: failureReason.slice(0, 500),
      submissionUrl: `${webBaseUrl}/submissions/${submissionId}`,
    })
  }
}
