import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { ChallengesClient } from '@/features/challenges/components/challenges-client'
import { ChallengesPublicPage } from '@/features/challenges/components/challenges-public-page'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { Sidebar } from '@/shared/components/sidebar'
import { UserProvider } from '@/features/user/hooks/use-user-context'
import type { GitHubAccount, User, ProjectChallenge } from '@praxis/shared'
import type { Challenge } from '@/features/challenges/types'

function toChallenge(raw: ProjectChallenge): Challenge {
  return {
    id: raw.id,
    slug: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.projectType === 'frontend' ? 'frontend' : 'backend',
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
    const [user, githubAccount] = await Promise.all([
      serverApiFetch<User>('/users/me'),
      serverApiFetch<GitHubAccount>('/github/account').catch(
        () => ({ connected: false } as GitHubAccount),
      ),
    ])

    return (
      <UserProvider user={user}>
        <div className="h-screen flex bg-background overflow-hidden">
          <Sidebar user={user} githubAccount={githubAccount} />
          <main className="flex-1 overflow-y-auto px-12 py-10">
            <ChallengesClient challenges={challenges} isAuthenticated={true} />
          </main>
        </div>
      </UserProvider>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <ChallengesPublicPage challenges={challenges} />
      </main>
      <SiteFooter />
    </div>
  )
}
