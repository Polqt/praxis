import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ChallengesModule } from '../challenges/challenges.module'
import { DatabaseModule } from '../database/database.module'
import { GitHubModule } from '../github/github.module'
import { UsersModule } from '../users/users.module'
import { QueueModule } from '../verification/queue/queue.module'
import { SubmissionsController } from './submissions.controller'
import { SubmissionStatusService } from './submission-status.service'
import { SubmissionsService } from './submissions.service'
import { StaleSubmissionService } from './stale-submission.service'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, ChallengesModule, GitHubModule, QueueModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionStatusService, StaleSubmissionService],
  exports: [SubmissionsService, SubmissionStatusService, StaleSubmissionService],
})
export class SubmissionsModule {}
