import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq } from 'drizzle-orm'
import { Sandbox } from '@e2b/code-interpreter'
import { DatabaseService } from '../../database/database.service'
import { repositoryExecutions, repositoryIngestions } from '../../database/schema'
import type { RepositoryIngestionData } from '../ingestion/repository-ingestion.types'
import { planExecution, type ExecutionPhase, type ExecutionPlan, type PlannedCommand } from './command-planner'
import { COMMAND_TIMEOUT_S, EXECUTION_LOG_CAPS, SANDBOX_TIMEOUT_MS } from './execution.constants'
import { sanitizeCommandLabel, sanitizeLog } from './execution-log.util'

export interface CommandResult {
  phase: ExecutionPhase
  label: string
  exitCode: number
  durationMs: number | null
  stdout: string
  stderr: string
  timedOut: boolean
}

export interface ExecutionResult {
  language: string
  framework: string | null
  testCommand: string
  exitCode: number
  passed: number
  failed: number
  skipped: number
  durationMs: number | null
  stdout: string
  stderr: string
  timedOut: boolean
  publicSummary: string
  commandSummary: { phase: ExecutionPhase; label: string; exitCode: number; timedOut: boolean }[]
  installResult?: CommandResult | null
  testResult?: CommandResult | null
  buildResult?: CommandResult | null
  lintResult?: CommandResult | null
  typecheckResult?: CommandResult | null
  doctorResult?: CommandResult | null
}

interface ParsedCounts { passed: number; failed: number; skipped: number }

