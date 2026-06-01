import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, inArray, lt, notInArray } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { projectSubmissionEvents, projectSubmissions } from '../database/schema'
import type { SubmissionStatus } from '@praxis/shared'

const TERMINAL_STATUSES: SubmissionStatus[] = [
  'verified',
  'insufficient',
  'failed',
  'expired',
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
  ) {}

  async expireStale(): Promise<void> {
    const expiryHours = this.config.get<number>('verificationPipeline.submissionExpiryHours') ?? 6
    const cutoff = new Date(Date.now() - expiryHours * 60 * 60 * 1000)

    const stale = await this.db.db
      .select({ id: projectSubmissions.id, status: projectSubmissions.status })
      .from(projectSubmissions)
      .where(
        and(
          notInArray(projectSubmissions.status, TERMINAL_STATUSES),
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
      } catch (err) {
        this.logger.error('stale-expiry: failed to expire submission', {
          submissionId: submission.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    this.logger.log(`stale-expiry: found ${stale.length} stale, expired ${expired}`)
  }
}
