import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
  challengeId?: string
  repositoryName: string
  commitSha?: string
}

export function ResubmitAfterFixesButton({ challengeId, repositoryName, commitSha }: Props) {
  if (!challengeId) return null

  const baseParams = new URLSearchParams({
    challengeId,
    repo: `https://github.com/${repositoryName}`,
  })
  const commitParams = new URLSearchParams(baseParams)
  if (commitSha) commitParams.set('commit', commitSha)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <Link href={`/submit?${baseParams.toString()}`}>Resubmit latest commit</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={`/submit?${commitParams.toString()}`}>Choose another commit</Link>
      </Button>
      <Button asChild size="sm" variant="ghost">
        <Link href="#next-best-fixes">Show recommended fixes first</Link>
      </Button>
    </div>
  )
}
