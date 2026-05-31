import { Module } from '@nestjs/common'
import { SubmissionsModule } from '../submissions/submissions.module'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  imports: [SubmissionsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
