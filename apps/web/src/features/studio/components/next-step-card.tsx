'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowRight } from '@tabler/icons-react'
import { fadeUp } from '@/lib/animations'
import type { ProjectChallenge } from '@praxis/shared'

type VerifiedSkill = { skill: { name: string } }

type Props = {
  verifiedSkills: VerifiedSkill[]
  challenges: ProjectChallenge[]
  verifiedChallengeIds: string[]
}

export function NextStepCard({ verifiedSkills, challenges, verifiedChallengeIds }: Props) {
  const earnedSkillNames = new Set(verifiedSkills.map((s) => s.skill.name.toLowerCase()))
  const completedIds = new Set(verifiedChallengeIds)

  // Find a challenge that introduces the most new skills
  const uncompletedChallenges = challenges.filter((c) => !completedIds.has(c.id))
  if (uncompletedChallenges.length === 0) return null

  const scored = uncompletedChallenges.map((c) => {
    const newSkills = c.rubric.categories.filter((cat) => !earnedSkillNames.has(cat.name.toLowerCase()))
    return { challenge: c, newSkillCount: newSkills.length, newSkills: newSkills.map((s) => s.name) }
  })

  scored.sort((a, b) => b.newSkillCount - a.newSkillCount)
  const best = scored[0]
  if (!best || best.newSkillCount === 0) return null

  const earned = verifiedSkills.length
  const gapLabel = best.newSkills.slice(0, 2).join(', ')

  return (
    <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Next step</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {earned > 0
          ? `You've verified ${earned} skill${earned !== 1 ? 's' : ''}. Your next gap: `
          : 'Start with your first challenge. '}
        <span className="text-foreground font-medium">{gapLabel}</span>
        {best.newSkills.length > 2 && ` and ${best.newSkills.length - 2} more`}.
      </p>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{best.challenge.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{best.challenge.difficulty} · {best.challenge.projectType}</p>
        </div>
        <Link
          href={`/challenges/${best.challenge.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:opacity-70 transition-opacity shrink-0"
        >
          View challenge
          <IconArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  )
}
