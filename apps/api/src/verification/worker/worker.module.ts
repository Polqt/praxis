import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '../../config/configuration'
import { AnalysisModule } from '../analysis/analysis.module'
import { IngestionModule } from '../ingestion/ingestion.module'
import { QueueModule } from '../queue/queue.module'
import { ReportsModule } from '../../reports/reports.module'
import { SubmissionsModule } from '../../submissions/submissions.module'
import { VerificationWorker } from './verification.worker'
import { WorkerHealthService } from './worker-health.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    AnalysisModule,
    IngestionModule,
    QueueModule,
    ReportsModule,
    SubmissionsModule,
  ],
  providers: [VerificationWorker, WorkerHealthService],
})
export class WorkerModule {}
