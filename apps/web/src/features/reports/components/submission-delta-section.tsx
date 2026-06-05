import Link from 'next/link'
import { IconArrowUpRight, IconGitCompare } from '@tabler/icons-react'
import { SECTION_LABEL_CLASS } from '../constants'
import type { PreviousSubmissionDelta } from '../types'

type Props = {
  delta: PreviousSubmissionDelta | null
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

export function SubmissionDeltaSection({ delta }: Props) {
  if (!delta) return null

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start gap-3">
        <IconGitCompare size={16} className="text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={SECTION_LABEL_CLASS}>Changed since last submission</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Score moved from {delta.previousCompositeScore}/100 to {delta.currentCompositeScore}/100
            <span className={delta.compositeDelta >= 0 ? 'text-green-600' : 'text-destructive'}>
              {' '}({signed(delta.compositeDelta)})
            </span>.
          </p>
        </div>
        <Link
          href={`/reports/${delta.previousSubmissionId}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Previous <IconArrowUpRight size={12} />
        </Link>
      </div>

      {delta.categories.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {delta.categories.map((item) => (
            <div key={item.category} className="rounded-md border bg-muted/30 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.category}</p>
                <span className={item.delta >= 0 ? 'text-xs text-green-600' : 'text-xs text-destructive'}>
                  {signed(item.delta)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.previousScore}/10 to {item.currentScore}/10
              </p>
            </div>
          ))}
        </div>
      )}

      {delta.changedFiles.length > 0 && (
        <div className="mt-4 rounded-md bg-muted/40 px-3 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected files changed
          </p>
          <div className="flex flex-col gap-1">
            {delta.changedFiles.map((file) => (
              <div key={file.path} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 uppercase tracking-widest text-muted-foreground">{file.status}</span>
                <span className="font-mono text-muted-foreground break-all">{file.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
