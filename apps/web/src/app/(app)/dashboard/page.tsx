'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { DashboardStats } from '@praxis/shared'
import { TaskCard } from '@/components/TaskCard'
import { SkillChip } from '@/components/SkillChip'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    apiClient.getDashboard().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="p-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Verified Skills</p>
            <p className="text-4xl font-bold text-foreground">{stats.totalVerified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
            <p className="text-4xl font-bold text-foreground">{stats.totalAttempts}</p>
          </CardContent>
        </Card>
      </div>

      {stats.verifiedSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Your Verified Skills</h2>
          <div className="flex flex-wrap gap-2">
            {stats.verifiedSkills.map((us) => (
              <SkillChip key={us.id} name={us.skill.name} />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3 text-foreground">Tasks</h2>
      {stats.recentTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">No tasks started yet.</p>
            <Button asChild>
              <Link href="/tasks">Browse Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {stats.recentTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
