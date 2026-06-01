import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { GitHubModule } from './github/github.module'
import { ChallengesModule } from './challenges/challenges.module'
import { SubmissionsModule } from './submissions/submissions.module'
import { ReportsModule } from './reports/reports.module'
import { HealthModule } from './health/health.module'
import { AuditModule } from './audit/audit.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    GitHubModule,
    ChallengesModule,
    SubmissionsModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
