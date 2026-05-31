'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TasksPage() {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Tasks</h1>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Task-based challenges are being replaced with real project verification.
          </p>
          <Button asChild>
            <Link href="/projects">Browse Challenges</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
