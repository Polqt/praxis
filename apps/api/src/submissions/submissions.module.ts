import { Module } from '@nestjs/common'
import { ChallengesModule } from '../challenges/challenges.module'
import { DatabaseModule } from '../database/database.module'
import { GitHubModule } from '../github/github.module'
import { SubmissionsController } from './submissions.controller'
import { SubmissionsService } from './submissions.service'

@Module({
  imports: [DatabaseModule, ChallengesModule, GitHubModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
