import { EXECUTION_LOG_CAPS } from './execution.constants'

const TOKEN_PATTERNS = [
  /x-access-token:[^@\s]+@/gi,
  /(gh[pousr]_[A-Za-z0-9_]+)/g,
  /(github_pat_[A-Za-z0-9_]+)/g,
  /(Bearer\s+)[A-Za-z0-9._-]+/gi,
]

export function redactSecrets(value: string, explicitSecrets: string[] = []): string {
  let output = value
  for (const secret of explicitSecrets.filter(Boolean)) {
    output = output.split(secret).join('<redacted>')
  }
  for (const pattern of TOKEN_PATTERNS) {
    output = output.replace(pattern, (match, prefix) => {
      if (typeof prefix === 'string' && prefix.toLowerCase().startsWith('bearer')) return `${prefix}<redacted>`
      return match.includes('x-access-token:') ? 'x-access-token:<redacted>@' : '<redacted>'
    })
  }
  return output
}

export function capLog(value: string, cap: number): string {
  if (value.length <= cap) return value
  return value.slice(0, cap)
}

export function sanitizeLog(value: string, cap: number, secrets: string[] = []): string {
  return capLog(redactSecrets(value, secrets), cap)
}

export function sanitizeCommandLabel(command: string): string {
  return capLog(redactSecrets(command), EXECUTION_LOG_CAPS.command)
}
