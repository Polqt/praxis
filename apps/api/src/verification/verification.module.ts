import { Module } from '@nestjs/common'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'
import { SandboxService } from './sandbox.service'
import { AgentService } from './agent.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [VerificationController],
  providers: [VerificationService, SandboxService, AgentService],
})
export class VerificationModule {}
