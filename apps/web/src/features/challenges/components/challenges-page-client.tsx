'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChallengeCard } from './challenge-card'
import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  DIFFICULTY_LABEL,
} from '../constants'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeSubmissionStatus,
} from '../types'

type Props = {
  challenges: Challenge[]
  submissionStatusMap?: Record<string, ChallengeSubmissionStatus>
}

export function ChallengesPageClient({ challenges, submissionStatusMap = {} }: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [category, setCategory] = useState<ChallengeCategory>(
    searchParams.get('tab') === 'backend' ? 'backend' : 'frontend',
  )
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | 'all'>(() => {
    const value = searchParams.get('difficulty')
    return CHALLENGE_DIFFICULTIES.includes(value as ChallengeDifficulty)
      ? value as ChallengeDifficulty
      : 'all'
  })

  function updateFilters(nextCategory: ChallengeCategory, nextDifficulty: ChallengeDifficulty | 'all') {
    setCategory(nextCategory)
    setDifficulty(nextDifficulty)
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('tab', nextCategory)
      if (nextDifficulty !== 'all') params.set('difficulty', nextDifficulty)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.category === category
    && (difficulty === 'all' || challenge.difficulty === difficulty)
  )

  return (
    <div className="w-full px-6 py-8 md:px-10">
      <div className="max-w-5xl">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Challenges</p>
        <h1 className="mt-2 text-2xl font-semibold">Choose what to verify next</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each challenge defines the rubric, category floors, and passing threshold before you submit.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b">
          <div className="flex">
            {CHALLENGE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateFilters(item, difficulty)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  category === item
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {CATEGORY_LABEL[item] ?? item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 pb-2">
            {CHALLENGE_DIFFICULTIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateFilters(category, item)}
                className={`rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  difficulty === item
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {item === 'all' ? 'All levels' : DIFFICULTY_LABEL[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              submissionStatus={submissionStatusMap[challenge.id]}
            />
          ))}
          {filteredChallenges.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No challenges match these filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
