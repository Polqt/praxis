import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Sandbox } from '@e2b/code-interpreter'

export interface SandboxResult {
  stdout: string
  stderr: string
  exitCode: number
  allTestsPassed: boolean
}

@Injectable()
export class SandboxService {
  constructor(private config: ConfigService) {}

  async runVerification(userCode: string, testCode: string): Promise<SandboxResult> {
    let sandbox: Sandbox | null = null
    try {
      sandbox = await Sandbox.create({
        apiKey: this.config.get<string>('e2b.apiKey'),
        timeoutMs: 30000,
      })

      await sandbox.files.write('/home/user/solution.py', userCode)
      await sandbox.files.write('/home/user/test_solution.py', testCode)

      const result = await sandbox.commands.run(
        'cd /home/user && python3 test_solution.py',
        { timeoutMs: 25000 },
      )

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        allTestsPassed: result.stdout.includes('ALL_TESTS_PASSED'),
      }
    } finally {
      if (sandbox) await sandbox.kill().catch(() => {})
    }
  }
}
