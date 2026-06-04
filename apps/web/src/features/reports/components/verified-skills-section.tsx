'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Verified skills</p>
      <p className="text-xs text-muted-foreground mb-3">Awarded for scoring above the floor threshold in each category.</p>
      {skills.length === 0 ? (
        <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Skills unlock when a submission is verified. Use the category progress below to see what still needs improvement.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-card text-sm font-medium">
              <IconCircleCheckFilled size={13} className="text-green-500 shrink-0" />
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
