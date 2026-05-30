import Link from 'next/link'
import type { TaskWithStatus } from '@praxis/shared'
import { StatusPill } from './StatusPill'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function TaskCard({ task }: { task: TaskWithStatus }) {
  return (
    <Link href={`/task/${task.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-base text-foreground">{task.title}</h3>
            <StatusPill status={task.status} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{task.language.toUpperCase()}</Badge>
            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
