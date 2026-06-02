import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { UsernameOnboardingClient } from '@/features/onboarding/components/username-onboarding-client'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import type { User } from '@praxis/shared'

export default async function UsernameOnboardingPage() {
  let user: User
  try {
    user = await serverApiFetch<User>('/users/me')
  } catch {
    redirect(buildAuthRedirect('/onboarding/username'))
  }

  if (user.username) redirect('/studio')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-120">
        <div className="mb-8">
          <Link href="/studio" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Praxis
          </Link>
        </div>
        <UsernameOnboardingClient />
      </div>
    </div>
  )
}
