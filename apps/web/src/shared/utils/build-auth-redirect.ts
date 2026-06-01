export function buildAuthRedirect(destination: string): string {
  if (!destination.startsWith('/')) return '/sign-in'
  return `/sign-in?next=${encodeURIComponent(destination)}`
}
