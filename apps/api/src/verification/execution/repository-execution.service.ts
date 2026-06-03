import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { Sandbox } from '@e2b/code-interpreter'
import { DatabaseService } from '../../database/database.service'
import { repositoryExecutions, repositoryIngestions } from '../../database/schema'
import type { RepositoryIngestionData } from '../ingestion/repository-ingestion.types'

export interface ExecutionResult {
  language: string
  testCommand: string
  exitCode: number
  passed: number
  failed: number
  skipped: number
  durationMs: number | null
  stdout: string
  stderr: string
  timedOut: boolean
}

interface DetectedRuntime {
  language: string
  testCommand: string
  installCommand: string | null
}

const EXECUTION_TIMEOUT_MS = 120_000

function detectRuntime(ingestionData: RepositoryIngestionData): DetectedRuntime | null {
  const filePaths = ingestionData.files.map((f) => f.path)

  const hasFile = (name: string) =>
    filePaths.some((p) => p === name || p.endsWith(`/${name}`))

  if (hasFile('package.json')) {
    const manifest = ingestionData.files.find(
      (f) => f.path === 'package.json' || f.path.endsWith('/package.json'),
    )
    let testScript = 'test'
    if (manifest?.content) {
      try {
        const pkg = JSON.parse(manifest.content) as { scripts?: Record<string, string> }
        if (pkg.scripts?.test && !pkg.scripts.test.includes('no test specified')) {
          testScript = 'test'
        }
      } catch {
        // use default
      }
    }
    return {
      language: 'javascript',
      testCommand: `npm run ${testScript} -- --passWithNoTests 2>&1 || true`,
      installCommand: 'npm install --prefer-offline 2>&1',
    }
  }

  if (hasFile('requirements.txt') || hasFile('pyproject.toml') || hasFile('setup.py')) {
    const installCmd = hasFile('requirements.txt')
      ? 'pip install -r requirements.txt -q 2>&1'
      : 'pip install -e . -q 2>&1'
    return {
      language: 'python',
      testCommand: 'python -m pytest --tb=no -q 2>&1 || true',
      installCommand: installCmd,
    }
  }

  if (hasFile('go.mod')) {
    return {
      language: 'go',
      testCommand: 'go test ./... 2>&1 || true',
      installCommand: null,
    }
  }

  if (hasFile('Cargo.toml')) {
    return {
      language: 'rust',
      testCommand: 'cargo test 2>&1 || true',
      installCommand: null,
    }
  }

  return null
}

function parseTestOutput(stdout: string, language: string): { passed: number; failed: number; skipped: number } {
  let passed = 0
  let failed = 0
  let skipped = 0

  if (language === 'javascript') {
    // Jest: "Tests: 3 passed, 1 failed, 4 total" or "Tests: 5 passed, 5 total"
    const jestMatch = stdout.match(/Tests:\s+(?:(\d+)\s+failed,\s+)?(?:(\d+)\s+skipped,\s+)?(?:(\d+)\s+passed)/i)
    if (jestMatch) {
      failed = parseInt(jestMatch[1] ?? '0', 10)
      skipped = parseInt(jestMatch[2] ?? '0', 10)
      passed = parseInt(jestMatch[3] ?? '0', 10)
      return { passed, failed, skipped }
    }
    // Vitest / Mocha: "passing (123ms)" / "failing"
    const passMatch = stdout.match(/(\d+)\s+passing/i)
    const failMatch = stdout.match(/(\d+)\s+failing/i)
    const pendingMatch = stdout.match(/(\d+)\s+pending/i)
    if (passMatch) passed = parseInt(passMatch[1], 10)
    if (failMatch) failed = parseInt(failMatch[1], 10)
    if (pendingMatch) skipped = parseInt(pendingMatch[1], 10)
  }

  if (language === 'python') {
    // pytest: "5 passed, 1 failed, 2 skipped"
    const pytestMatch = stdout.match(/(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+(?:skipped|warning))?/)
    if (pytestMatch) {
      passed = parseInt(pytestMatch[1] ?? '0', 10)
      failed = parseInt(pytestMatch[2] ?? '0', 10)
      skipped = parseInt(pytestMatch[3] ?? '0', 10)
    }
  }

  if (language === 'go') {
    // go test: "ok package 0.123s" / "FAIL package 0.123s"
    const okLines = (stdout.match(/^ok\s+/gm) ?? []).length
    const failLines = (stdout.match(/^FAIL\s+/gm) ?? []).length
    passed = okLines
    failed = failLines
  }

  if (language === 'rust') {
    // cargo test: "test result: ok. 5 passed; 1 failed; 0 ignored"
    const cargoMatch = stdout.match(/test result:.*?(\d+)\s+passed;\s+(\d+)\s+failed;\s+(\d+)\s+ignored/i)
    if (cargoMatch) {
      passed = parseInt(cargoMatch[1], 10)
      failed = parseInt(cargoMatch[2], 10)
      skipped = parseInt(cargoMatch[3], 10)
    }
  }

  return { passed, failed, skipped }
}

