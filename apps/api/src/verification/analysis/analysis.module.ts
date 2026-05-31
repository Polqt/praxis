import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { RepositoryAnalysisService } from './repository-analysis.service'

@Module({
  imports: [DatabaseModule],
  providers: [RepositoryAnalysisService],
  exports: [RepositoryAnalysisService],
})
export class AnalysisModule {}
