import { serverApiFetch } from '@/lib/api.server'
import { SubmissionsClient } from '@/features/submissions/components/submissions-client'
import type { ProjectSubmission } from '@praxis/shared'

export default async function SubmissionsPage() {
  const submissions = await serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => [])
  return <SubmissionsClient submissions={submissions} />
}
