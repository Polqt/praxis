'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Verified skills</p>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verified skills yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...skills].sort().map((skill) => (
            <div key={skill} className="flex items-center gap-2">
              <IconCircleCheckFilled size={14} className="text-green-500 shrink-0" />
              <span className="text-sm font-medium">{skill}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