@Injectable()
export class RepositoryExecutionService {
  private readonly logger = new Logger(RepositoryExecutionService.name)
  private readonly apiKey: string | null

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('e2b.apiKey') ?? null
    if (!this.apiKey) {
      this.logger.warn('E2B_API_KEY not set — test execution disabled')
    }
  }

  get enabled(): boolean {
    return this.apiKey !== null
  }

  async executeForIngestion(ingestionId: string): Promise<ExecutionResult | null> {
    if (!this.apiKey) return null

    // Return cached result if already executed for this ingestion
    const existing = await this.db.db
      .select()
      .from(repositoryExecutions)
      .where(eq(repositoryExecutions.repositoryIngestionId, ingestionId))
      .limit(1)

    if (existing[0]) {
      this.logger.log(`E2B: cache hit for ingestion ${ingestionId}`)
      return {
        language: existing[0].language,
        testCommand: existing[0].testCommand,
        exitCode: existing[0].exitCode,
        passed: existing[0].passed,
        failed: existing[0].failed,
        skipped: existing[0].skipped,
        durationMs: existing[0].durationMs,
        stdout: existing[0].stdout ?? '',
        stderr: existing[0].stderr ?? '',
        timedOut: existing[0].timedOut,
      }
    }

    const ingestionRows = await this.db.db
      .select()
      .from(repositoryIngestions)
      .where(eq(repositoryIngestions.id, ingestionId))
      .limit(1)

    const ingestion = ingestionRows[0]
    if (!ingestion) return null

    const ingestionData = ingestion.ingestedData as RepositoryIngestionData
    const runtime = detectRuntime(ingestionData)

    if (!runtime) {
      this.logger.log(`E2B: no supported runtime detected for ${ingestion.repoFullName}`)
      return null
    }

    try {
      return await this.runInSandbox(ingestionId, ingestion.repoFullName, runtime)
    } catch (err) {
      this.logger.error(`E2B: sandbox execution failed for ${ingestion.repoFullName}`, {
        error: err instanceof Error ? err.message : String(err),
      })
      return null
    }
  }

  private async runInSandbox(
    ingestionId: string,
    repoFullName: string,
    runtime: DetectedRuntime,
  ): Promise<ExecutionResult> {
    const [owner, repo] = repoFullName.split('/')
    const sandbox = await Sandbox.create({ apiKey: this.apiKey!, timeoutMs: EXECUTION_TIMEOUT_MS })

    this.logger.log(`E2B: sandbox created for ${repoFullName} (${runtime.language})`)
    const start = Date.now()

    try {
      // Clone repo (shallow, no auth — only public repos supported)
      await sandbox.runCode(`
import subprocess
result = subprocess.run(
  ['git', 'clone', '--depth', '1', 'https://github.com/${owner}/${repo}.git', '/repo'],
  capture_output=True, text=True, timeout=60
)
print(result.stdout)
print(result.stderr)
`)

      // Install dependencies if needed
      if (runtime.installCommand) {
        await sandbox.runCode(`
import subprocess
result = subprocess.run(
  ${JSON.stringify(runtime.installCommand)},
  shell=True, capture_output=True, text=True, cwd='/repo', timeout=90
)
print(result.stdout[-3000:] if result.stdout else '')
print(result.stderr[-1000:] if result.stderr else '')
`)
      }

      // Run tests
      const testResult = await sandbox.runCode(`
import subprocess, time
start = time.time()
result = subprocess.run(
  ${JSON.stringify(runtime.testCommand)},
  shell=True, capture_output=True, text=True, cwd='/repo', timeout=60
)
elapsed = int((time.time() - start) * 1000)
print('EXIT_CODE:' + str(result.returncode))
print('DURATION_MS:' + str(elapsed))
print('STDOUT_START')
print(result.stdout[-5000:] if result.stdout else '')
print('STDOUT_END')
print('STDERR_START')
print(result.stderr[-2000:] if result.stderr else '')
print('STDERR_END')
`)

      const output = testResult.logs.stdout.join('\n')
      const exitCodeMatch = output.match(/EXIT_CODE:(\d+)/)
      const durationMatch = output.match(/DURATION_MS:(\d+)/)
      const stdoutMatch = output.match(/STDOUT_START\n([\s\S]*?)\nSTDOUT_END/)
      const stderrMatch = output.match(/STDERR_START\n([\s\S]*?)\nSTDERR_END/)

      const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : 1
      const durationMs = durationMatch ? parseInt(durationMatch[1], 10) : (Date.now() - start)
      const stdout = stdoutMatch?.[1] ?? ''
      const stderr = stderrMatch?.[1] ?? ''

      const { passed, failed, skipped } = parseTestOutput(stdout, runtime.language)

      const result: ExecutionResult = {
        language: runtime.language,
        testCommand: runtime.testCommand,
        exitCode,
        passed,
        failed,
        skipped,
        durationMs,
        stdout: stdout.slice(0, 5000),
        stderr: stderr.slice(0, 2000),
        timedOut: false,
      }

      await this.db.db.insert(repositoryExecutions).values({
        repositoryIngestionId: ingestionId,
        ...result,
      })

      this.logger.log(`E2B: ${repoFullName} — ${passed} passed, ${failed} failed in ${durationMs}ms`)
      return result

    } finally {
      await sandbox.kill()
    }
  }
}
