import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { serverApiFetch } from '@/lib/api.server'
import { ProfileClient } from '@/features/profile/components/profile-client'
import type { PublicProfile } from '@/features/profile/types'
import type { User } from '@praxis/shared'

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/profile`,
    { cache: 'no-store' },
  ).then((res) => (res.ok ? res.json() as Promise<PublicProfile> : null)).catch(() => null)

  if (!profile) return { title: 'Profile not found' }

  const verified = profile.reportsCount
  const skills = profile.verifiedSkills.length
  const title = `@${profile.username} | Praxis`
  const description = verified > 0
    ? `${verified} verified project${verified !== 1 ? 's' : ''}, ${skills} skill${skills !== 1 ? 's' : ''} on Praxis.`
    : `${profile.username}'s developer profile on Praxis.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'profile', siteName: 'Praxis' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  const [profile, viewingUser] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/profile`,
      { cache: 'no-store' },
    ).then(async (res) => {
      if (res.status === 404) return null
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json() as Promise<PublicProfile>
    }),
    serverApiFetch<User>('/users/me').catch(() => null),
  ])

  if (!profile) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-170 mx-auto px-6 pt-12 pb-20">
        <div className="mb-10">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Praxis
          </Link>
        </div>
        <ProfileClient profile={profile} viewingUser={viewingUser} />
      </div>
    </div>
  )
}
