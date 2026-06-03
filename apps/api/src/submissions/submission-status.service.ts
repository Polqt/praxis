import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { SubmissionStatus } from '@praxis/shared'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { projectSubmissionEvents, projectSubmissions } from '../database/schema'
import { AuditService } from '../audit/audit.service'
import { canTransition } from './submission-status.rules'

interface TransitionInput {
  submissionId: string
  toStatus: SubmissionStatus
  reason: string
  metadata?: Record<string, unknown>
  failureReason?: string | null
}

@Injectable()
export class SubmissionStatusService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async transition(input: TransitionInput) {
    const rows = await this.db.db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, input.submissionId))
      .limit(1)

    const submission = rows[0]
    if (!submission) throw new NotFoundException('Submission not found')

    const fromStatus = submission.status
    if (!canTransition(fromStatus, input.toStatus)) {
      throw new BadRequestException(`Cannot transition submission from ${fromStatus} to ${input.toStatus}`)
    }

    if (fromStatus === input.toStatus) return submission

    const now = new Date()
    const updates: Partial<typeof projectSubmissions.$inferInsert> = {
      status: input.toStatus,
      failureReason: input.failureReason ?? submission.failureReason,
    }

    if (input.toStatus === 'analyzing') updates.ingestedAt = now
    if (input.toStatus === 'generating_report') updates.analyzedAt = now
    if (['verified', 'insufficient', 'failed', 'expired', 'cancelled'].includes(input.toStatus)) updates.completedAt = now

    const updated = await this.db.db
      .update(projectSubmissions)
      .set(updates)
      .where(eq(projectSubmissions.id, input.submissionId))
      .returning()

    await this.db.db.insert(projectSubmissionEvents).values({
      submissionId: input.submissionId,
      fromStatus,
      toStatus: input.toStatus,
      reason: input.reason,
      metadata: input.metadata ?? null,
    })

    this.audit.log(submission.userId, 'submission_status_changed', {
      submissionId: input.submissionId,
      fromStatus,
      toStatus: input.toStatus,
    })

    return updated[0]
  }
}
