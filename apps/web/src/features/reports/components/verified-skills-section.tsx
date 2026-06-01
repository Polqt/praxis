'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'

const SECTION_LABEL = 'text-xs font-medium uppercase tracking-widest text-muted-foreground'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-4`}>Verified skills</p>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills verified for this submission.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2.5">
              <IconCircleCheckFilled size={14} className="text-green-500 shrink-0" />
              <span className="text-sm font-medium">{skill}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
