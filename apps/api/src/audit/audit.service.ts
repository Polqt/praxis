import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { auditLogs } from '../database/schema'

export type AuditEventType =
  | 'github_sync_completed'
  | 'github_account_disconnected'
  | 'submission_created'
  | 'submission_status_changed'
  | 'report_generated'
  | 'report_published'
  | 'report_unpublished'
  | 'report_feedback_submitted'
  | 'submission_cancelled'
  | 'submission_requeued'
  | 'submission_retried'

type AuditContext = {
  ipAddress?: string
  userAgent?: string
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly db: DatabaseService) {}

  log(
    userId: string | null,
    eventType: AuditEventType,
    metadata?: Record<string, unknown>,
    context?: AuditContext,
  ): void {
    this.db.db
      .insert(auditLogs)
      .values({
        userId,
        eventType,
        metadata: metadata ?? null,
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
      })
      .catch((err: unknown) => {
        this.logger.error('audit log insert failed', { eventType, userId, err })
      })
  }
}
