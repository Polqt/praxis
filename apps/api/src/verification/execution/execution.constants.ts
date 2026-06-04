export const SANDBOX_TIMEOUT_MS = 180_000
export const INSTALL_TIMEOUT_S = 90
export const COMMAND_TIMEOUT_S = 60

export const EXECUTION_LOG_CAPS = {
  stdout: 5_000,
  stderr: 2_000,
  command: 160,
  publicSummary: 500,
}

export const SAFE_NPM_SCRIPTS = new Set(['test', 'build', 'lint', 'typecheck'])
