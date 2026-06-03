import type { Metadata } from 'next'
import { LeaderboardClient } from '@/features/profile/components/leaderboard-client'

export const metadata: Metadata = {
  title: 'Leaderboard | Praxis',
  description: 'Top verified developers ranked by completed challenges and best score.',
}

export default function LeaderboardPage() {
  return <LeaderboardClient />
}