function parseTestOutput(stdout: string, language: string, exitCode: number): ParsedCounts {
  let passed = 0
  let failed = 0
  let skipped = 0
  let parsed = false

  if (language === 'javascript' || language === 'typescript') {
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
    const djangoMatch = stdout.match(/Ran\s+(\d+)\s+tests?/i)
    if (!parsed && djangoMatch) {
      passed = parseInt(djangoMatch[1] ?? '0', 10)
      failed = /FAILED|ERRORS?/i.test(stdout) ? 1 : 0
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

  if (!parsed && exitCode !== 0) failed = 1
  return { passed, failed, skipped }
}

function summarize(results: CommandResult[], passed: number, failed: number): string {
  const failedPhases = results.filter((result) => result.exitCode !== 0 || result.timedOut).map((result) => result.phase)
  if (failedPhases.length === 0) {
    return `Sandbox checks completed. ${passed} passed, ${failed} failed.`
  }
  return `Sandbox checks found issues in ${failedPhases.join(', ')}. ${passed} passed, ${failed} failed.`
}

function resultForPhase(results: CommandResult[], phase: ExecutionPhase): CommandResult | null {
  return results.find((result) => result.phase === phase) ?? null
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
      this.logger.warn('E2B_API_KEY not set - test execution disabled')
    }
  }

  get enabled(): boolean {
    return this.apiKey !== null
  }

  private rowToResult(row: typeof repositoryExecutions.$inferSelect): ExecutionResult {
    return {
      language: row.language,
      framework: row.framework,
      testCommand: row.testCommand,
      exitCode: row.exitCode,
      passed: row.passed,
      failed: row.failed,
      skipped: row.skipped,
      durationMs: row.durationMs,
      stdout: row.stdout ?? '',
      stderr: row.stderr ?? '',
      timedOut: row.timedOut,
      publicSummary: row.publicSummary ?? '',
      commandSummary: (row.commandSummary ?? []) as ExecutionResult['commandSummary'],
      installResult: row.installResult as CommandResult | null,
      testResult: row.testResult as CommandResult | null,
      buildResult: row.buildResult as CommandResult | null,
      lintResult: row.lintResult as CommandResult | null,
      typecheckResult: row.typecheckResult as CommandResult | null,
      doctorResult: row.doctorResult as CommandResult | null,
    }
  }

  async executeForIngestion(ingestionId: string, githubToken?: string): Promise<ExecutionResult | null> {
    if (!this.apiKey) return null

    // Primary cache: same ingestion
    const existing = await this.db.db
      .select()
      .from(repositoryExecutions)
      .where(eq(repositoryExecutions.repositoryIngestionId, ingestionId))
      .limit(1)

    if (existing[0]) {
      this.logger.log(`E2B: cache hit for ingestion ${ingestionId}`)
      return this.rowToResult(existing[0])
    }

    const ingestionRows = await this.db.db
      .select()
      .from(repositoryIngestions)
      .where(eq(repositoryIngestions.id, ingestionId))
      .limit(1)

    const ingestion = ingestionRows[0]
    if (!ingestion) return null

    // Cross-ingestion cache: same commitSha + repoFullName from a prior ingestion.
    // This avoids re-running E2B when a user retries a failed submission with the same commit.
    const crossCacheRows = await this.db.db
      .select({ execution: repositoryExecutions })
      .from(repositoryIngestions)
      .innerJoin(repositoryExecutions, eq(repositoryExecutions.repositoryIngestionId, repositoryIngestions.id))
      .where(and(
        eq(repositoryIngestions.commitSha, ingestion.commitSha),
        eq(repositoryIngestions.repoFullName, ingestion.repoFullName),
      ))
      .limit(1)

    if (crossCacheRows[0]) {
      this.logger.log(`E2B: cross-ingestion cache hit for ${ingestion.repoFullName}@${ingestion.commitSha}`)
      return this.rowToResult(crossCacheRows[0].execution)
    }

    const ingestionData = ingestion.ingestedData as RepositoryIngestionData
    const plan = planExecution(ingestionData)

    if (!plan) {
      this.logger.log(`E2B: no supported runtime detected for ${ingestion.repoFullName}`)
      return null
    }

    try {
      return await this.runInSandbox(ingestionId, ingestion.repoFullName, plan, githubToken)
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
    plan: ExecutionPlan,
    githubToken?: string,
  ): Promise<ExecutionResult | null> {
    const parts = repoFullName.split('/')
    const owner = (parts[0] ?? '').replace(/[^a-zA-Z0-9._-]/g, '')
    const repo = (parts[1] ?? '').replace(/[^a-zA-Z0-9._-]/g, '')
    if (!owner || !repo) return null

    const start = Date.now()
    let sandbox: Sandbox | null = null

    try {
      sandbox = await Sandbox.create({ apiKey: this.apiKey!, timeoutMs: SANDBOX_TIMEOUT_MS })
      this.logger.log(`E2B: sandbox created for ${repoFullName} (${plan.framework})`)

      const cloned = await this.cloneRepository(sandbox, owner, repo, githubToken)
      if (!cloned) {
        this.logger.warn(`E2B: clone failed for ${repoFullName} - private/not found`)
        return null
      }

      const results: CommandResult[] = []
      for (const command of plan.commands) {
        results.push(await this.runPlannedCommand(sandbox, command, [githubToken ?? '']))
      }

      const test = resultForPhase(results, 'test')
      const stdout = test?.stdout ?? ''
      const stderr = test?.stderr ?? ''
      const exitCode = test?.exitCode ?? 0
      const durationMs = Date.now() - start
      const { passed, failed, skipped } = test
        ? parseTestOutput(`${stdout}\n${stderr}`, plan.language, exitCode)
        : { passed: 0, failed: 0, skipped: 0 }

      const result: ExecutionResult = {
        language: plan.language,
        framework: plan.framework,
        testCommand: test?.label ?? plan.commands.map((command) => command.label).join(' + '),
        exitCode,
        passed,
        failed,
        skipped,
        durationMs,
        stdout,
        stderr,
        timedOut: results.some((item) => item.timedOut),
        publicSummary: summarize(results, passed, failed),
        commandSummary: results.map((item) => ({
          phase: item.phase,
          label: item.label,
          exitCode: item.exitCode,
          timedOut: item.timedOut,
        })),
        installResult: resultForPhase(results, 'install'),
        testResult: test,
        buildResult: resultForPhase(results, 'build'),
        lintResult: resultForPhase(results, 'lint'),
        typecheckResult: resultForPhase(results, 'typecheck'),
        doctorResult: resultForPhase(results, 'doctor'),
      }

      await this.db.db.insert(repositoryExecutions).values({
        repositoryIngestionId: ingestionId,
        ...result,
      })

      this.logger.log(`E2B: ${repoFullName} - ${passed} passed, ${failed} failed in ${durationMs}ms`)
      return result
    } finally {
      await sandbox?.kill()
    }
  }

  private async cloneRepository(sandbox: Sandbox, owner: string, repo: string, githubToken?: string): Promise<boolean> {
    const tokenArg = JSON.stringify(githubToken ?? '')
    const ownerArg = JSON.stringify(owner)
    const repoArg = JSON.stringify(repo)
    const cloneResult = await sandbox.runCode(`
import os, subprocess
token = ${tokenArg}
owner = ${ownerArg}
repo = ${repoArg}
env = os.environ.copy()
if token:
  env["GIT_ASKPASS"] = "/tmp/git-askpass.sh"
  with open("/tmp/git-askpass.sh", "w") as f:
    f.write("#!/bin/sh\\ncase \\"$1\\" in\\n*Username*) echo x-access-token ;;\\n*Password*) echo \\"" + token + "\\" ;;\\n*) echo ;;\\nesac\\n")
  os.chmod("/tmp/git-askpass.sh", 0o700)
result = subprocess.run(
  ["git", "clone", "--depth", "1", f"https://github.com/{owner}/{repo}.git", "/repo"],
  capture_output=True, text=True, timeout=60, env=env
)
print("CLONE_EXIT:" + str(result.returncode))
`)

    const output = sanitizeLog(cloneResult.logs.stdout.join('\n'), 1_000, [githubToken ?? ''])
    const cloneExitMatch = output.match(/CLONE_EXIT:(\d+)/)
    return Boolean(cloneExitMatch && parseInt(cloneExitMatch[1], 10) === 0)
  }

  private async runPlannedCommand(
    sandbox: Sandbox,
    planned: PlannedCommand,
    secrets: string[],
  ): Promise<CommandResult> {
    const startedAt = Date.now()
    const commandArg = JSON.stringify(planned.command)
    const timeoutArg = COMMAND_TIMEOUT_S
    const result = await sandbox.runCode(`
import subprocess, time
command = ${commandArg}
start = time.time()
try:
  result = subprocess.run(
    command,
    shell=True, capture_output=True, text=True, cwd="/repo", timeout=${timeoutArg}
  )
  timed_out = False
  exit_code = result.returncode
  stdout = result.stdout or ""
  stderr = result.stderr or ""
except subprocess.TimeoutExpired as exc:
  timed_out = True
  exit_code = 124
  stdout = exc.stdout.decode() if isinstance(exc.stdout, bytes) else (exc.stdout or "")
  stderr = exc.stderr.decode() if isinstance(exc.stderr, bytes) else (exc.stderr or "")
elapsed = int((time.time() - start) * 1000)
print("EXIT_CODE:" + str(exit_code))
print("DURATION_MS:" + str(elapsed))
print("TIMED_OUT:" + str(timed_out).lower())
print("STDOUT_START")
print(stdout)
print("STDOUT_END")
print("STDERR_START")
print(stderr)
print("STDERR_END")
`)

    const output = result.logs.stdout.join('\n')
    const exitCodeMatch = output.match(/EXIT_CODE:(\d+)/)
    const durationMatch = output.match(/DURATION_MS:(\d+)/)
    const timedOutMatch = output.match(/TIMED_OUT:(true|false)/)
    const stdoutMatch = output.match(/STDOUT_START\n([\s\S]*?)\nSTDOUT_END/)
    const stderrMatch = output.match(/STDERR_START\n([\s\S]*?)\nSTDERR_END/)

    return {
      phase: planned.phase,
      label: sanitizeCommandLabel(planned.label),
      exitCode: exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : 1,
      durationMs: durationMatch ? parseInt(durationMatch[1], 10) : Date.now() - startedAt,
      stdout: sanitizeLog(stdoutMatch?.[1] ?? '', EXECUTION_LOG_CAPS.stdout, secrets),
      stderr: sanitizeLog(stderrMatch?.[1] ?? '', EXECUTION_LOG_CAPS.stderr, secrets),
      timedOut: timedOutMatch?.[1] === 'true',
    }
  }
}
