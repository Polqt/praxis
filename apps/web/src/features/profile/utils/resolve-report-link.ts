import type { ProfileReport } from '@/features/profile/types'
import type { User } from '@praxis/shared'

// Priority order:
// 1. publicToken present → /proof/:publicToken (works for all viewers)
// 2. viewer is the profile owner → /reports/:submissionId (owner-only private route)
// 3. neither → null (button not rendered)
export function resolveReportLink(
  report: ProfileReport,
  profileUsername: string,
  viewingUser: User | null,
): string | null {
  if (report.publicToken) return `/proof/${report.publicToken}`
  if (viewingUser?.username === profileUsername) return `/reports/${report.submissionId}`
  return null
}
