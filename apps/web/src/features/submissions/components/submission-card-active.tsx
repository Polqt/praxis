'use client'

import { Progress } from '@/components/ui/progress'
import { STATUS_CONFIG, STAGE_PROGRESS, PIPELINE_STAGES } from '@/features/submissions/constants'
import type { Submission, SubmissionStatus } from '@/features/submissions/types'

const STAGE_ORDER: Array<SubmissionStatus | 'created'> = [
  'created',
  'queued',
  'ingesting',
  'analyzing',
  'generating_report',
  'verified',
]

function getStageIndex(status: SubmissionStatus): number {
  return STAGE_ORDER.indexOf(status)
}

type Props = {
  submission: Submission
}

export function SubmissionCardActive({ submission }: Props) {
  const config = STATUS_CONFIG[submission.status]
  const progress = STAGE_PROGRESS[submission.status]
  const currentIndex = getStageIndex(submission.status)

  return (
    <div className="rounded-lg border border-blue-200/60 bg-blue-50/20 dark:bg-blue-950/10 dark:border-blue-900/40">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium font-mono text-sm truncate">{submission.repositoryName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{submission.challengeCategory}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{submission.challengeTitle}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm flex items-center gap-1.5 ${config.className}`}
        >
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse inline-block shrink-0" />
          {config.label}
        </span>
      </div>

      <div className="px-5 pb-4 border-t border-border/40 pt-4">
        <div className="flex items-center gap-3 mb-1">
          <Progress value={progress} className="h-[3px] flex-1" />
          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{progress}%</span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const stageIndex = STAGE_ORDER.indexOf(stage.status)
            const isCompleted = stageIndex < currentIndex
            const isActive = stageIndex === currentIndex
            const isPending = stageIndex > currentIndex

            return (
              <div key={stage.status} className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  {isCompleted && (
                    <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 text-green-500" fill="currentColor">
                      <circle cx="7" cy="7" r="7" />
                      <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                  {isActive && (
                    <span className="size-2.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                  )}
                  {isPending && (
                    <span className="size-2.5 rounded-full border border-muted-foreground/40 inline-block" />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isCompleted ? 'text-foreground font-medium' :
                    isActive ? 'text-blue-600 font-medium' :
                    'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
