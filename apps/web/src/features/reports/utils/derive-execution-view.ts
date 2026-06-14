import {
  EXECUTION_STDERR_CAP,
  EXECUTION_STDOUT_CAP,
} from '@/features/reports/constants'
import type {
  CommandResult,
  ExecutionOutput,
} from '@/features/reports/types'

export interface ExecutionView {
  displayedPhases: CommandResult[]
  hasResults: boolean
  noTests: boolean
  installFailed: boolean
  buildFailed: boolean
  stdout: string
  stderr: string
  hasOutput: boolean
  stdoutTruncated: boolean
  stderrTruncated: boolean
  statusClassName: string
  durationLabel: string | null
}

export function deriveExecutionView(execution: ExecutionOutput): ExecutionView {
  const phaseResults = [
    execution.installResult,
    execution.testResult,
    execution.buildResult,
    execution.lintResult,
    execution.typecheckResult,
    execution.doctorResult,
  ].filter((result): result is CommandResult => Boolean(result))

  const hasResults =
    execution.passed > 0 || execution.failed > 0 || execution.timedOut
  const noTests = !hasResults && !execution.timedOut
  const installFailed =
    noTests &&
    execution.installResult != null &&
    execution.installResult.exitCode !== 0
  const buildFailed =
    noTests &&
    !installFailed &&
    execution.buildResult != null &&
    execution.buildResult.exitCode !== 0
  const stdout = execution.stdout?.trim() ?? ''
  const stderr = execution.stderr?.trim() ?? ''

  return {
    displayedPhases:
      phaseResults.length > 0 ? phaseResults : (execution.commandSummary ?? []),
    hasResults,
    noTests,
    installFailed,
    buildFailed,
    stdout,
    stderr,
    hasOutput: Boolean(stdout || stderr),
    stdoutTruncated: (execution.stdout?.length ?? 0) > EXECUTION_STDOUT_CAP,
    stderrTruncated: (execution.stderr?.length ?? 0) > EXECUTION_STDERR_CAP,
    statusClassName:
      execution.timedOut || execution.exitCode !== 0
        ? 'text-destructive'
        : 'text-green-600',
    durationLabel: execution.durationMs
      ? `${(execution.durationMs / 1000).toFixed(1)}s`
      : null,
  }
}
