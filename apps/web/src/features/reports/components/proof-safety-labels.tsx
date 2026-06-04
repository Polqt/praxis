import { IconShieldCheck, IconInfoCircle } from '@tabler/icons-react'
import type { ReportStatus } from '../types'

type Props = {
  status: ReportStatus
}

export function ProofSafetyLabels({ status }: Props) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-sm border bg-background px-2.5 py-1 text-xs text-foreground">
        <IconShieldCheck size={13} />
        {status === 'verified' ? 'Verified' : status === 'insufficient' ? 'Insufficient' : 'Failed'}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-sm border bg-background px-2.5 py-1 text-xs text-muted-foreground">
        <IconInfoCircle size={13} />
        Generated from repository evidence
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-sm border bg-background px-2.5 py-1 text-xs text-muted-foreground">
        <IconInfoCircle size={13} />
        Not a replacement for human review
      </span>
    </div>
  )
}
