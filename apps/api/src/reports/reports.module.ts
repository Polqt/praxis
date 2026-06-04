import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { ProofController } from './proof.controller'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'
import { ReportEnrichmentService } from './report-enrichment.service'
import { AiEvidenceReviewService } from './ai-evidence-review.service'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  controllers: [ReportsController, ProofController],
  providers: [ReportsService, ReportEnrichmentService, AiEvidenceReviewService],
  exports: [ReportsService],
})
export class ReportsModule {}
