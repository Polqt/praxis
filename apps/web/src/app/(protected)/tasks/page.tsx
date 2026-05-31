'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { TaskWithStatus } from '@praxis/shared'
import { TaskCard } from '@/features/task'
import { Skeleton } from '@/components/ui/skeleton'

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithStatus[] | null>(null)

  useEffect(() => {
    apiClient.getTasks().then(setTasks).catch(console.error)
  }, [])

  if (!tasks) {
    return (
      <div className="p-8 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Tasks</h1>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
