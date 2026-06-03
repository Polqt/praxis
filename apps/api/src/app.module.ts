import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import configuration from './config/configuration'

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_JWKS_URL',
  'GITHUB_TOKEN_ENCRYPTION_KEY',
  'REDIS_URL',
  'CORS_ORIGIN',
  'ANTHROPIC_API_KEY',
] as const

function validateEnv(env: Record<string, unknown>) {
  const missing = REQUIRED_ENV_VARS.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  return env
}
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { GitHubModule } from './github/github.module'
import { ChallengesModule } from './challenges/challenges.module'
import { SubmissionsModule } from './submissions/submissions.module'
import { ReportsModule } from './reports/reports.module'
import { HealthModule } from './health/health.module'
import { AuditModule } from './audit/audit.module'
import { QueueModule } from './verification/queue/queue.module'
import { AnalysisModule } from './verification/analysis/analysis.module'
import { ExecutionModule } from './verification/execution/execution.module'
import { IngestionModule } from './verification/ingestion/ingestion.module'
import { VerificationWorker } from './verification/worker/verification.worker'
import { WorkerHealthService } from './verification/worker/worker-health.service'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 60_000, limit: 200 },
    ]),
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    GitHubModule,
    ChallengesModule,
    SubmissionsModule,
    ReportsModule,
    HealthModule,
    QueueModule,
    AnalysisModule,
    ExecutionModule,
    IngestionModule,
    NotificationsModule,
  ],
  providers: [
    VerificationWorker,
    WorkerHealthService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
