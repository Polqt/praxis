import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { ChallengesClient } from '@/features/challenges/components/challenges-client'
import { ChallengesPublicPage } from '@/features/challenges/components/challenges-public-page'
import type { ProjectChallenge } from '@praxis/shared'
import type { Challenge } from '@/features/challenges/types'

function toChallenge(raw: ProjectChallenge): Challenge {
  return {
    id: raw.id,
    slug: raw.id,
    title: raw.title,
    description: raw.description,
    category: 'backend',
    difficulty: 'intermediate',
    skills: raw.rubric.categories.map((c) => c.name),
  }
}

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isAuthenticated = !!authUser

  const raw = await serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => [] as ProjectChallenge[])
  const challenges = raw.map(toChallenge)

  if (isAuthenticated) {
    return (
      <main className="flex-1 px-12 py-10">
        <ChallengesClient challenges={challenges} isAuthenticated={true} />
      </main>
    )
  }

  return <ChallengesPublicPage challenges={challenges} />
}
