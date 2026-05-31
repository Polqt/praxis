import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../database/database.module'
import { GitHubModule } from '../github/github.module'
import { RepositoryIngestionService } from './repository-ingestion.service'

@Module({
  imports: [ConfigModule, DatabaseModule, GitHubModule],
  providers: [RepositoryIngestionService],
  exports: [RepositoryIngestionService],
})
export class IngestionModule {}
