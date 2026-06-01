import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectChallenge } from '@praxis/shared'

export default async function StudioChallengesPage() {
  const challenges = await serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => [])

  return (
    <div className="px-10 py-8 max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Challenges</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Praxis currently verifies one backend engineering standard.
      </p>

      <div className="mt-8 space-y-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardContent className="p-6 flex items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{challenge.title}</h2>
                  <Badge variant="outline">Backend Engineering</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Verification standard for production REST API repositories.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {challenge.rubric.categories.map((category) => (
                    <Badge key={category.name} variant="outline">{category.name}</Badge>
                  ))}
                </div>
              </div>
              <Button asChild>
                <Link href={`/studio/challenges/${challenge.id}`}>View standard</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
