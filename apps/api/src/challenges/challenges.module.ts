import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { UsersModule } from '../users/users.module'
import { ChallengesController } from './challenges.controller'
import { ChallengesService } from './challenges.service'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
