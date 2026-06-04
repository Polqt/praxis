import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
  challengeId?: string
  repositoryName: string
  commitSha?: string
}

export function ResubmitAfterFixesButton({ challengeId, repositoryName, commitSha }: Props) {
  if (!challengeId) return null

  const params = new URLSearchParams({
    challengeId,
    repo: `https://github.com/${repositoryName}`,
  })
  if (commitSha) params.set('commit', commitSha)

  return (
    <Button asChild size="sm">
      <Link href={`/submit?${params.toString()}`}>Resubmit after fixes</Link>
    </Button>
  )
}
