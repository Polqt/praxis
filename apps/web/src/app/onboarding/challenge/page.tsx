import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_LABEL, DIFFICULTY_CLASS } from '@/features/challenges/constants'
import { stripMarkdown } from '@/features/challenges/utils'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import { ConnectGitHubButton } from '@/features/github/components/connect-github-button'
import { IconBrandGithub } from '@tabler/icons-react'
import type { ProjectChallenge, User } from '@praxis/shared'

const DIFFICULTY_MAP: Record<string, string> = {
  beginner: 'junior',
  intermediate: 'intermediate',
  advanced: 'senior',
}

export default async function OnboardingChallengePage() {
  let user: User
  try {
    user = await serverApiFetch<User>('/users/me')
  } catch {
    redirect(buildAuthRedirect('/onboarding/challenge'))
  }

  if (!user.username) redirect('/onboarding/username')

  const [challenges, githubAccount] = await Promise.all([
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => [] as ProjectChallenge[]),
    serverApiFetch<{ connected: boolean }>('/github/account').catch(() => ({ connected: false })),
  ])

  const githubConnected = githubAccount.connected

  const sorted = [...challenges].sort((a, b) => {
    const order: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 }
    return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1)
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <Link href="/studio" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Praxis
          </Link>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">Pick your first challenge</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a challenge that matches a project you&apos;ve already built. You&apos;ll submit a GitHub repository and get a verified report.
        </p>

        {!githubConnected && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
            <IconBrandGithub size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">You&apos;ll need GitHub connected to submit</p>
              <p className="text-xs text-amber-700 mt-0.5 mb-2">Connect it now or on the next step.</p>
              <ConnectGitHubButton nextPath="/onboarding/challenge" label="Connect GitHub" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-6">
          {sorted.map((challenge, i) => {
            const diffKey = DIFFICULTY_MAP[challenge.difficulty] ?? 'intermediate'
            const isRecommended = i === 0
            return (
              <Link
                key={challenge.id}
                href={isRecommended ? `/submit?challengeId=${challenge.id}&recommended=1` : `/submit?challengeId=${challenge.id}`}
                className={[
                  'rounded-lg border bg-card px-5 py-4 hover:bg-accent/30 transition-colors',
                  isRecommended ? 'border-primary/50 ring-1 ring-primary/20' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold">{challenge.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRecommended && (
                      <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm bg-primary/10 text-primary border-primary/30">
                        Recommended
                      </span>
                    )}
                    <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 border rounded-sm ${DIFFICULTY_CLASS[diffKey as keyof typeof DIFFICULTY_CLASS]}`}>
                      {DIFFICULTY_LABEL[diffKey as keyof typeof DIFFICULTY_LABEL]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{stripMarkdown(challenge.description)}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {challenge.rubric.categories.slice(0, 4).map((cat) => (
                    <Badge key={cat.name} variant="outline" className="text-[10px]">{cat.name}</Badge>
                  ))}
                  {challenge.rubric.categories.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">+{challenge.rubric.categories.length - 4} more</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground">
          <Link href="/studio">Skip — go to studio</Link>
        </Button>
      </div>
    </div>
  )
}
