import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export default function ChallengeNotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Challenge unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Challenge not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This challenge may have been removed or is no longer active.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/challenges">
            <IconArrowLeft size={14} />
            Back to challenges
          </Link>
        </Button>
      </div>
    </div>
  )
}
