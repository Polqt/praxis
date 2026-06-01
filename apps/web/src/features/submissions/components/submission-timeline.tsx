import { IconCircleCheck, IconCircle } from '@tabler/icons-react'
import { PIPELINE_STAGES, TERMINAL_STAGE_LABELS, TERMINAL_STATUSES } from '@/features/submissions/constants'
import type { ProjectSubmission, ProjectSubmissionEvent, SubmissionStatus } from '@praxis/shared'

type Props = {
  submission: ProjectSubmission
  events: ProjectSubmissionEvent[]
}

type StepState = 'completed' | 'active' | 'pending'

function getTimestamp(stageIndex: number, events: ProjectSubmissionEvent[]): string | null {
  const stage = PIPELINE_STAGES[stageIndex]
  if (!stage) return null
  if (stage.toStatus === null) return events[0]?.createdAt ?? null
  return events.find((e) => e.toStatus === stage.toStatus)?.createdAt ?? null
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function SubmissionTimeline({ submission, events }: Props) {
  const status = submission.status
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const pipelineStatusIndex = PIPELINE_STAGES.findIndex((s) => s.toStatus === status)
  const terminalLabel = TERMINAL_STAGE_LABELS[status as SubmissionStatus] ?? status

  const allStages = [
    ...PIPELINE_STAGES,
    { key: 'terminal', label: terminalLabel, toStatus: status as SubmissionStatus },
  ]

  function getState(index: number): StepState {
    if (isTerminal) return 'completed'
    if (index === 0) {
      return events.length > 0 ? 'completed' : 'active'
    }
    if (pipelineStatusIndex === -1) return 'pending'
    if (index < pipelineStatusIndex) return 'completed'
    if (index === pipelineStatusIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      {allStages.map((stage, index) => {
        if (stage.key === 'terminal' && !isTerminal) return null

        const state: StepState = stage.key === 'terminal' ? 'completed' : getState(index)

        const ts = state === 'completed'
          ? (stage.key === 'terminal'
            ? (events.find((e) => e.toStatus === status)?.createdAt ?? null)
            : getTimestamp(index, events))
          : null

        return (
          <div key={stage.key} className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground w-28 shrink-0 text-right">
              {ts ? formatTs(ts) : ''}
            </span>

            <div className="shrink-0">
              {state === 'completed' && <IconCircleCheck size={16} className="text-green-600" />}
              {state === 'active' && <span className="block size-3 rounded-full bg-primary animate-pulse" />}
              {state === 'pending' && <IconCircle size={16} className="text-muted-foreground" />}
            </div>

            <span className={[
              'text-sm',
              state === 'active' ? 'font-medium text-foreground' : '',
              state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
            ].join(' ')}>
              {stage.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
