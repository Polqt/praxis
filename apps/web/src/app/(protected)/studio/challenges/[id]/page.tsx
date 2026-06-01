import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectChallenge } from '@praxis/shared'

export default async function ChallengeDetailPage(props: PageProps<'/studio/challenges/[id]'>) {
  const { id } = await props.params
  const challenge = await serverApiFetch<ProjectChallenge>(`/challenges/${id}`)

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Badge variant="outline">Backend Engineering</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{challenge.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            This is a verification standard. Submit any backend repository that satisfies the rubric.
          </p>
        </div>
        <Button asChild>
          <Link href={`/studio/submit?challengeId=${challenge.id}`}>Submit repository</Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="font-semibold">Rubric</h2>
          <div className="mt-4 divide-y">
            {challenge.rubric.categories.map((category) => (
              <div key={category.name} className="py-4 flex items-center justify-between gap-6">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">Minimum floor: {category.floor}/10</p>
                </div>
                <Badge variant="outline">{category.weight}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
