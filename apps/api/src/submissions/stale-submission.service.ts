import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq, inArray, lt, notInArray } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { projectChallenges, projectSubmissionEvents, projectSubmissions, users } from '../database/schema'
import { NotificationsService } from '../notifications/notifications.service'
import type { SubmissionStatus } from '@praxis/shared'

const SKIP_EXPIRY_STATUSES: SubmissionStatus[] = [
  'verified',
  'insufficient',
  'failed',
  'expired',
  'cancelled',
  'ingestion_failed',
  'analysis_failed',
  'report_generation_failed',
]

const EXPIRY_FAILURE_REASON = 'Verification expired because it stayed in progress too long'

@Injectable()
export class StaleSubmissionService {
  private readonly logger = new Logger(StaleSubmissionService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async expireStale(): Promise<void> {
    const expiryHours = this.config.get<number>('verificationPipeline.submissionExpiryHours') ?? 6
    const cutoff = new Date(Date.now() - expiryHours * 60 * 60 * 1000)

    const stale = await this.db.db
      .select({ id: projectSubmissions.id, status: projectSubmissions.status })
      .from(projectSubmissions)
      .where(
        and(
          notInArray(projectSubmissions.status, SKIP_EXPIRY_STATUSES),
          lt(projectSubmissions.submittedAt, cutoff),
        ),
      )

    if (stale.length === 0) return

    let expired = 0

    for (const submission of stale) {
      try {
        await this.db.db.transaction(async (tx) => {
          await tx
            .update(projectSubmissions)
            .set({ status: 'expired', failureReason: EXPIRY_FAILURE_REASON })
            .where(inArray(projectSubmissions.id, [submission.id]))

          await tx.insert(projectSubmissionEvents).values({
            submissionId: submission.id,
            fromStatus: submission.status as SubmissionStatus,
            toStatus: 'expired',
            reason: 'submission_expired',
          })
        })
        expired++
        void this.sendExpiryEmail(submission.id)
      } catch (err) {
        this.logger.error('stale-expiry: failed to expire submission', {
          submissionId: submission.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    this.logger.log(`stale-expiry: found ${stale.length} stale, expired ${expired}`)
  }

  private async sendExpiryEmail(submissionId: string): Promise<void> {
    try {
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

      const challengeRows = await this.db.db
        .select({ title: projectChallenges.title })
        .from(projectChallenges)
        .where(eq(projectChallenges.id, submission.challengeId))
        .limit(1)
      const challengeTitle = challengeRows[0]?.title ?? 'Verification Challenge'

      const webBaseUrl = this.config.get<string>('webBaseUrl') ?? 'https://praxisdev.vercel.app'

      await this.notifications.sendSubmissionExpired({
        toEmail: user.email,
        username: user.username ?? user.email.split('@')[0],
        repositoryName: submission.githubRepoFullName,
        challengeTitle,
        resubmitUrl: `${webBaseUrl}/submit?challengeId=${submission.challengeId}`,
      })
    } catch (err) {
      this.logger.error('stale-expiry: failed to send expiry email', {
        submissionId,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}
