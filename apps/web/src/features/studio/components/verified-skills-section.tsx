'use client'

import { IconCheck } from '@tabler/icons-react'

const SECTION_LABEL = 'VERIFIED SKILLS'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  return (
    <div className="mb-10">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
        {SECTION_LABEL}
      </p>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-sm text-foreground"
            >
              <IconCheck size={12} className="text-green-600 shrink-0" />
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground">No verified skills yet.</p>
      )}
    </div>
  )
}
