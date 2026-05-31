import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ChallengesController } from './challenges.controller'
import { ChallengesService } from './challenges.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
