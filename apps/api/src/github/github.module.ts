import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { GitHubApiService } from './github-api.service'
import { GitHubController } from './github.controller'
import { GitHubService } from './github.service'

@Module({
  imports: [DatabaseModule],
  controllers: [GitHubController],
  providers: [GitHubApiService, GitHubService],
  exports: [GitHubApiService, GitHubService],
})
export class GitHubModule {}
