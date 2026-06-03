export const COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i

/**
 * Parses a GitHub URL or owner/repo string into "owner/repo" form.
 * Handles trailing slashes and deep paths like /tree/main.
 * Returns null if the input is not a recognizable GitHub repo reference.
 */
export function parseGitHubUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, '')
  try {
    const url = new URL(trimmed)
    if (url.hostname !== 'github.com') return null
    const segments = url.pathname.replace(/^\//, '').split('/').filter(Boolean)
    if (segments.length < 2 || !segments[0] || !segments[1]) return null
    return `${segments[0]}/${segments[1]}`
  } catch {
    const parts = trimmed.split('/')
    if (parts.length === 2 && parts[0] && parts[1]) return trimmed
    return null
  }
}
