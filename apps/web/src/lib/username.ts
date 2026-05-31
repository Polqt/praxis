export const USERNAME_RE = /^[a-z0-9_-]{3,24}$/

export function validateUsername(value: string): string | null {
  if (!value) return null
  if (value.length < 3) return 'At least 3 characters'
  if (value.length > 24) return 'Max 24 characters'
  if (!/^[a-z0-9_-]+$/.test(value)) return 'Only lowercase letters, numbers, - and _'
  return null
}
