'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'
import type { VerifiedSkill } from '../types'

type Props = {
  skills: VerifiedSkill[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Verified skills</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verified skills yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((skill) => (
            <div key={skill.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconCircleCheckFilled size={14} className="text-green-500 shrink-0" />
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0" suppressHydrationWarning>
                {new Date(skill.awardedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
