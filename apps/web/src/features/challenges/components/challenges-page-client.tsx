'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import { ChallengeCard } from './challenge-card'
import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  DIFFICULTY_LABEL,
} from '../constants'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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

          <div className="pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {difficulty === 'all' ? 'All levels' : DIFFICULTY_LABEL[difficulty as ChallengeDifficulty]}
                  <IconChevronDown size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {CHALLENGE_DIFFICULTIES.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onSelect={() => updateFilters(category, item)}
                    className="flex items-center justify-between text-sm cursor-pointer"
                  >
                    {item === 'all' ? 'All levels' : DIFFICULTY_LABEL[item as ChallengeDifficulty]}
                    {difficulty === item && <IconCheck size={13} className="text-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
