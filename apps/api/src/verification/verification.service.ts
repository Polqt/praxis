import { Injectable } from '@nestjs/common'
import { VerifyResponse } from '@praxis/shared'

/**
 * VerificationService is deprecated in v1.
 * Code-execution verification is superseded by project-based AI analysis.
 * This stub keeps the module compilable until VerificationModule is removed from AppModule.
 */
@Injectable()
export class VerificationService {
  async verify(_userId: string, _taskId: string, _code: string): Promise<VerifyResponse> {
    return {
      verified: false,
      feedback: 'Task-based verification is no longer supported.',
      executionOutput: '',
    }
  }
}
