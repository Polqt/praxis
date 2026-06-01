import { serverApiFetch } from '@/lib/api.server'
import { SubmissionsClient } from '@/features/submissions/components/submissions-client'
import type { Submission } from '@/features/submissions/types'

export default async function SubmissionsPage() {
  const submissions = await serverApiFetch<Submission[]>('/submissions').catch(() => [] as Submission[])

  return <SubmissionsClient submissions={submissions} />
}
