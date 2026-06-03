import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../../database/database.module'
import { RepositoryExecutionService } from './repository-execution.service'

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [RepositoryExecutionService],
  exports: [RepositoryExecutionService],
})
export class ExecutionModule {}
