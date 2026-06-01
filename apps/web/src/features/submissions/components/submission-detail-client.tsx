'use client'

import { SubmissionMetadataCard } from '@/features/submissions/components/submission-metadata-card'
import { SubmissionTimeline } from '@/features/submissions/components/submission-timeline'
import type { Submission } from '@/features/submissions/types'

type Props = {
  submission: Submission
}

export function SubmissionDetailClient({ submission }: Props) {
  return (
    <div className="px-12 py-10">
      <div className="grid grid-cols-[340px_1fr] gap-8">
        <div className="self-start sticky top-10">
          <SubmissionMetadataCard submission={submission} />
        </div>
        <div>
          <SubmissionTimeline submission={submission} />
        </div>
      </div>
    </div>
  )
}
