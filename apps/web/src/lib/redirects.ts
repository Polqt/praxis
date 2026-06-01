export function safeInternalPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/studio'
  return value
}
