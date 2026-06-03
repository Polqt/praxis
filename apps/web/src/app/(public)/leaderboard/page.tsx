import type { Metadata } from 'next'
import { LeaderboardClient } from '@/features/profile/components/leaderboard-client'
import type { LeaderboardEntry } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Leaderboard | Praxis',
  description: 'Top verified developers ranked by completed challenges and best score.',
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/leaderboard`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  return res.json()
}

export default async function LeaderboardPage() {
  const entries = await fetchLeaderboard()
  return <LeaderboardClient entries={entries} />
}
