export function formatLeaderboardDate(value: string | null): string | null {
  if (!value) return null

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}
