'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  if (skills.length === 0) return null
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Verified skills</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-card text-sm font-medium">
            <IconCircleCheckFilled size={13} className="text-green-500 shrink-0" />
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
