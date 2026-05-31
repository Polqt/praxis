import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { UsersModule } from '../users/users.module'
import { GitHubApiService } from './github-api.service'
import { GitHubController } from './github.controller'
import { GitHubService } from './github.service'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  controllers: [GitHubController],
  providers: [GitHubApiService, GitHubService],
  exports: [GitHubApiService, GitHubService],
})
export class GitHubModule {}
