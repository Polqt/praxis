import { Badge } from '@/components/ui/badge'

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'FAILED'

const config: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING:     { label: 'Pending',     variant: 'outline' },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
  VERIFIED:    { label: 'Verified ✓',  variant: 'default' },
  FAILED:      { label: 'Failed',      variant: 'destructive' },
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
