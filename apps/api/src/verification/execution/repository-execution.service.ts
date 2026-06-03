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

// Total sandbox lifetime budget
const SANDBOX_TIMEOUT_MS = 180_000
// Per-phase budgets (seconds, passed to Python subprocess timeout arg)
const INSTALL_TIMEOUT_S = 90
const TEST_TIMEOUT_S = 60

function detectRuntime(ingestionData: RepositoryIngestionData): DetectedRuntime | null {
  const filePaths = ingestionData.files.map((f) => f.path)

  const hasFile = (name: string) =>
    filePaths.some((p) => p === name || p.endsWith(`/${name}`))

  if (hasFile('package.json')) {
    const manifest = ingestionData.files.find(
      (f) => f.path === 'package.json' || f.path.endsWith('/package.json'),
    )

    let testCommand = 'npm test -- --passWithNoTests 2>&1 || true'

    if (manifest?.content) {
      try {
        const pkg = JSON.parse(manifest.content) as {
          scripts?: Record<string, string>
          devDependencies?: Record<string, string>
          dependencies?: Record<string, string>
        }
        const testScript = pkg.scripts?.test ?? ''
        const hasNoTestScript = !testScript || testScript.includes('no test specified') || testScript.includes('echo')

        if (hasNoTestScript) {
          // No test script defined — probe for common frameworks installed as dev deps
          const allDeps = { ...pkg.devDependencies, ...pkg.dependencies }
          if (allDeps['vitest']) {
            testCommand = 'npx vitest run --passWithNoTests 2>&1 || true'
          } else if (allDeps['jest'] || allDeps['ts-jest'] || allDeps['babel-jest']) {
            testCommand = 'npx jest --passWithNoTests 2>&1 || true'
          } else if (allDeps['mocha']) {
            testCommand = 'npx mocha 2>&1 || true'
          } else if (allDeps['bun']) {
            testCommand = 'bun test 2>&1 || true'
          }
          // else: fall through to the default npm test which will fail gracefully
        }
      } catch {
        // malformed package.json — use default
      }
    }

    return {
      language: 'javascript',
      testCommand,
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

interface ParsedCounts { passed: number; failed: number; skipped: number }

function parseTestOutput(stdout: string, language: string, exitCode: number): ParsedCounts {
  let passed = 0
  let failed = 0
  let skipped = 0
  let parsed = false

  if (language === 'javascript') {
    if (/Tests:/i.test(stdout)) {
      const passedMatch = stdout.match(/(\d+)\s+passed/i)
      const failedMatch = stdout.match(/(\d+)\s+failed/i)
      const skippedMatch = stdout.match(/(\d+)\s+(?:skipped|todo)/i)
      if (passedMatch || failedMatch) {
        passed = passedMatch ? parseInt(passedMatch[1], 10) : 0
        failed = failedMatch ? parseInt(failedMatch[1], 10) : 0
        skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0
        parsed = true
      }
    }
    if (!parsed) {
      // Vitest / Mocha: "5 passing (123ms)" / "2 failing"
      const passMatch = stdout.match(/(\d+)\s+passing/i)
      const failMatch = stdout.match(/(\d+)\s+failing/i)
      const pendingMatch = stdout.match(/(\d+)\s+pending/i)
      if (passMatch || failMatch) {
        passed = passMatch ? parseInt(passMatch[1], 10) : 0
        failed = failMatch ? parseInt(failMatch[1], 10) : 0
        skipped = pendingMatch ? parseInt(pendingMatch[1], 10) : 0
        parsed = true
      }
    }
  } else if (language === 'python') {
    const pytestMatch = stdout.match(/(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+(?:skipped|warning))?/)
    if (pytestMatch) {
      passed = parseInt(pytestMatch[1] ?? '0', 10)
      failed = parseInt(pytestMatch[2] ?? '0', 10)
      skipped = parseInt(pytestMatch[3] ?? '0', 10)
      parsed = true
    }
  } else if (language === 'go') {
    const okLines = (stdout.match(/^ok\s+/gm) ?? []).length
    const failLines = (stdout.match(/^FAIL\s+/gm) ?? []).length
    if (okLines > 0 || failLines > 0) {
      passed = okLines
      failed = failLines
      parsed = true
    }
  } else if (language === 'rust') {
    const cargoMatch = stdout.match(/test result:.*?(\d+)\s+passed;\s+(\d+)\s+failed;\s+(\d+)\s+ignored/i)
    if (cargoMatch) {
      passed = parseInt(cargoMatch[1], 10)
      failed = parseInt(cargoMatch[2], 10)
      skipped = parseInt(cargoMatch[3], 10)
      parsed = true
    }
  }

  // Fallback: if the parser produced 0/0 and we have a non-zero exit code, treat as at least 1 failure
  // so the score reflects reality instead of looking like "no tests ran"
  if (!parsed && exitCode !== 0) {
    failed = 1
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

  async executeForIngestion(ingestionId: string, githubToken?: string): Promise<ExecutionResult | null> {
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
      return await this.runInSandbox(ingestionId, ingestion.repoFullName, runtime, githubToken)
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
    githubToken?: string,
  ): Promise<ExecutionResult | null> {
    // Sanitize owner/repo to prevent injection into Python subprocess args
    const parts = repoFullName.split('/')
    const owner = (parts[0] ?? '').replace(/[^a-zA-Z0-9._-]/g, '')
    const repo = (parts[1] ?? '').replace(/[^a-zA-Z0-9._-]/g, '')
    if (!owner || !repo) return null

    // Build clone URL — authenticated for private repos, public fallback
    const cloneUrl = githubToken
      ? `https://x-access-token:${githubToken}@github.com/${owner}/${repo}.git`
      : `https://github.com/${owner}/${repo}.git`

    const start = Date.now()
    let sandbox: Sandbox | null = null

    try {
      sandbox = await Sandbox.create({ apiKey: this.apiKey!, timeoutMs: SANDBOX_TIMEOUT_MS })
      this.logger.log(`E2B: sandbox created for ${repoFullName} (${runtime.language})`)

      const cloneResult = await sandbox.runCode(`
import subprocess
result = subprocess.run(
  ['git', 'clone', '--depth', '1', '${cloneUrl}', '/repo'],
  capture_output=True, text=True, timeout=60
)
print('CLONE_EXIT:' + str(result.returncode))
if result.returncode != 0:
  # Redact any token from error output before logging
  print(result.stderr.replace('${githubToken ?? ''}', '<token>'))
`)
      const cloneOutput = cloneResult.logs.stdout.join('\n')
      const cloneExitMatch = cloneOutput.match(/CLONE_EXIT:(\d+)/)
      if (cloneExitMatch && parseInt(cloneExitMatch[1], 10) !== 0) {
        this.logger.warn(`E2B: clone failed for ${repoFullName} — private/not found`)
        return null
      }

      // Install dependencies with a dedicated time budget
      if (runtime.installCommand) {
        const installCmd = runtime.installCommand
        await sandbox.runCode(`
import subprocess
result = subprocess.run(
  '${installCmd}',
  shell=True, capture_output=True, text=True, cwd='/repo', timeout=${INSTALL_TIMEOUT_S}
)
print(result.stdout[-3000:] if result.stdout else '')
print(result.stderr[-1000:] if result.stderr else '')
`)
      }

      // Run tests with a separate time budget
      const testCmd = runtime.testCommand
      const testResult = await sandbox.runCode(`
import subprocess, time
start = time.time()
result = subprocess.run(
  '${testCmd}',
  shell=True, capture_output=True, text=True, cwd='/repo', timeout=${TEST_TIMEOUT_S}
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

      const { passed, failed, skipped } = parseTestOutput(stdout, runtime.language, exitCode)

      const STDOUT_CAP = 5000
      const STDERR_CAP = 2000

      const result: ExecutionResult = {
        language: runtime.language,
        testCommand: runtime.testCommand,
        exitCode,
        passed,
        failed,
        skipped,
        durationMs,
        // Store at exactly the cap length so the UI can detect truncation by checking length === cap
        stdout: stdout.length > STDOUT_CAP ? stdout.slice(0, STDOUT_CAP) : stdout,
        stderr: stderr.length > STDERR_CAP ? stderr.slice(0, STDERR_CAP) : stderr,
        timedOut: false,
      }

      await this.db.db.insert(repositoryExecutions).values({
        repositoryIngestionId: ingestionId,
        ...result,
      })

      this.logger.log(`E2B: ${repoFullName} — ${passed} passed, ${failed} failed in ${durationMs}ms`)
      return result

    } finally {
      await sandbox?.kill()
    }
  }
}
