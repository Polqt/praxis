import { serverApiFetch } from '@/lib/api.server'
import { ChallengesPageClient } from '@/features/challenges/components/challenges-page-client'
import type { ProjectChallenge, ProjectSubmission } from '@praxis/shared'
import type { Challenge } from '@/features/challenges/types'

const DIFFICULTY_MAP: Record<string, Challenge['difficulty']> = {
  beginner: 'junior',
  intermediate: 'intermediate',
  advanced: 'senior',
}

function toChallenge(raw: ProjectChallenge): Challenge {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.projectType === 'frontend' ? 'frontend' : 'backend',
    difficulty: DIFFICULTY_MAP[raw.difficulty] ?? 'intermediate',
    skills: raw.rubric.categories.map((c) => c.name),
  }
}

export default async function ChallengesPage() {
  const [raw, submissions] = await Promise.all([
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => [] as ProjectChallenge[]),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => [] as ProjectSubmission[]),
  ])

  const challenges = raw.map(toChallenge)

  // Build a map of challengeId → best status for the card indicator
  const submissionStatusMap: Record<string, 'verified' | 'in-progress' | 'attempted'> = {}
  for (const s of submissions) {
    if (s.status === 'verified') {
      submissionStatusMap[s.challengeId] = 'verified'
    } else if (!submissionStatusMap[s.challengeId]) {
      const isActive = ['created', 'queued', 'ingesting', 'analyzing', 'generating_report'].includes(s.status)
      submissionStatusMap[s.challengeId] = isActive ? 'in-progress' : 'attempted'
    }
  }

  return (
    <ChallengesPageClient
      challenges={challenges}
      submissionStatusMap={submissionStatusMap}
    />
  )
}
