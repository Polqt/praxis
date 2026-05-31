import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ProofController } from './proof.controller'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController, ProofController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
