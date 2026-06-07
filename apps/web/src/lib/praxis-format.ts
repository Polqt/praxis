import { TERMINAL_STATUSES } from '@/features/submissions/constants'
import type { ProjectSubmission, SubmissionStatus } from '@praxis/shared'

export function statusLabel(status: SubmissionStatus) {
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function shortSha(sha: string) {
  return sha.slice(0, 7)
}

export function repoName(fullName: string) {
  return fullName.split('/').at(-1) ?? fullName
}

export function githubRepoUrl(fullName: string) {
  return `https://github.com/${fullName}`
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isTerminalSubmission(submission: ProjectSubmission) {
  return TERMINAL_STATUSES.includes(submission.status)
}
