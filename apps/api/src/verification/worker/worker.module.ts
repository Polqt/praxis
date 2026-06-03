import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '../../config/configuration'
import { AnalysisModule } from '../analysis/analysis.module'
import { ExecutionModule } from '../execution/execution.module'
import { IngestionModule } from '../ingestion/ingestion.module'
import { QueueModule } from '../queue/queue.module'
import { ReportsModule } from '../../reports/reports.module'
import { SubmissionsModule } from '../../submissions/submissions.module'
import { AuditModule } from '../../audit/audit.module'
import { NotificationsModule } from '../../notifications/notifications.module'
import { VerificationWorker } from './verification.worker'
import { WorkerHealthService } from './worker-health.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    AuditModule,
    AnalysisModule,
    ExecutionModule,
    IngestionModule,
    QueueModule,
    ReportsModule,
    SubmissionsModule,
    NotificationsModule,
  ],
  providers: [VerificationWorker, WorkerHealthService],
})
export class WorkerModule {}
